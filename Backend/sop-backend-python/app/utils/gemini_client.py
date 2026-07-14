import httpx
import asyncio
from app import config

async def call_gemini_rest(model: str, system_instruction: str, prompt: str, json_mode: bool = False) -> str:
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
        
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(1, 4):
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
                
                print(f"⚠️ Gemini REST returned status {response.status_code}: {response.text}. Retrying...")
                await asyncio.sleep(attempt * 2)
            except Exception as e:
                print(f"⚠️ Gemini REST exception: {e}. Retrying...")
                await asyncio.sleep(attempt * 2)
                
    raise RuntimeError("Gemini API call failed after multiple retries")
