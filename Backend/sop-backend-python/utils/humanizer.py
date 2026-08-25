"""
Humanizer utility utilizing blader/humanizer rules to polish AI-generated text.
"""

import asyncio
import json
from pathlib import Path
from app import config
from app.utils.groq_helper import call_groq_with_retry
from app.utils.gemini_client import call_gemini_rest

def _load_union_banned_phrases() -> set[str]:
    banned_union = set()
    manifests_dir = Path(__file__).resolve().parents[1] / "knowledge" / "manifests"
    if manifests_dir.exists():
        for country_dir in manifests_dir.iterdir():
            if country_dir.is_dir():
                core_json = country_dir / "core.json"
                if core_json.exists():
                    try:
                        with open(core_json, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            banned = data.get("banned_phrases", [])
                            for b in banned:
                                if b.strip():
                                    banned_union.add(b.lower().strip())
                    except Exception:
                        pass
    return banned_union

_union_banned = _load_union_banned_phrases()
_banned_instruction = ""
if _union_banned:
    _banned_instruction = f"\n9. Additional Banned Words/Phrases (you MUST NOT use these in your output): {', '.join(sorted(_union_banned))}\n"

HUMANIZER_SYSTEM_PROMPT = f"""You are a professional writing editor that identifies and removes signs of AI-generated text to make writing sound more natural and human. Your instructions are based on Wikipedia's "Signs of AI writing" guide.

Avoid these content and style patterns:
1. Undue Emphasis on Significance: stands/serves as, is a testament/reminder, vital/significant role, deeply rooted, etc.
2. Vague Attributions: "Industry reports", "Observers have cited", "Experts believe", etc. Use specific evidence.
3. Superficial Analyses with -ing Endings: "...highlighting...", "...ensuring...", "...fostering...". Use direct active verbs.
4. Promotional/Ad-like Tone: "boasts a", "vibrant", "nestled in the heart of", "breathtaking", "stunning". Keep tone neutral.
5. AI Vocabulary Words: delve, additionally, crucial, enduring, enhance, interplay, intricacies, tapestry, vibrancy, underscore, pivotal.
6. Copula Avoidance: Simple is/are is preferred over "serves as", "boasts", or "stands as".
7. Negative Parallelisms: Overuse of "not only... but also..." or tailing negations (e.g. "no guessing").
8. Rule of Three: Tacking three clauses or lists of three nouns to appear comprehensive.{_banned_instruction}

Rewrite instructions:
- Replace AI-isms with natural, varied alternatives.
- Keep the core message, facts, and structure intact.
- Do not lose or truncate the facts or evidence.
- Vary sentence length and structure to have a natural rhythm.
- Return ONLY the final, polished humanized text. Do not add any preamble, explanation, or conversational intro/outro.
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

def humanize(text: str, manifest: dict = None, hedging_pass: bool = False) -> tuple[str, str]:
    if getattr(config, "USE_MOCK_LLM", False):
        from app.utils.mock_llm import mock_llm
        return mock_llm.humanize(text)
        
    if not text:
        return text, "none"

    # Define post-processing helper that calls deterministic humanizer
    from knowledge.humanizer import humanize as rule_humanize
    def post_process(t: str) -> str:
        return rule_humanize(t, manifest)

    extra_instruction = ""
    if hedging_pass:
        extra_instruction = (
            "\n\nCRITICAL HEDGING CLEANUP DIRECTIVE: The text contains filler hedging phrases "
            "(e.g., 'I am confident that', 'I have a clear understanding', 'I firmly believe'). "
            "Rewrite these into direct, assertive, evidence-backed statements without losing any factual details."
        )

    user_prompt = f"Please humanize the following text, removing all AI tells while preserving all factual details:\n\n{text}{extra_instruction}"

    # 1. Try Groq Llama-70b first
    if config.GROQ_API_KEY:
        try:
            messages = [
                {"role": "system", "content": HUMANIZER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ]
            model_name = config.GROQ_GENERATOR_MODEL or "llama-3.3-70b-versatile"
            res_text = run_sync(call_groq_with_retry(
                model=model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=2500
            ))
            return post_process(res_text), model_name
        except Exception as e:
            print(f"⚠️ Groq Llama-70b humanizer failed: {e}. Falling back to Llama-8b on Groq...")
            # Try Llama-8b
            try:
                res_text = run_sync(call_groq_with_retry(
                    model="llama-3.1-8b-instant",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2500
                ))
                return post_process(res_text), "llama-3.1-8b-instant"
            except Exception as e_8b:
                print(f"⚠️ Groq Llama-8b humanizer failed: {e_8b}. Falling back to Gemini...")

    # 2. Try Gemini
    if config.GEMINI_API_KEY:
        try:
            model_name = config.GEMINI_DRAFT_MODEL or "gemini-2.5-flash"
            res_text = run_sync(call_gemini_rest(
                model=model_name,
                system_instruction=HUMANIZER_SYSTEM_PROMPT,
                prompt=user_prompt
            ))
            return post_process(res_text), model_name
        except Exception as e_gem:
            print(f"⚠️ Gemini humanizer fallback failed: {e_gem}")
            
    # If all failed, return the original text as a last-resort fail-safe so the pipeline doesn't crash!
    print("⚠️ All humanizer models failed/exhausted. Returning original draft text to prevent crash.")
    return post_process(text), "original_draft_fallback"
