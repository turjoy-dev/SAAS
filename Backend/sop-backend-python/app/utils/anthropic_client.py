import asyncio
import json
import logging
from app import config
from knowledge.prompt_builder import build_cached_system_block

logger = logging.getLogger(__name__)

async def polish_with_claude(manifest: dict, fact_sheet: dict, result: dict) -> dict:
    """
    Optional final polish step using Claude Sonnet 4.6 with Anthropic Prompt Caching.
    Feature-flagged via ENABLE_CLAUDE_POLISH.
    If disabled or ANTHROPIC_API_KEY is missing, this is a true no-op (0 API calls).
    """
    # 1. Feature Flag Guard Check (First line - true no-op when disabled)
    if not getattr(config, "ENABLE_CLAUDE_POLISH", False) or not getattr(config, "ANTHROPIC_API_KEY", ""):
        return result

    draft_text = result.get("text", "")
    if not draft_text.strip():
        return result

    try:
        from anthropic import AsyncAnthropic
    except ImportError:
        logger.warning("⚠️ anthropic SDK not installed. Skipping Claude polish pass.")
        return result

    try:
        client = AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)
        
        # 2. Static Cached System Block (Zero user/fact_sheet leakage)
        system_block = build_cached_system_block(manifest)
        
        # 3. Dynamic User Message Turn
        user_prompt = (
            f"Applicant Fact Sheet Data:\n{json.dumps(fact_sheet, indent=2, ensure_ascii=False)}\n\n"
            f"Draft Document Content to Polish:\n\"\"\"\n{draft_text}\n\"\"\"\n\n"
            "POLISH INSTRUCTIONS:\n"
            "Perform a final quality and stylistic polish on the draft document above. Focus specifically on:\n"
            "1. Removing any repeated ideas or duplicated claims across paragraphs.\n"
            "2. Eliminating vague hedging phrases (e.g. 'I am confident that', 'I believe that', 'I have a clear understanding').\n"
            "3. Replacing generic university praise with specific named modules, labs, or faculty initiatives supported by the fact sheet.\n"
            "4. Preserving all factual details (names, degrees, dates, CGPA, numbers) without changing any facts.\n\n"
            "Return ONLY the final polished document text — no commentary, no preamble, no markdown wrap."
        )

        messages = [
            {"role": "user", "content": user_prompt}
        ]

        model_name = getattr(config, "CLAUDE_POLISH_MODEL", "claude-sonnet-4-6")

        # 4. Hard 15-second timeout API call
        response = await asyncio.wait_for(
            client.messages.create(
                model=model_name,
                max_tokens=3000,
                system=system_block,
                messages=messages,
                temperature=0.3
            ),
            timeout=15.0
        )

        # 5. Extract content
        polished_text = ""
        if response.content and len(response.content) > 0:
            polished_text = response.content[0].text.strip()

        if polished_text:
            result["text"] = polished_text
            result["claude_polished"] = True

        # 6. Usage & Cost Visibility Metrics
        usage = getattr(response, "usage", None)
        cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
        cache_creation = getattr(usage, "cache_creation_input_tokens", 0) or 0
        input_tokens = getattr(usage, "input_tokens", 0) or 0
        output_tokens = getattr(usage, "output_tokens", 0) or 0

        # Cost calculation ($/1M tokens) for Sonnet 4.6 / 3.7
        # Input: $3.00, Cache Write: $3.75, Cache Read: $0.30, Output: $15.00
        non_cached_cost = ((input_tokens + cache_read + cache_creation) * 0.000003) + (output_tokens * 0.000015)
        actual_cost = (input_tokens * 0.000003) + (cache_creation * 0.00000375) + (cache_read * 0.0000003) + (output_tokens * 0.000015)
        cost_savings = max(0.0, non_cached_cost - actual_cost)

        cost_log = (
            f"📊 [CLAUDE POLISH COST] doc_type={manifest.get('doc_type')} country={manifest.get('country')} | "
            f"cache_read={cache_read} cache_creation={cache_creation} input={input_tokens} output={output_tokens} | "
            f"actual_cost=${actual_cost:.6f} (estimated savings=${cost_savings:.6f})"
        )
        print(cost_log)
        logger.info(cost_log)

        tokens_used = result.get("tokens_used")
        if not isinstance(tokens_used, dict):
            tokens_used = {"llm_calls": result.get("llm_calls", 0)}
        
        tokens_used["claude_cache_read_tokens"] = cache_read
        tokens_used["claude_cache_creation_tokens"] = cache_creation
        tokens_used["claude_input_tokens"] = input_tokens
        tokens_used["claude_output_tokens"] = output_tokens
        tokens_used["claude_cost_savings"] = cost_savings
        result["tokens_used"] = tokens_used

        if isinstance(result.get("model_used"), dict):
            result["model_used"]["polish"] = model_name
        else:
            result["model_used"] = f"{result.get('model_used', 'groq')}+{model_name}"

    except Exception as err:
        error_msg = f"⚠️ [CLAUDE POLISH FAILED/TIMEOUT]: {err}. Returning pre-Claude Groq content."
        print(error_msg)
        logger.warning(error_msg)
        # Never block or fail the generation pipeline

    return result
