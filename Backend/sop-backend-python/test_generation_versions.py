from app.db.supabase_client import get_supabase
from datetime import datetime, timezone

def main():
    supabase = get_supabase()
    generation_id = "0c443354-ddc8-4140-8890-f92235897a9a"
    
    ver_payload = {
        "generation_id": generation_id,
        "version_n": 1,
        "content": "This is a test generation content.",
        "critic_score": 95,
        "critic_feedback": {
            "critic_flags": ["passive_voice"],
            "residual_flags": []
        },
        "model_used": "llama-3.1-8b-instant",
        "tokens_used": {"llm_calls": 4},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        res = supabase.table("generation_versions").insert(ver_payload).execute()
        print("✅ Insert to generation_versions Succeeded!")
        print("Inserted Row:", res.data)
    except Exception as e:
        print("❌ Insert to generation_versions Failed!")
        print("Error details:", e)

if __name__ == "__main__":
    main()
