from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from app.db.supabase_client import get_supabase
from app.auth.dependencies import get_current_user_id
from app.limiter import limiter

router = APIRouter()

class RedeemBody(BaseModel):
    code: str = Field(..., min_length=1, description="Coupon code to redeem")

@router.post("/redeem")
@limiter.limit("5/minute")
def redeem_coupon(
    request: Request,
    body: RedeemBody,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Redeem a coupon code atomically using the database function.
    """
    supabase = get_supabase()

    # 1. Verify user profile exists and is not suspended
    profile_res = supabase.table("user_profiles").select("suspended").eq("id", current_user_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=403, detail="Forbidden: User profile not found.")
    
    if profile_res.data[0].get("suspended", False):
        raise HTTPException(status_code=403, detail="Forbidden: Suspended accounts cannot redeem coupons.")

    # 2. Trigger the atomic database function
    try:
        rpc_res = supabase.rpc("redeem_coupon_atomic", {
            "p_code": body.code,
            "p_user_id": current_user_id
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")

    data = rpc_res.data
    if not data or not data.get("success"):
        err = data.get("error") if data else "Invalid or expired coupon code"
        if err == "You've already redeemed this coupon":
            raise HTTPException(status_code=409, detail=err)
        # Any other failure (expires, maxed out, non-existent) returns 404
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")

    coupon_type = data.get("coupon_type")
    
    # percent_off / fixed_amount are not connected to any billing system yet
    if coupon_type in ("percent_off", "fixed_amount"):
        return {
            "status": "success",
            "message": f"Coupon '{body.code}' redeemed successfully! Note: This coupon has type '{coupon_type}' and has no effect on access privileges yet (billing integration pending).",
            "coupon_type": coupon_type,
            "coupon_value": data.get("coupon_value")
        }

    return {
        "status": "success",
        "message": f"Coupon '{body.code}' redeemed successfully! Feature access has been granted.",
        "coupon_type": coupon_type,
        "coupon_value": data.get("coupon_value"),
        "plan_expires_at": data.get("new_expiry")
    }
