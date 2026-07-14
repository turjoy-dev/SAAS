from fastapi import APIRouter, HTTPException
from app.db.supabase_client import get_supabase

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary():
    """
    Aggregates metrics for the user's dashboard.
    """
    total_generated = 0
    total_evaluated = 0
    avg_eval_score = 0
    recent_sops = []

    supabase = get_supabase()

    # 1. Total Generated count
    try:
        gen_res = supabase.table("generations").select("id", count="exact").execute()
        total_generated = gen_res.count or len(gen_res.data)
    except Exception as e:
        print(f"⚠️ Error fetching total generated: {e}")

    # 2. Total Evaluated count & avg score
    try:
        eval_res = supabase.table("generation_versions").select("id", "critic_score").execute()
        total_evaluated = len(eval_res.data)
        if total_evaluated > 0:
            scores = [r["critic_score"] for r in eval_res.data if r.get("critic_score") is not None]
            if scores:
                avg_eval_score = int(sum(scores) / len(scores))
                
        # Recent sops list
        recent_res = supabase.table("generation_versions").select("*").order("created_at", desc=True).limit(5).execute()
        recent_sops = recent_res.data
    except Exception as e:
        print(f"⚠️ Error fetching recent generations: {e}")

    return {
        "totalSopsGenerated": total_generated,
        "totalSopsEvaluated": total_evaluated,
        "avgEvaluationScore": avg_eval_score,
        "recentSops": recent_sops
    }

