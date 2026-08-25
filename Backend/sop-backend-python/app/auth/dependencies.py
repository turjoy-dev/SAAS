import os
from datetime import datetime, timezone
from fastapi import Header, HTTPException, Depends
from app.db.supabase_client import get_supabase
from app.auth.features import Feature

def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Decodes the Supabase Auth JWT token from the Authorization header
    to get the authenticated user ID.
    """
    # 1. Check if auth header is present
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    
    # 2. Skip verification for mock local tokens ONLY in non-production when explicitly enabled
    if token == "mock-dev-token":
        from app import config
        if not config.IS_PRODUCTION and config.ALLOW_MOCK_AUTH:
            dev_user_id = os.environ.get("TEST_USER_ID") or "7389953e-c41e-4326-b0de-00db83cd2f7b"
            return dev_user_id
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        supabase = get_supabase()
        # Verify the JWT token via Supabase Auth
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user.id
    except Exception as e:
        print(f"⚠️ Supabase JWT verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


ROLE_HIERARCHY = {"user": 0, "sales_rep": 1, "admin": 1, "owner": 2}

def require_role(min_role: str):
    """
    Dependency factory checking role constraints and suspension state.
    Queries the database directly on every request to ensure changes take effect immediately.
    """
    if min_role not in ROLE_HIERARCHY:
        raise ValueError(f"Invalid min_role specified: {min_role}")

    def role_dependency(current_user_id: str = Depends(get_current_user_id)) -> str:
        try:
            supabase = get_supabase()
            res = supabase.table("user_profiles").select("*").eq("id", current_user_id).execute()
            if not res.data:
                raise HTTPException(status_code=403, detail="Forbidden: User profile not initialized.")
            
            profile = res.data[0]
            if profile.get("suspended", False):
                raise HTTPException(status_code=403, detail="Forbidden: Account is suspended.")

            user_role = profile.get("role", "user")
            if ROLE_HIERARCHY.get(user_role, 0) < ROLE_HIERARCHY[min_role]:
                raise HTTPException(status_code=403, detail="Forbidden: Insufficient privileges.")

            return current_user_id
        except HTTPException:
            raise
        except Exception as e:
            print(f"⚠️ Error verifying user role: {e}")
            raise HTTPException(status_code=403, detail="Forbidden: Error verifying permissions.")

    return role_dependency


def check_feature_access(feature: Feature):
    """
    Dependency factory to check if a user is authorized to access a specific feature.
    Queries database directly to handle real-time plan suspensions or expirations.
    """
    def feature_dependency(current_user_id: str = Depends(get_current_user_id)) -> str:
        try:
            supabase = get_supabase()
            res = supabase.table("user_profiles").select("*").eq("id", current_user_id).execute()
            if not res.data:
                raise HTTPException(status_code=403, detail="Forbidden: User profile not initialized.")
            
            profile = res.data[0]
            if profile.get("suspended", False):
                raise HTTPException(status_code=403, detail="Forbidden: Account is suspended.")

            # Plan expiry validation
            plan_expires_at = profile.get("plan_expires_at")
            if plan_expires_at:
                try:
                    expiry_dt = datetime.fromisoformat(plan_expires_at.replace("Z", "+00:00"))
                    if expiry_dt < datetime.now(timezone.utc):
                        raise HTTPException(status_code=403, detail="Forbidden: Plan has expired.")
                except ValueError:
                    pass

            # Allowed features verification
            allowed = profile.get("allowed_features") or []
            if not isinstance(allowed, list):
                allowed = []

            # Admin roles (sales_rep, admin, owner) bypass feature restrictions by default
            user_role = profile.get("role", "user")
            if user_role in ("sales_rep", "admin", "owner"):
                return current_user_id

            if feature not in allowed and "*" not in allowed and "all" not in allowed:
                raise HTTPException(
                    status_code=403,
                    detail=f"Forbidden: You do not have access to the '{feature.value}' feature."
                )

            return current_user_id
        except HTTPException:
            raise
        except Exception as e:
            print(f"⚠️ Error checking feature access: {e}")
            raise HTTPException(status_code=403, detail="Forbidden: Error verifying feature access.")

    return feature_dependency
