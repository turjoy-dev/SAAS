"""
Family D — issue-explanation (LOE, Gap Explanation).

Pipeline: Draft -> Critic -> Relint -> done. No Edit stage — these
documents are short enough that a 3rd LLM call isn't justified by the
document's complexity. If the critic flags something, it's logged for
human review, not auto-corrected. See RULES.md section 2.
"""

from llm import groq_client, gemini_client
from utils.relint import relint


def run(manifest: dict, fact_sheet: dict) -> dict:
    draft_text = groq_client.draft(manifest, fact_sheet)
    critic_result = gemini_client.critique(manifest, draft_text, fact_sheet)
    residual_flags = relint(draft_text, manifest)

    return {
        "text": draft_text,
        "family": "D",
        "llm_calls": 2,
        "critic_score": critic_result["score"],
        "critic_flags": critic_result["flags"],
        "residual_flags": residual_flags,
        "edited": False,
        "needs_human_review": (not critic_result["passed"]) or bool(residual_flags),
    }
