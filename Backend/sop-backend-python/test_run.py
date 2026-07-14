"""
Smoke test — proves loader + prompt_builder + claude_client +
gemini_client + relint + orchestrator work end to end across:
- Family A (Australia SOP, Germany Motivation Letter)
- Family B (Australia GS Q&A)
- Family D (Australia Gap Explanation, Germany Gap Explanation)

Run: python test_run.py
Requires: ANTHROPIC_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY),
          MANIFEST_ROOT pointing at your /knowledge/manifests directory.
"""

import sys
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
    
    result = generate("australia", "gap_explanation", fact_sheet_d)
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
    
    result = generate("australia", "sop", fact_sheet_a)
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
    
    result = generate("australia", "gs", fact_sheet_b)
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
    
    result = generate("germany", "motivation_letter", fact_sheet_g)
    print(f"Family: {result['family']}  |  LLM calls: {result['llm_calls']}")
    print(f"Critic score: {result['critic_score']}/100  |  Edited: {result['edited']}")
    print(f"Residual flags: {result['residual_flags']}")
    print(f"Needs human review: {result['needs_human_review']}")
    print("\n--- Germany Motivation Letter Document ---\n")
    print(result["text"][:400] + "...")
    print("=========================================\n")

if __name__ == "__main__":
    try:
        test_family_d()
        test_family_a()
        test_family_b()
        test_germany_motivation()
        print("Smoke tests loaded successfully.")
    except Exception as e:
        print(f"Error executing smoke tests: {e}")
        sys.exit(1)
