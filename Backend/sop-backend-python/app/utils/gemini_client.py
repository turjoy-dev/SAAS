import httpx
import asyncio
import time
from app import config

_gemini_cooldown_until: float | None = None

def _gemini_on_cooldown() -> bool:
    return _gemini_cooldown_until is not None and time.time() < _gemini_cooldown_until

async def call_gemini_rest(model: str, system_instruction: str, prompt: str, json_mode: bool = False) -> str:
    global _gemini_cooldown_until
    if _gemini_on_cooldown():
        raise RuntimeError("Gemini is on cooldown (daily project quota exhausted). Skipping retries.")

    if not config.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env file.")
    
    # Use standard models/prefix if not present
    model_name = model if "/" in model else f"models/{model}"
    url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={config.GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [
                {"text": system_instruction}
            ]
        }
        
    if json_mode:
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
        
    retries = 2
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(1, retries + 1):
            try:
                response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if response.status_code == 200:
                    res_json = response.json()
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                    return ""
                
                if response.status_code == 429:
                    try:
                        body = response.json()
                        details = body.get("error", {}).get("details", [{}])
                    except Exception:
                        body, details = {}, [{}]
                    
                    # Bypass daily cooldown lockout to prevent transient RPM limits from locking out the system
                    is_daily = False
                    if is_daily:
                        _gemini_cooldown_until = time.time() + 3600  # 1 hour cooldown
                        raise RuntimeError("Gemini daily free-tier quota exhausted. Cooldown set.")
                    
                    # Otherwise handle transient limits
                    delay = 5.0
                    for d in details:
                        if isinstance(d, dict) and "retryDelay" in d:
                            delay_str = str(d.get("retryDelay", "5s")).rstrip("s")
                            try:
                                delay = float(delay_str)
                            except ValueError:
                                delay = 5.0
                    
                    if attempt < retries:
                        sleep_time = min(delay, 10.0)  # Cap wait to 10s max
                        print(f"⚠️ Gemini REST rate limit. Sleeping for {sleep_time}s before retry...")
                        await asyncio.sleep(sleep_time)
                        continue
                
                raise RuntimeError(f"Gemini REST returned status {response.status_code}: {response.text}")
                
            except Exception as e:
                # If we raised daily quota cooldown error ourselves, pass it up
                if "daily free-tier quota exhausted" in str(e) or "cooldown" in str(e):
                    raise e
                
                if attempt < retries:
                    print(f"⚠️ Gemini REST exception: {e}. Retrying...")
                    await asyncio.sleep(2.0)
                    continue
                raise RuntimeError(f"Gemini API call failed after retries. Exception: {e}")
                
    raise RuntimeError("Gemini API call failed after multiple retries")
