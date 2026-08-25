"""
Family A — narrative (SOP, Personal Statement, Motivation Letter).

Pipeline: Draft -> Critic -> [Edit Loop, max 3 passes] -> Relint -> done.
"""

from llm import groq_client, gemini_client
from knowledge.groq_client import GenerationUnavailableError
from utils.relint import relint
from utils.humanizer import humanize


def run(manifest: dict, fact_sheet: dict) -> dict:
    try:
        draft_text, draft_model = groq_client.draft(manifest, fact_sheet)
    except GenerationUnavailableError as e:
        return {
            "text": None,
            "family": "A",
            "llm_calls": 0,
            "needs_human_review": True,
            "generation_failed": True,
            "failure_reason": str(e),
            "model_used": {"draft": "none", "critic": "none", "edit": "none", "humanizer": "none"},
        }
    
    # Step 5: Duplicate Detection & Single Reroll Logic (BEFORE Critic stage for anti-hallucination safety)
    dedup_check_failed = False
    run_reroll = False
    try:
        from app.services.vector_dedup import vector_dedup_service
        import asyncio
        country = manifest.get("country", "")
        doc_type = manifest.get("doc_type", "")
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, vector_dedup_service.check_duplicate(draft_text, country, doc_type))
                is_duplicate, similarity, dedup_failed = future.result()
        else:
            is_duplicate, similarity, dedup_failed = loop.run_until_complete(vector_dedup_service.check_duplicate(draft_text, country, doc_type))
            
        dedup_check_failed = dedup_failed
        if is_duplicate:
            run_reroll = True
    except Exception as dedup_err:
        import logging
        logging.error(f"[CRITICAL] Cross-user duplicate detection lookup failure: {dedup_err}", exc_info=True)
        dedup_check_failed = True

    if run_reroll:
        # Trigger single draft reroll with divergence directive BEFORE critic stage
        divergence_manifest = dict(manifest)
        divergence_manifest["divergence_directive"] = (
            "DIVERGENCE DIRECTIVE: A similar document structure was detected. "
            "Vary sentence structure, transition phrasing, and paragraph framing significantly while retaining all exact facts."
        )
        # This will propagate hard generation failures (e.g. GenerationUnavailableError)
        draft_text, draft_model = groq_client.draft(divergence_manifest, fact_sheet)
    
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
    max_edit_loops = 1

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

    final_text, humanizer_model = humanize(final_text, manifest)
    
    # Hedging phrase relint check
    from knowledge.relint import detect_hedging
    if detect_hedging(final_text):
        final_text, humanizer_model = humanize(final_text, manifest, hedging_pass=True)
        
    residual_flags = relint(final_text, manifest)
    post_humanize_hedges = detect_hedging(final_text)
    if post_humanize_hedges:
        for h in post_humanize_hedges:
            flag_msg = f"Hedging phrase present in final output: '{h}'"
            if flag_msg not in residual_flags:
                residual_flags.append(flag_msg)

    return {
        "text": final_text,
        "family": "A",
        "llm_calls": 2 + (edit_count * 2),
        "critic_score": critic_result["score"],
        "critic_type": critic_result["critic_type"],
        "critic_flags": critic_result.get("flags", []),
        "residual_flags": residual_flags,
        "edit_loops_used": edit_count,
        "hit_threshold": hit_threshold,
        "needs_human_review": bool(residual_flags) or not hit_threshold,
        "dedup_check_failed": dedup_check_failed,
        "model_used": {
            "draft": draft_model,
            "critic": critic_result["model_used"],
            "edit": edit_model,
            "humanizer": humanizer_model
        }
    }
