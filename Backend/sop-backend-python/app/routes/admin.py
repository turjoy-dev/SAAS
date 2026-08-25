from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import secrets

from app.db.supabase_client import get_supabase
from app.auth.dependencies import get_current_user_id, require_role

router = APIRouter()

MAX_SALES_REP_TRIAL_DAYS = 30

class AuthorizeBody(BaseModel):
    is_authorized: bool
    reason: str = Field(..., min_length=10, description="Required audit reason, min 10 characters")

class SuspendBody(BaseModel):
    suspended: bool
    reason: str = Field(..., min_length=10, description="Required audit reason, min 10 characters")

class RoleBody(BaseModel):
    role: str = Field(..., description="Target role: 'user', 'admin', 'owner'")
    reason: str = Field(..., min_length=10, description="Required audit reason, min 10 characters")

class CouponCreateBody(BaseModel):
    code: Optional[str] = Field(None, description="Optional custom code. Auto-generated cryptographically using secrets if omitted.")
    type: str = Field(..., description="free_forever, trial_days, percent_off, fixed_amount")
    value: Optional[float] = None
    max_redemptions: int = Field(1, ge=1)
    expires_at: Optional[str] = None  # ISO format string or None

class CreateUserBody(BaseModel):
    email: str = Field(..., description="Email address for the new user")
    phone: Optional[str] = Field(None, description="Optional phone number")
    role: str = Field("user", description="Role of the new user: 'user', 'admin', 'owner'")
    plan: Optional[str] = Field(None, description="Plan: 'trial_days', 'free_forever', or None")
    trial_days: Optional[int] = Field(15, description="Number of trial days if plan is 'trial_days'")
    country: Optional[str] = Field(None, description="Optional country name of the user")

# Helper to verify target is not self and caller has privileges
async def get_caller_and_target_profile(caller_id: str, target_id: str):
    if caller_id == target_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account.")

    supabase = get_supabase()
    
    # 1. Fetch caller profile
    caller_res = supabase.table("user_profiles").select("*").eq("id", caller_id).execute()
    if not caller_res.data:
        raise HTTPException(status_code=403, detail="Caller profile not found.")
    caller = caller_res.data[0]
    
    # 2. Fetch target profile
    target_res = supabase.table("user_profiles").select("*").eq("id", target_id).execute()
    if not target_res.data:
        raise HTTPException(status_code=404, detail="Target user profile not found.")
    target = target_res.data[0]
    
    # 3. Restrict admin/sales_rep from modifying other admins/owners
    if caller.get("role") in ("sales_rep", "admin"):
        if target.get("role") in ("sales_rep", "admin", "owner"):
            raise HTTPException(status_code=403, detail="Admins cannot modify other admin or owner accounts.")
            
    return caller, target

