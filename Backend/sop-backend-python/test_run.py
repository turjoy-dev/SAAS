"""
Smoke test — proves loader + prompt_builder +
groq_client + gemini_client + relint + orchestrator work end to end across:
- Family A (Australia SOP, Germany Motivation Letter)
- Family B (Australia GS Q&A)
- Family D (Australia Gap Explanation, Germany Gap Explanation)

Run: python test_run.py
Requires: ANTHROPIC_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY),
          MANIFEST_ROOT pointing at your /knowledge/manifests directory.
"""

import sys
import asyncio
from orchestrator import generate

def test_family_d():
    print("=== Testing Family D (Gap Explanation) ===")
    fact_sheet_d = {
        "applicant_name": "Test Applicant",
        "gap_start": "2023-06",
        "gap_end": "2024-02",
        "gap_reason": "family_responsibility",
        "gap_activity": "completed online coursework in data analysis",
        "proof": "certificates and project records",
    }
    
    result = asyncio.run(generate("australia", "gap_explanation", fact_sheet_d))
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Family D Document ---\n")
    print(result["text"][:300] + "...")
    print("=========================================\n")

def test_family_a():
    print("=== Testing Family A (SOP) ===")
    fact_sheet_a = {
        "fullName": "Turjoy Datta",
        "university": "University of Melbourne",
        "program": "Master of Data Science",
        "country": "Australia",
    }
    
    result = asyncio.run(generate("australia", "sop", fact_sheet_a))
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Family A Document ---\n")
    print(result["text"][:300] + "...")
    print("=========================================\n")

def test_family_b():
    print("=== Testing Family B (GS Q&A) ===")
    fact_sheet_b = {
        "fullName": "Turjoy Datta",
        "university": "Monash University",
        "program": "Master of Business Information Systems",
        "country": "Australia",
        "sponsorType": "Parents",
        "careerGoals": "Lead IT modernization at the family's logistics company in Dhaka.",
        "whyCourse": "Core units in Enterprise Systems and IT Strategy directly address our business bottlenecks.",
        "homeTies": "Immediate family obligations, looking after parents, and managing our local real estate assets in Dhaka.",
    }
    
    result = asyncio.run(generate("australia", "gs", fact_sheet_b))
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Family B Document ---\n")
    print(result["text"][:400] + "...")
    print("=========================================\n")

def test_germany_motivation():
    print("=== Testing Germany Motivation Letter ===")
    fact_sheet_g = {
        "fullName": "Turjoy Datta",
        "university": "TU Munich",
        "program": "M.Sc. in Informatics",
        "country": "Germany",
    }
    
    result = asyncio.run(generate("germany", "motivation_letter", fact_sheet_g))
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Germany Motivation Letter Document ---\n")
    print(result["text"][:400] + "...")
    print("=========================================\n")

def test_family_c():
    print("=== Testing Family C (Study Plan) ===")
    fact_sheet_c = {
        "fullName": "Turjoy Datta",
        "university": "Seoul National University",
        "program": "Master of Electrical Engineering",
        "country": "South Korea",
        "studyPlanRoadmap": "Semester 1: Korean language and core circuits, Semester 2: Smart grid lab, Semester 3: Thesis draft",
    }
    
    result = asyncio.run(generate("south_korea", "study_plan", fact_sheet_c))
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Family C Document ---\n")
    print(result["text"][:400] + "...")
    print("=========================================\n")

def test_uk_gating():
    print("=== Testing UK Gating (Undergrad vs Postgrad) ===")
    fact_sheet_ug = {
        "fullName": "John Doe",
        "university": "University College London",
        "program": "BSc in Computer Science",
        "country": "UK",
        "level": "undergraduate"
    }
    result_ug = generate("uk", "sop", fact_sheet_ug)
    result_ug = asyncio.run(generate("uk", "sop", fact_sheet_ug))
    assert result_ug["doc_type"] == "personal_statement"
    
    fact_sheet_pg = {
        "fullName": "Jane Doe",
        "university": "University College London",
        "program": "MSc in Software Systems",
        "country": "UK",
        "level": "postgraduate"
    }
    result_pg = asyncio.run(generate("uk", "personal_statement", fact_sheet_pg))
    print(f"Postgrad requested 'personal_statement' -> resolved to: {result_pg['doc_type']} (expected: sop)")
    print("=========================================\n")

def test_canada_loe_escalation():
    print("=== Testing Canada LOE Escalation ===")
    fact_sheet_no_refusal = {
        "fullName": "Jack Doe",
        "university": "University of British Columbia",
        "program": "MSc in Computer Science",
        "country": "Canada",
        "clarification_reason": "study gap"
    }
    result_normal = asyncio.run(generate("canada", "loe", fact_sheet_no_refusal))
    assert "address_prior_refusals" not in [s["section"] for s in result_normal.get("structure", [])]
    
    fact_sheet_refusal = {
        "fullName": "Jack Doe",
        "university": "University of British Columbia",
        "program": "MSc in Computer Science",
        "country": "Canada",
        "clarification_reason": "prior refusal",
        "has_prior_refusal": True,
        "refusal_reasons": "Purpose of visit"
    }
    result_escalated = asyncio.run(generate("canada", "loe", fact_sheet_refusal))
    print("Escalated LOE call completed successfully.")
    print("=========================================\n")

def test_south_korea_sop_block():
    print("=== Testing South Korea SOP Block ===")
    from knowledge.loader import ManifestError
    fact_sheet = {
        "fullName": "Turjoy Datta",
        "university": "SNU",
        "program": "MS CS",
        "country": "South Korea"
    }
    try:
        asyncio.run(generate("south_korea", "sop", fact_sheet))
        print("❌ Error: South Korea SOP request was NOT blocked!")
    except ManifestError as e:
        print(f"✅ Success: South Korea SOP block raised expected error: {e}")
    print("=========================================\n")

if __name__ == "__main__":
    import io
    if sys.stdout.encoding.lower() != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    try:
        test_family_d()
        test_family_a()
        test_family_b()
        test_family_c()
        test_germany_motivation()
        test_uk_gating()
        test_canada_loe_escalation()
        test_south_korea_sop_block()
        print("Smoke tests loaded successfully.")
    except Exception as e:
        print(f"Error executing smoke tests: {e}")
        sys.exit(1)

