"""
Family B — structured Q&A (GS Responses).

Pipeline: Draft -> Critic -> [Edit Loop, max 3 passes] -> Relint -> done.
Includes programmatic word count validation to ensure each response is under 150 words.
"""

import re
from llm import groq_client, gemini_client
from knowledge.groq_client import GenerationUnavailableError
from utils.relint import relint


def parse_answers(text: str, structure: list) -> list[str]:
    """
    Attempts to split the text into individual answer segments.
    Uses manifest section names dynamically, falling back to standard Q&A headers.
    """
    sections = [s.get("section", "") for s in structure]
    escaped_sections = [re.escape(sec) for sec in sections if sec]
    
    # Fallback default headers
    default_headers = ["Answer", "Response", "Q&A", "Question", "Q"]
    all_headers = escaped_sections + default_headers
    
    # Pattern: matches any header, captures everything until the next header or end of text
    pattern_str = (
        r"(?:" + "|".join(all_headers) + r")\s*[1-9]?\s*[:.-]?\s*(.*?)(?=\n*(?:" + 
        "|".join(all_headers) + r")\s*[1-9]?\s*[:.-]|$)"
    )
    
    pattern = re.compile(pattern_str, re.IGNORECASE | re.DOTALL)
    matches = pattern.findall(text)
    cleaned_answers = [m.strip() for m in matches if m.strip()]
    
    if len(cleaned_answers) == len(structure):
        return cleaned_answers
        
    # Fallback: split by paragraphs and filter out header-like lines
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    candidate_answers = []
    for p in paragraphs:
        p_lower = p.lower()
        # Ignore lines that look like headers/questions
        if any(p_lower.startswith(f"{prefix}{i}") for i in range(1, 10) for prefix in ("question ", "question", "q ", "q")):
            continue
        if any(p_lower.startswith(sec.lower()) for sec in sections if sec):
            continue
        candidate_answers.append(p)
        
    return candidate_answers


def run(manifest: dict, fact_sheet: dict) -> dict:
    try:
        draft_text, draft_model = groq_client.draft(manifest, fact_sheet)
    except GenerationUnavailableError as e:
        return {
            "text": None,
            "family": "B",
            "llm_calls": 0,
            "needs_human_review": True,
            "generation_failed": True,
            "failure_reason": str(e),
            "model_used": {"draft": "none", "critic": "none", "edit": "none", "humanizer": "none"},
        }
    
    # Run cheap relint first before the paid Gemini Critic call to fail cheap
    draft_flags = relint(draft_text, manifest)
    if draft_flags:
        critic_result = {
            "score": 50,
            "flags": [f"Banned phrase detected in draft: {p}" for p in draft_flags],
            "passed": False,
            "model_used": "local_relint_precheck",
            "critic_type": "precheck_only"
        }
        pinned_critic_provider = None
    else:
        critic_result = gemini_client.critique(manifest, draft_text, fact_sheet)
        critic_result["critic_type"] = "llm_judged"
        pinned_critic_provider = critic_result.get("model_used")

    final_text = draft_text
    edit_count = 0
    edit_model = "none"
    pass_threshold = 82
    max_edit_loops = 3

    while critic_result["score"] < pass_threshold and edit_count < max_edit_loops:
        final_text, edit_model = groq_client.edit(manifest, final_text, critic_result, fact_sheet)
        edit_count += 1
        try:
            critic_result = gemini_client.critique(
                manifest, final_text, fact_sheet,
                required_provider=pinned_critic_provider
            )
            critic_result["critic_type"] = "llm_judged"
        except Exception as e:
            critic_result["critic_type"] = "precheck_only_post_edit_failed"
            critic_result["needs_human_review_reason"] = f"Re-critique failed on loop {edit_count}: {e}"
            break

    hit_threshold = critic_result["score"] >= pass_threshold and critic_result["critic_type"] == "llm_judged"
    residual_flags = relint(final_text, manifest)
    
    # Programmatic Word Count Audit (Linter)
    structure = manifest.get("structure", [])
    num_questions = len(structure)
    answers = parse_answers(final_text, structure)
    for idx, ans in enumerate(answers, start=1):
        word_count = len(ans.split())
        limit = 150  # Default fallback
        if idx - 1 < len(structure):
            limit = structure[idx - 1].get("word_limit", 150)
        if word_count > limit:
            residual_flags.append(f"Answer {idx} exceeds {limit}-word limit ({word_count} words)")

    return {
        "text": final_text,
        "family": "B",
        "llm_calls": 2 + (edit_count * 2),
        "critic_score": critic_result["score"],
        "critic_type": critic_result["critic_type"],
        "critic_flags": critic_result.get("flags", []),
        "residual_flags": residual_flags,
        "edit_loops_used": edit_count,
        "hit_threshold": hit_threshold,
        "needs_human_review": bool(residual_flags) or not hit_threshold,
        "model_used": {
            "draft": draft_model,
            "critic": critic_result["model_used"],
            "edit": edit_model,
            "humanizer": "none"
        }
    }
