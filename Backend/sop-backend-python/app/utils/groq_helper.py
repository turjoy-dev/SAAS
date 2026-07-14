import httpx
import asyncio
from app import config

async def call_groq_with_retry(
    model: str,
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    retries: int = 5,
    base_delay: float = 2.0
) -> str:
    if not config.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured in .env file.")

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
                        "Authorization": f"Bearer {config.GROQ_API_KEY}",
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
                    sleep_time = base_delay * 3 * attempt if is_rate_limit else base_delay * attempt
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
                
    raise RuntimeError("Groq API call failed after maximum retries")
