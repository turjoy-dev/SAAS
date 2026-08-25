from fastapi import APIRouter, HTTPException, Depends, Body
from app.db.supabase_client import get_supabase, verify_applicant_ownership
from app.auth.dependencies import get_current_user_id
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()

class FactSheetData(BaseModel):
    target_country: Optional[str] = None
    target_course: Optional[str] = None
    target_university: Optional[str] = None
    education: Optional[Dict[str, Any]] = None
    financials: Optional[Dict[str, Any]] = None
    gaps: Optional[Dict[str, Any]] = None
    immigration_history: Optional[Dict[str, Any]] = None
    extra: Optional[Dict[str, Any]] = None

class ApplicantCreate(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    fact_sheet: Optional[FactSheetData] = None

class ApplicantUpdate(BaseModel):
    full_name: Optional[str] = None
    fact_sheet: Optional[FactSheetData] = None


@router.post("")
async def create_applicant(payload: ApplicantCreate, current_user_id: str = Depends(get_current_user_id)):
    """
    Creates a new applicant and their associated fact-sheet.
    """
    try:
        supabase = get_supabase()
        
        # 1. Insert into applicants
        app_res = supabase.table("applicants").insert({
            "user_id": current_user_id,
            "full_name": payload.full_name
        }).execute()
        
        if not app_res.data:
            raise HTTPException(status_code=500, detail="Failed to create applicant record.")
            
        applicant_id = app_res.data[0]["id"]
        
        # 2. Insert into fact_sheets if provided
        fact_sheet_id = None
        if payload.fact_sheet:
            fs_payload = {
                "applicant_id": applicant_id,
                "target_country": payload.fact_sheet.target_country,
                "target_course": payload.fact_sheet.target_course,
            }
            if payload.fact_sheet.target_university:
                fs_payload["target_university"] = payload.fact_sheet.target_university
            if payload.fact_sheet.education:
                fs_payload["education"] = payload.fact_sheet.education
            if payload.fact_sheet.financials:
                fs_payload["financials"] = payload.fact_sheet.financials
            if payload.fact_sheet.gaps:
                fs_payload["gaps"] = payload.fact_sheet.gaps
            if payload.fact_sheet.immigration_history:
                fs_payload["immigration_history"] = payload.fact_sheet.immigration_history
            if payload.fact_sheet.extra:
                fs_payload["extra"] = payload.fact_sheet.extra
                
            fs_res = supabase.table("fact_sheets").insert(fs_payload).execute()
            if fs_res.data:
                fact_sheet_id = fs_res.data[0]["id"]
                
        return {
            "status": "success",
            "applicant_id": applicant_id,
            "fact_sheet_id": fact_sheet_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_applicant(id: str, current_user_id: str = Depends(get_current_user_id)):
    """
    Retrieves applicant profile and their fact-sheet details.
    Includes ownership verification.
    """
    if not verify_applicant_ownership(id, current_user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this applicant record.")
        
    try:
        supabase = get_supabase()
        # Fetch applicant info
        app_res = supabase.table("applicants").select("*").eq("id", id).execute()
        if not app_res.data:
            raise HTTPException(status_code=404, detail="Applicant not found.")
            
        # Fetch fact sheet info
        fs_res = supabase.table("fact_sheets").select("*").eq("applicant_id", id).execute()
        fact_sheet = fs_res.data[0] if fs_res.data else None
        
        return {
            "applicant": app_res.data[0],
            "fact_sheet": fact_sheet
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
async def update_applicant(id: str, payload: ApplicantUpdate, current_user_id: str = Depends(get_current_user_id)):
    """
    Updates applicant profile and their fact-sheet details.
    Includes ownership verification.
    """
    if not verify_applicant_ownership(id, current_user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this applicant record.")
        
    try:
        supabase = get_supabase()
        
        # 1. Update applicant full name if provided
        if payload.full_name:
            supabase.table("applicants").update({
                "full_name": payload.full_name
            }).eq("id", id).execute()
            
        # 2. Update fact sheet details if provided
        if payload.fact_sheet:
            fs_payload = {}
            if payload.fact_sheet.target_country is not None:
                fs_payload["target_country"] = payload.fact_sheet.target_country
            if payload.fact_sheet.target_course is not None:
                fs_payload["target_course"] = payload.fact_sheet.target_course
            if payload.fact_sheet.target_university is not None:
                fs_payload["target_university"] = payload.fact_sheet.target_university
            if payload.fact_sheet.education is not None:
                fs_payload["education"] = payload.fact_sheet.education
            if payload.fact_sheet.financials is not None:
                fs_payload["financials"] = payload.fact_sheet.financials
            if payload.fact_sheet.gaps is not None:
                fs_payload["gaps"] = payload.fact_sheet.gaps
            if payload.fact_sheet.immigration_history is not None:
                fs_payload["immigration_history"] = payload.fact_sheet.immigration_history
            if payload.fact_sheet.extra is not None:
                fs_payload["extra"] = payload.fact_sheet.extra
                
            if fs_payload:
                # Check if fact sheet exists first
                fs_check = supabase.table("fact_sheets").select("id").eq("applicant_id", id).execute()
                if fs_check.data:
                    supabase.table("fact_sheets").update(fs_payload).eq("applicant_id", id).execute()
                else:
                    fs_payload["applicant_id"] = id
                    supabase.table("fact_sheets").insert(fs_payload).execute()
                    
        return {"status": "success", "message": "Applicant record updated successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_applicant(id: str, current_user_id: str = Depends(get_current_user_id)):
    """
    Deletes the applicant (and cascades to their fact-sheet).
    Includes ownership verification.
    """
    if not verify_applicant_ownership(id, current_user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this applicant record.")
        
    try:
        supabase = get_supabase()
        supabase.table("applicants").delete().eq("id", id).execute()
        return {"status": "success", "message": "Applicant and associated fact-sheet deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
