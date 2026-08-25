import httpx
from app import config
from app.utils.gemini_client import call_gemini_rest
from app.utils.groq_helper import call_groq_with_retry

async def groq_call(system: str, user: str, max_tokens: int = 1000) -> str:
    """
    Adapter: routes evaluation/auditing to Gemini (json mode aware),
    drafting/revision to Groq, with Gemini as fallback.
    Provider policy (per .agents/AGENTS.md): Groq → Gemini only. No Anthropic.
    """
    system_lower = (system or "").lower()
    user_lower = (user or "").lower()
    is_evaluation = any(keyword in system_lower for keyword in ["auditor", "scorer", "audit", "score"])

    if is_evaluation:
        # Route to Gemini for structured scoring/audit.
        json_mode = "json" in system_lower or "json" in user_lower
        result = await call_gemini_rest(
            model=config.GEMINI_SCORING_MODEL,
            system_instruction=system,
            prompt=user,
            json_mode=json_mode
        )
        return result.strip()

    # Drafting / revision path — Groq first, Gemini fallback.
    if config.GROQ_API_KEY:
        model = config.GROQ_GENERATOR_MODEL
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
        result = await call_groq_with_retry(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=max_tokens
        )
        return result.strip()

    # Fallback: Gemini.
    result = await call_gemini_rest(
        model=config.GEMINI_DRAFT_MODEL or "gemini-2.5-flash",
        system_instruction=system,
        prompt=user
    )
    return result.strip()
