"""
Gemini Flash critic. Cheap gatekeeper — catches deterministic-ish issues
(banned phrases, red flags, missing evidence, weak fit) before an
expensive Sonnet edit is triggered. Returns a rubric score, not just a
flag list, restoring the 80-point delivery gate from the original
writing engine design.
"""

import json
import re
import os
import asyncio
from app import config
from app.utils.gemini_client import call_gemini_rest

try:
    import google.generativeai as genai
    # Use API key from env if available
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)
    else:
        genai.configure()
    HAS_GENAI = True
except (ImportError, AttributeError):
    HAS_GENAI = False

MODEL = config.GEMINI_SCORING_MODEL or "gemini-1.5-flash"
PASS_THRESHOLD = 80

CRITIC_TEMPLATE = """You are a strict visa-document critic for a {country} \
{doc_type} application. Score the document from 0 to 100 against:
- the red flags listed below
- the banned phrases listed below
- the quality checklist listed below
- consistency between the document and the applicant fact sheet

Deduct heavily for any banned phrase, any red flag pattern, or any claim \
in the document that is not supported by the fact sheet.

Red flags: {red_flags}
Banned phrases: {banned_phrases}
Quality checklist: {quality_checklist}

Applicant fact sheet:
{fact_sheet}

Document to review:
{draft_text}

Return ONLY valid JSON, no markdown code fences, in exactly this shape:
{{"score": <integer 0-100>, "flags": ["<short specific issue>", ...]}}
If there are no issues, return an empty flags list.
"""

def run_sync(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    if loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, coro)
            return future.result()
    else:
        return loop.run_until_complete(coro)

def critique(manifest: dict, draft_text: str, fact_sheet: dict) -> dict:
    prompt = CRITIC_TEMPLATE.format(
        country=manifest.get("country", ""),
        doc_type=manifest.get("doc_type", ""),
        red_flags=manifest.get("red_flags", []),
        banned_phrases=manifest.get("banned_phrases", []),
        quality_checklist=manifest.get("quality_checklist", []),
        fact_sheet=fact_sheet,
        draft_text=draft_text,
    )

    # Determine if we should use REST client (highly reliable, no external package dependency)
    use_rest = not HAS_GENAI or not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    
    raw = ""
    if not use_rest:
        try:
            model = genai.GenerativeModel(MODEL)
            resp = model.generate_content(prompt)
            raw = resp.text.strip()
        except Exception as e:
            print(f"⚠️ google.generativeai failed: {e}. Falling back to REST client.")
            use_rest = True
            
    if use_rest or not raw:
        raw = run_sync(call_gemini_rest(
            model=MODEL,
            system_instruction="You are a strict visa-document critic. Return JSON only.",
            prompt=prompt,
            json_mode=True
        )).strip()

    raw = re.sub(r"^```json|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Critic response was unparseable — treat as a hard fail, not a
        # silent pass. This routes to the Edit stage (or error log for
        # Family D) rather than shipping an unreviewed document.
        result = {"score": 0, "flags": ["critic_response_unparseable"]}

    result.setdefault("score", 0)
    result.setdefault("flags", [])
    result["passed"] = result["score"] >= PASS_THRESHOLD and not result["flags"]
    return result
