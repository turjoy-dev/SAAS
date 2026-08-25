from fastapi import APIRouter, HTTPException, Depends
from app.db.supabase_client import get_supabase
from app.auth.dependencies import get_current_user_id, require_role

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(current_user_id: str = Depends(get_current_user_id)):
    """
    Aggregates metrics for the user's dashboard.
    """
    total_generated = 0
    total_evaluated = 0
    avg_eval_score = 0
    recent_sops = []

    supabase = get_supabase()

    # 1. Fetch applicant IDs owned by the current user
    try:
        app_res = supabase.table("applicants").select("id").eq("user_id", current_user_id).execute()
        app_ids = [row["id"] for row in app_res.data] if app_res.data else []
    except Exception as e:
        print(f"⚠️ Error fetching applicant IDs for user {current_user_id}: {e}")
        app_ids = []

    # If user has no applicants, return empty summary immediately
    if not app_ids:
        return {
            "totalSopsGenerated": 0,
            "totalSopsEvaluated": 0,
            "avgEvaluationScore": 0,
            "recentSops": []
        }

    # 2. Total Generated count filtered by owned applicant_ids
    try:
        gen_res = supabase.table("generations").select("id", count="exact").in_("applicant_id", app_ids).execute()
        total_generated = gen_res.count or len(gen_res.data)
    except Exception as e:
        print(f"⚠️ Error fetching total generated: {e}")

    # 3. Total Evaluated count & avg score filtered by owned applicant_ids via generations link
    try:
        # First get generation IDs belonging to the applicants
        gen_ids_res = supabase.table("generations").select("id").in_("applicant_id", app_ids).execute()
        gen_ids = [row["id"] for row in gen_ids_res.data] if gen_ids_res.data else []
        
        if gen_ids:
            eval_res = supabase.table("generation_versions").select("id", "critic_score").in_("generation_id", gen_ids).execute()
            total_evaluated = len(eval_res.data)
            if total_evaluated > 0:
                scores = [r["critic_score"] for r in eval_res.data if r.get("critic_score") is not None]
                if scores:
                    avg_eval_score = int(sum(scores) / len(scores))
                    
            # Recent sops list
            recent_res = supabase.table("generation_versions").select("*").in_("generation_id", gen_ids).order("created_at", desc=True).limit(5).execute()
            recent_sops = recent_res.data
    except Exception as e:
        print(f"⚠️ Error fetching recent generations: {e}")

    return {
        "totalSopsGenerated": total_generated,
        "totalSopsEvaluated": total_evaluated,
        "avgEvaluationScore": avg_eval_score,
        "recentSops": recent_sops
    }


@router.get("/failures")
async def get_failed_generations(
    limit: int = 20,
    offset: int = 0,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Retrieves a paginated list of failed generation jobs from generation_errors.
    """
    try:
        supabase = get_supabase()
        res = (
            supabase.table("generation_errors")
            .select("*", count="exact")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return {
            "total": res.count or len(res.data),
            "limit": limit,
            "offset": offset,
            "failures": res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch failure queue: {str(e)}")

