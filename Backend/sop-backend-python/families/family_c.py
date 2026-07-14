"""
Family C — structured plan (Study Plan).

Pipeline: Draft -> Critic -> [Edit if needed, single pass only] -> Relint -> done.
Specifically tailored for roadmap documents with rigid structure guidelines.
"""

from llm import groq_client, gemini_client
from utils.relint import relint


def run(manifest: dict, fact_sheet: dict) -> dict:
    draft_text = groq_client.draft(manifest, fact_sheet)
    critic_result = gemini_client.critique(manifest, draft_text, fact_sheet)

    final_text = draft_text
    edited = False

    if not critic_result["passed"]:
        final_text = groq_client.edit(manifest, draft_text, critic_result)
        edited = True

    residual_flags = relint(final_text, manifest)

    return {
        "text": final_text,
        "family": "C",
        "llm_calls": 3 if edited else 2,
        "critic_score": critic_result["score"],
        "critic_flags": critic_result["flags"],
        "residual_flags": residual_flags,
        "edited": edited,
        "needs_human_review": bool(residual_flags),
    }
