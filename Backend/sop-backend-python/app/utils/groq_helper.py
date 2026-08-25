import httpx
import asyncio
import re
import time
from app import config

# module-level state, reset per process or per batch run
_groq_model_cooldown: dict[str, float] = {}  # model -> unix timestamp when it's usable again

def _is_on_cooldown(model: str) -> bool:
    until = _groq_model_cooldown.get(model)
    return until is not None and time.time() < until

def _set_cooldown(model: str, delay_seconds: float):
    _groq_model_cooldown[model] = time.time() + delay_seconds

def parse_retry_delay(error_msg: str) -> float:
    """
    Parses Groq's 429 error message to extract the required wait time in seconds.
    Supports minutes and seconds formats like "28m36.76s" or standard "6.73s".
    """
    # Look for "try again in XmYs" or "try again in Ys"
    match = re.search(r"try again in (?:(\d+)m)?(\d+(?:\.\d+)?)s", error_msg, re.IGNORECASE)
    if match:
        minutes = float(match.group(1) or 0)
        seconds = float(match.group(2) or 0)
        return minutes * 60.0 + seconds
    
    # Look for "try again in XXXms"
    match_ms = re.search(r"try again in (\d+)ms", error_msg, re.IGNORECASE)
    if match_ms:
        return float(match_ms.group(1)) / 1000.0
        
    return 6.0  # Safe default if parsing fails

async def call_groq_with_retry(
    model: str,
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    retries: int = 5,
    base_delay: float = 2.0,
    api_key: str = None
) -> str:
    if _is_on_cooldown(model):
        raise RuntimeError(f"{model} is currently on cooldown due to quota exhaustion. Triggering fallback immediately.")

    keys_to_try = []
    if api_key:
        keys_to_try.append(api_key)
    else:
        if config.GROQ_API_KEY:
            keys_to_try.append(config.GROQ_API_KEY)
        if getattr(config, "GROQ_API_KEY_2", None) and config.GROQ_API_KEY_2 != config.GROQ_API_KEY:
            keys_to_try.append(config.GROQ_API_KEY_2)

    if not keys_to_try:
        raise ValueError("GROQ_API_KEY is not configured in .env file.")

    last_exception = None
    for current_key in keys_to_try:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                for attempt in range(1, retries + 1):
                    try:
                        response = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            json={
                                "model": model,
                                "messages": messages,
                                "temperature": temperature,
                                "max_tokens": max_tokens
                            },
                            headers={
                                "Authorization": f"Bearer {current_key}",
                                "Content-Type": "application/json"
                            }
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            return data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        
                        status = response.status_code
                        try:
                            err_json = response.json()
                            msg = err_json.get("error", {}).get("message", "")
                        except Exception:
                            msg = response.text
                        
                        is_rate_limit = status == 429 or "rate" in msg.lower() or "quota" in msg.lower() or "limit" in msg.lower()
                        is_unavailable = status in [502, 503, 504]
                        
                        if (is_rate_limit or is_unavailable) and attempt < retries:
                            if is_rate_limit:
                                retry_after = response.headers.get("retry-after")
                                if retry_after:
                                    try:
                                        delay = float(retry_after)
                                    except ValueError:
                                        delay = parse_retry_delay(msg)
                                else:
                                    delay = parse_retry_delay(msg)

                                if delay > 15.0:
                                    _set_cooldown(model, delay)
                                    raise RuntimeError(f"Groq daily rate limit hit on {model} (wait: {delay:.1f}s). Cooldown set.")
                                
                                sleep_time = delay + 0.5
                                print(f"⚠️ Groq API Rate Limit (429) hit. Dynamic sleep for {sleep_time:.2f}s before retry {attempt}/{retries}... Detail: {msg}")
                            else:
                                sleep_time = base_delay * attempt
                                print(f"⚠️ Groq API error ({status}). Retrying attempt {attempt}/{retries} in {sleep_time}s... Detail: {msg}")
                            
                            await asyncio.sleep(sleep_time)
                            continue
                        
                        raise RuntimeError(f"Groq API call failed with status {status}: {msg}")
                        
                    except httpx.RequestError as exc:
                        if attempt < retries:
                            sleep_time = base_delay * attempt
                            print(f"⚠️ Groq request exception. Retrying attempt {attempt}/{retries} in {sleep_time}s... Exception: {exc}")
                            await asyncio.sleep(sleep_time)
                            continue
                        raise exc
        except Exception as key_err:
            last_exception = key_err
            print(f"⚠️ Groq key execution failed: {key_err}. Attempting fallback key if available...")
            continue
                
    if last_exception:
        raise last_exception
    raise RuntimeError("Groq API call failed after trying all configured keys.")
