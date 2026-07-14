"""
Family B — structured Q&A (GS Responses).

Pipeline: Draft -> Critic -> [Edit if needed, single pass only] -> Relint -> done.
Includes programmatic word count validation to ensure each response is under 150 words.
"""

import re
from llm import groq_client, gemini_client
from utils.relint import relint


def parse_answers(text: str) -> list[str]:
    """
    Attempts to split the text into individual answer segments.
    Uses regex to look for typical Q&A structures (e.g. 'Answer 1:', 'Response 1:').
    If regex fails to find 4 distinct answers, falls back to splitting by paragraphs or double newlines.
    """
    # Try parsing using standard Answer/Response headers
    pattern = re.compile(
        r"(?:Answer|Response|Q&A|Question|Q)\s*[1-4]\s*:\s*(.*?)(?=\n*(?:Answer|Response|Q&A|Question|Q|Q[1-4]|Question\s*[1-4])\s*[1-4]:|$)",
        re.IGNORECASE | re.DOTALL
    )
    matches = pattern.findall(text)
    
    # Clean matches
    cleaned_answers = [m.strip() for m in matches if m.strip()]
    
    if len(cleaned_answers) == 4:
        return cleaned_answers
        
    # Fallback: split by paragraphs and filter out headers
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    candidate_answers = []
    for p in paragraphs:
        # Ignore lines that look like headers/questions
        if p.lower().startswith(("question 1", "question 2", "question 3", "question 4", "q1", "q2", "q3", "q4")):
            continue
        candidate_answers.append(p)
        
    return candidate_answers


def run(manifest: dict, fact_sheet: dict) -> dict:
    draft_text = groq_client.draft(manifest, fact_sheet)
    critic_result = gemini_client.critique(manifest, draft_text, fact_sheet)

    final_text = draft_text
    edited = False

    if not critic_result["passed"]:
        final_text = groq_client.edit(manifest, draft_text, critic_result)
        edited = True

    residual_flags = relint(final_text, manifest)
    
    # Programmatic Word Count Audit (Linter)
    answers = parse_answers(final_text)
    for idx, ans in enumerate(answers, start=1):
        word_count = len(ans.split())
        if word_count > 150:
            residual_flags.append(f"Answer {idx} exceeds 150-word limit ({word_count} words)")

    return {
        "text": final_text,
        "family": "B",
        "llm_calls": 3 if edited else 2,
        "critic_score": critic_result["score"],
        "critic_flags": critic_result["flags"],
        "residual_flags": residual_flags,
        "edited": edited,
        "needs_human_review": bool(residual_flags),
    }
