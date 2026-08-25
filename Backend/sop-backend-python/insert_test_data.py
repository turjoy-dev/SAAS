from app.db.supabase_client import get_supabase
import uuid

def main():
    try:
        supabase = get_supabase()
        user_id = "7389953e-c41e-4326-b0de-00db83cd2f7b"
        
        # 1. Insert into applicants
        app_res = supabase.table("applicants").insert({
            "user_id": user_id,
            "full_name": "Rahim Uddin"
        }).execute()
        
        if not app_res.data:
            print("Failed to insert applicant.")
            return
            
        applicant_id = app_res.data[0]["id"]
        print(f"✅ Created Applicant: {applicant_id}")
        
        # 2. Insert into fact_sheets
        fs_res = supabase.table("fact_sheets").insert({
            "applicant_id": applicant_id,
            "target_country": "australia",
            "target_course": "Master of Data Science",
            "target_university": "RMIT University",
            "education": {
                "fullName": "Rahim Uddin",
                "CGPA": "3.4",
                "academicHistory": "BSc in CS from NSU"
            },
            "financials": {
                "bankBalance": 45000,
                "sponsorType": "parents"
            },
            "gaps": {
                "studyGapExplanation": "No gaps."
            },
            "immigration_history": {
                "visaRefusals": "None."
            },
            "extra": {
                "careerGoals": "Return to Bangladesh to work as a Lead Data Scientist.",
                "whyCourse": "RMIT curriculum.",
                "homeTies": "Family assets in Dhaka."
            }
        }).execute()
        
        if not fs_res.data:
            print("Failed to insert fact sheet.")
            return
            
        fact_sheet_id = fs_res.data[0]["id"]
        print(f"✅ Created Fact Sheet: {fact_sheet_id}")
        
        print("\nUse the following JSON in payload.json:")
        payload = {
            "userId": user_id,
            "factSheet": {
                "applicant_id": applicant_id,
                "fact_sheet_id": fact_sheet_id,
                "targetCountry": "australia",
                "country": "australia",
                "doc_type": "sop",
                "fullName": "Rahim Uddin",
                "university": "RMIT University",
                "program": "Master of Data Science",
                "sponsorType": "parents",
                "careerGoals": "Return to Bangladesh to work as a Lead Data Scientist.",
                "whyCourse": "RMIT curriculum.",
                "homeTies": "Family assets in Dhaka."
            }
        }
        import json
        print(json.dumps(payload, indent=2))
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
