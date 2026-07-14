from fastapi import APIRouter, HTTPException, Body, BackgroundTasks
from orchestrator import generate
from app.db.supabase_client import get_supabase
from app.utils.groq_client import groq_call
from datetime import datetime, timezone
import json

router = APIRouter()

def save_generation_to_db(country: str, doc_type: str, fact_sheet: dict, result: dict):
    try:
        supabase = get_supabase()
        gen_payload = {
            "country": country,
            "doc_type": doc_type,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Resolve applicant_id if present
        applicant_id = fact_sheet.get("applicant_id") or fact_sheet.get("id")
        if applicant_id:
            gen_payload["applicant_id"] = applicant_id
            
        gen_res = supabase.table("generations").insert(gen_payload).execute()
        if gen_res.data:
            gen_id = gen_res.data[0]["id"]
            
            ver_payload = {
                "generation_id": gen_id,
                "text": result.get("text", ""),
                "critic_score": result.get("critic_score", 0),
                "critic_flags": result.get("critic_flags", []),
                "residual_flags": result.get("residual_flags", []),
                "llm_calls": result.get("llm_calls", 0),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            supabase.table("generation_versions").insert(ver_payload).execute()
    except Exception as e:
        print(f"⚠️ Error persisting generation to Supabase: {e}")

@router.post("/generate")
async def generate_sop_endpoint(payload: dict = Body(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        fact_sheet = payload.get("factSheet", payload)
        
        country = fact_sheet.get("targetCountry", fact_sheet.get("country", "generic")).lower()
        doc_type = fact_sheet.get("doc_type", "sop").lower()
        
        # Route to Orchestrator dispatcher
        res = generate(country, doc_type, fact_sheet)
        
        # Persist to Supabase asynchronously
        background_tasks.add_task(save_generation_to_db, country, doc_type, fact_sheet, res)
        
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-australia")
async def generate_australia_endpoint(payload: dict = Body(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        fact_sheet = payload.get("factSheet", payload)
        country = "australia"
        doc_type = fact_sheet.get("doc_type", "sop").lower()
        
        # Route to Orchestrator dispatcher
        res = generate(country, doc_type, fact_sheet)
        
        # Persist to Supabase asynchronously
        background_tasks.add_task(save_generation_to_db, country, doc_type, fact_sheet, res)
        
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intake-australia")
async def intake_australia_endpoint(payload: dict = Body(...)):
    """
    Extracts structured fact-sheet JSON from raw unstructured intake text.
    """
    raw_text = payload.get("rawText", "") or payload.get("text", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing raw text for extraction")
        
    system_prompt = (
        "You are an expert student visa intake clerk.\n"
        "Extract applicant details into a standardized JSON format. Return valid JSON only."
    )
    
    user_prompt = (
        f"Raw Text:\n{raw_text}\n\n"
        "Extract the following schema:\n"
        "{\n"
        "  \"fullName\": \"string\",\n"
        "  \"age\": 0,\n"
        "  \"country\": \"Australia\",\n"
        "  \"university\": \"string\",\n"
        "  \"program\": \"string\",\n"
        "  \"previousDegree\": \"string\",\n"
        "  \"cgpa\": \"string\",\n"
        "  \"currentJob\": \"string\",\n"
        "  \"married\": false,\n"
        "  \"passportCount\": 0,\n"
        "  \"sponsorType\": \"string\",\n"
        "  \"careerGoals\": \"string\",\n"
        "  \"whyCourse\": \"string\",\n"
        "  \"homeTies\": \"string\"\n"
        "}"
    )
    
    try:
        res = await groq_call(system=system_prompt, user=user_prompt, max_tokens=600)
        cleaned = res.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")