@router.get("/users")
async def list_users(
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Search and list user profiles by email or phone. Paginated.
    """
    supabase = get_supabase()
    query = supabase.table("user_profiles").select("id, email, phone, role, is_authorized, suspended, plan, plan_expires_at, created_at, country", count="exact")
    
    if search:
        query = query.or_(f"email.ilike.%{search}%,phone.ilike.%{search}%")
        
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return {
        "total": res.count or len(res.data),
        "limit": limit,
        "offset": offset,
        "users": res.data
    }

@router.get("/users/{id}")
async def get_user_detail(
    id: str,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Retrieves user profile details, total document counts, and estimated costs.
    """
    try:
        uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    supabase = get_supabase()
    profile_res = supabase.table("user_profiles").select("*").eq("id", id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found.")
    
    profile = profile_res.data[0]
    
    doc_count = 0
    total_llm_calls = 0
    estimated_cost = 0.0
    
    apps_res = supabase.table("applicants").select("id").eq("user_id", id).execute()
    if apps_res.data:
        app_ids = [a["id"] for a in apps_res.data]
        
        # Get count of generations
        gen_res = supabase.table("generations").select("id", count="exact").in_("applicant_id", app_ids).execute()
        doc_count = gen_res.count or len(gen_res.data)
        
        # Calculate calls from generation_versions
        gen_ids = [g["id"] for g in gen_res.data] if gen_res.data else []
        if gen_ids:
            versions_res = supabase.table("generation_versions").select("tokens_used").in_("generation_id", gen_ids).execute()
            for v in versions_res.data:
                tokens = v.get("tokens_used") or {}
                calls = tokens.get("llm_calls", 0)
                total_llm_calls += calls
                
            # Compute a rough cost estimate: $0.005 per raw LLM call
            estimated_cost = round(total_llm_calls * 0.005, 3)

    return {
        "profile": profile,
        "doc_count": doc_count,
        "total_llm_calls": total_llm_calls,
        "estimated_cost": estimated_cost
    }

@router.post("/users")
async def create_user(
    body: CreateUserBody,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Creates a new user profile and corresponding Supabase Auth user record.
    """
    if body.role not in ("user", "sales_rep", "admin", "owner"):
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    supabase = get_supabase()

    # Get caller role to enforce creation logic
    caller_res = supabase.table("user_profiles").select("role").eq("id", current_user_id).execute()
    if not caller_res.data:
        raise HTTPException(status_code=403, detail="Caller profile not found.")
    caller_role = caller_res.data[0].get("role")

    # Enforce: admin cannot create admin or owner accounts
    if caller_role in ("sales_rep", "admin"):
        if body.role in ("sales_rep", "admin", "owner"):
            raise HTTPException(
                status_code=403,
                detail="Administrative accounts cannot create other admin or owner accounts."
            )

    # 1. Create the user in Auth
    try:
        auth_res = supabase.auth.admin.create_user({
            "email": body.email,
            "password": "Password123!",  # Default temporary password
            "email_confirm": True
        })
        new_uid = auth_res.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create Auth user: {str(e)}")

    # 2. Update user_profiles (auto-synced via trigger)
    update_data = {
        "role": body.role,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if body.phone:
        update_data["phone"] = body.phone
        
    if body.country:
        update_data["country"] = body.country

    if body.plan == "free_forever":
        update_data["plan"] = "free_forever"
        update_data["plan_expires_at"] = None
        update_data["is_authorized"] = True
        update_data["allowed_features"] = ["*"]
    elif body.plan == "trial_days":
        days = body.trial_days or 15
        if caller_role in ("sales_rep", "admin") and days > MAX_SALES_REP_TRIAL_DAYS:
            days = MAX_SALES_REP_TRIAL_DAYS
            
        update_data["plan"] = "trial_days"
        update_data["plan_expires_at"] = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
        update_data["is_authorized"] = True
        update_data["allowed_features"] = ["*"]

    try:
        supabase.table("user_profiles").update(update_data).eq("id", new_uid).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth user created, but profile update failed: {str(e)}")

    # 3. Log action to admin_actions
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "create_user",
        "target_user_id": new_uid,
        "reason": f"Manually created user account via admin dashboard. Role={body.role}, Plan={body.plan}",
        "payload": {"email": body.email, "role": body.role, "plan": body.plan}
    }).execute()

    return {"status": "success", "user_id": new_uid, "email": body.email}

@router.delete("/users/{id}")
async def delete_user(
    id: str,
    current_user_id: str = Depends(require_role("owner"))
):
    """
    Deletes a user account and profile record (Owner-only privilege).
    """
    if id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")

    supabase = get_supabase()

    # Get target email for audit logging
    target_res = supabase.table("user_profiles").select("email").eq("id", id).execute()
    target_email = target_res.data[0].get("email") if target_res.data else "Unknown"

    try:
        supabase.auth.admin.delete_user(id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete authentication user: {str(e)}")

    # Log to audit log
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "delete_user",
        "target_user_id": id,
        "reason": f"Permanently deleted user account via owner override",
        "payload": {"deleted_email": target_email}
    }).execute()

    return {"status": "success", "message": f"Successfully deleted user {target_email}."}

@router.put("/users/{id}/authorize")
async def authorize_user(
    id: str,
    body: AuthorizeBody,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Updates the is_authorized status of a user profile, writing to audit log.
    """
    caller, target = await get_caller_and_target_profile(current_user_id, id)
    
    supabase = get_supabase()
    
    # 1. Update target profile
    supabase.table("user_profiles").update({
        "is_authorized": body.is_authorized,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", id).execute()
    
    # 2. Log action to admin_actions
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "authorize",
        "target_user_id": id,
        "reason": body.reason,
        "payload": {"is_authorized": body.is_authorized, "target_email": target.get("email")}
    }).execute()
    
    return {"status": "success", "message": f"Successfully set is_authorized to {body.is_authorized} for {target.get('email')}."}

@router.put("/users/{id}/suspend")
async def suspend_user(
    id: str,
    body: SuspendBody,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Suspends or unsuspends a user profile, writing to audit log.
    """
    caller, target = await get_caller_and_target_profile(current_user_id, id)
    
    supabase = get_supabase()
    
    # 1. Update target profile
    if body.suspended:
        supabase.table("user_profiles").update({
            "suspended": True,
            "suspended_reason": body.reason,
            "suspended_by": current_user_id,
            "suspended_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", id).execute()
    else:
        supabase.table("user_profiles").update({
            "suspended": False,
            "suspended_reason": None,
            "suspended_by": None,
            "suspended_at": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", id).execute()
    
    # 2. Log action to admin_actions
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "suspend",
        "target_user_id": id,
        "reason": body.reason,
        "payload": {"suspended": body.suspended, "target_email": target.get("email")}
    }).execute()
    
    return {"status": "success", "message": f"Successfully set suspended to {body.suspended} for {target.get('email')}."}

@router.put("/users/{id}/role")
async def update_user_role(
    id: str,
    body: RoleBody,
    current_user_id: str = Depends(require_role("owner"))
):
    """
    Updates the role of a user profile (Owner-only).
    """
    caller, target = await get_caller_and_target_profile(current_user_id, id)
    
    if body.role not in ("user", "sales_rep", "admin", "owner"):
        raise HTTPException(status_code=400, detail="Invalid role specified.")
        
    supabase = get_supabase()
    
    # 1. Update target role
    supabase.table("user_profiles").update({
        "role": body.role,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", id).execute()
    
    # 2. Log action to admin_actions
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "role_change",
        "target_user_id": id,
        "reason": body.reason,
        "payload": {
            "target_email": target.get("email"),
            "old_role": target.get("role"),
            "new_role": body.role
        }
    }).execute()
    
    return {"status": "success", "message": f"Successfully updated role for {target.get('email')} to {body.role}."}

@router.get("/coupons")
async def list_coupons(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Lists coupons paginated.
    """
    supabase = get_supabase()
    res = supabase.table("coupons").select("*", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {
        "total": res.count or len(res.data),
        "limit": limit,
        "offset": offset,
        "coupons": res.data
    }

@router.post("/coupons")
async def create_coupon(
    body: CouponCreateBody,
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Creates a new coupon, enforcing capping rules for sales representatives.
    """
    if body.type not in ("free_forever", "trial_days", "percent_off", "fixed_amount"):
        raise HTTPException(status_code=400, detail="Invalid coupon type.")

    supabase = get_supabase()
    
    # Fetch caller role
    caller_res = supabase.table("user_profiles").select("role").eq("id", current_user_id).execute()
    if not caller_res.data:
        raise HTTPException(status_code=403, detail="Caller profile not found.")
    caller_role = caller_res.data[0].get("role", "user")

    # Enforce role caps for sales reps/admins
    if caller_role in ("sales_rep", "admin"):
        if body.type == "free_forever":
            raise HTTPException(
                status_code=400,
                detail="Admins are not permitted to create 'free_forever' coupons."
            )
        if body.type == "trial_days":
            if not body.value or body.value > MAX_SALES_REP_TRIAL_DAYS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Admins can only create 'trial_days' coupons with a maximum of {MAX_SALES_REP_TRIAL_DAYS} days."
                )

    # Create Coupon (using cryptographically secure secrets.token_hex for auto-generated codes)
    coupon_code = body.code.strip().upper() if body.code and body.code.strip() else f"VW-{secrets.token_hex(4).upper()}"

    try:
        new_coupon = {
            "code": coupon_code,
            "type": body.type,
            "value": body.value,
            "max_redemptions": body.max_redemptions,
            "redeemed_count": 0,
            "expires_at": body.expires_at,
            "active": True,
            "created_by": current_user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = supabase.table("coupons").insert(new_coupon).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create coupon.")
            
        coupon_id = res.data[0]["id"]
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(status_code=400, detail=f"Coupon code '{body.code}' already exists.")
        raise HTTPException(status_code=400, detail=f"Failed to create coupon: {str(e)}")

    # Log action to admin_actions
    supabase.table("admin_actions").insert({
        "admin_id": current_user_id,
        "action": "create_coupon",
        "target_user_id": None,
        "reason": f"Created coupon code: {body.code}",
        "payload": {"coupon_id": coupon_id, "code": body.code, "type": body.type}
    }).execute()

    return {"status": "success", "coupon": res.data[0]}

@router.get("/audit-log")
async def get_audit_log(
    target_user_id: Optional[str] = None,
    admin_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Retrieve audit logs of administrative actions. Paginated.
    Joins user emails for readability.
    """
    supabase = get_supabase()
    query = supabase.table("admin_actions").select(
        "*, admin:user_profiles!admin_id(email), target:user_profiles!target_user_id(email)",
        count="exact"
    )
    
    if target_user_id:
        query = query.eq("target_user_id", target_user_id)
    if admin_id:
        query = query.eq("admin_id", admin_id)
        
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    # Flatten the email fields for easier frontend rendering
    flattened_logs = []
    for log in res.data:
        admin_email = log.get("admin", {}).get("email") if log.get("admin") else None
        target_email = log.get("target", {}).get("email") if log.get("target") else None
        
        flat_log = {
            "id": log.get("id"),
            "admin_id": log.get("admin_id"),
            "admin_email": admin_email,
            "action": log.get("action"),
            "target_user_id": log.get("target_user_id"),
            "target_email": target_email,
            "reason": log.get("reason"),
            "payload": log.get("payload"),
            "created_at": log.get("created_at")
        }
        flattened_logs.append(flat_log)
        
    return {
        "total": res.count or len(res.data),
        "limit": limit,
        "offset": offset,
        "logs": flattened_logs
    }

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user_id: str = Depends(require_role("admin"))
):
    """
    Retrieves global overview metrics: running accounts, suspended/dead accounts, and total cost analytics.
    """
    supabase = get_supabase()
    
    # 1. Fetch profiles
    profiles_res = supabase.table("user_profiles").select("suspended, plan, plan_expires_at").execute()
    profiles = profiles_res.data or []
    
    total_users = len(profiles)
    running_users = 0
    dead_users = 0
    
    now = datetime.now(timezone.utc)
    
    for p in profiles:
        suspended = p.get("suspended", False)
        plan = p.get("plan")
        plan_expires_at = p.get("plan_expires_at")
        
        is_expired = False
        if plan_expires_at:
            try:
                expiry_dt = datetime.fromisoformat(plan_expires_at.replace("Z", "+00:00"))
                if expiry_dt < now:
                    is_expired = True
            except ValueError:
                pass
                
        # Running check: active role-authorized or active trial
        if not suspended and (plan == "free_forever" or (plan == "trial_days" and not is_expired)):
            running_users += 1
        else:
            dead_users += 1
            
    # 2. Cost calculations
    total_documents = 0
    total_llm_calls = 0
    estimated_cost = 0.0
    
    gen_res = supabase.table("generations").select("id", count="exact").execute()
    total_documents = gen_res.count or len(gen_res.data)
    
    versions_res = supabase.table("generation_versions").select("tokens_used").execute()
    for v in versions_res.data or []:
        tokens = v.get("tokens_used") or {}
        total_llm_calls += tokens.get("llm_calls", 0)
        
    estimated_cost = round(total_llm_calls * 0.005, 3)
    
    return {
        "total_users": total_users,
        "running_users": running_users,
        "dead_users": dead_users,
        "total_documents": total_documents,
        "total_llm_calls": total_llm_calls,
        "estimated_cost": estimated_cost
    }
