import os
import json
import time

BUDGET_FILE = os.path.join(os.path.dirname(__file__), "daily_llm_budget.json")

# Daily request caps based on free tier dashboard info (Dual Groq keys configured)
_daily_caps = {
    "groq_70b": 28800,  # 14,400 requests/day * 2 keys
    "groq_8b": 28800,   # 14,400 requests/day * 2 keys
    "gemini": 20        # 20 requests/day free tier cap
}

def _load_budget() -> dict:
    today = time.strftime("%Y-%m-%d")
    if os.path.exists(BUDGET_FILE):
        try:
            with open(BUDGET_FILE, "r") as f:
                data = json.load(f)
                if data.get("date") == today:
                    return data.get("usage", {"groq_70b": 0, "groq_8b": 0, "gemini": 0})
        except Exception:
            pass
    return {"groq_70b": 0, "groq_8b": 0, "gemini": 0}

def _save_budget(usage: dict):
    today = time.strftime("%Y-%m-%d")
    try:
        with open(BUDGET_FILE, "w") as f:
            json.dump({"date": today, "usage": usage}, f)
    except Exception:
        pass

def check_budget(provider: str) -> bool:
    usage = _load_budget()
    cap = _daily_caps.get(provider, 14400)
    current = usage.get(provider, 0)
    has_room = current < cap * 0.9
    if not has_room:
        print(f"⚠️ Budget check: {provider} usage ({current}/{cap}) is near daily limit. Proactively skipping!")
    return has_room

def record_call(provider: str):
    usage = _load_budget()
    usage[provider] = usage.get(provider, 0) + 1
    _save_budget(usage)
