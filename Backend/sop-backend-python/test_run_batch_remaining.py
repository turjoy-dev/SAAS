import sys
import os

if "--real" in sys.argv:
    os.environ["USE_MOCK_LLM"] = "false"
else:
    os.environ["USE_MOCK_LLM"] = "true"

from orchestrator import generate
from app import config

if "--real" in sys.argv:
    config.USE_MOCK_LLM = False
else:
    config.USE_MOCK_LLM = True

FACT_SHEETS = [
    {
        "label": "UK SOP (Family A)",
        "country": "uk",
        "doc_type": "sop",
        "data": {
            "fullName": "Applicant UK A",
            "prior_degree": "BSc in Computer Science",
            "prior_institution": "Daffodil International University",
            "program": "MSc in Data Science",
            "university": "University of Leeds",
            "relevant_experience": "1 year as a junior analyst",
            "careerGoals": "work as a data scientist in fintech",
            "country": "UK",
            "whyCourse": "I want to specialize in cloud analytics and big data",
            "homeTies": "family real estate business in Dhaka",
            "academicInterest": "machine learning architectures"
        }
    },
    {
        "label": "Canada Study Permit - SOP (Family A)",
        "country": "canada",
        "doc_type": "sop",
        "data": {
            "fullName": "Applicant Canada A",
            "prior_degree": "BBA in Finance",
            "prior_institution": "North South University",
            "program": "MBA in Global Business",
            "university": "McGill University",
            "relevant_experience": "2 years in commercial banking",
            "careerGoals": "corporate finance consultant in Dhaka",
            "country": "Canada",
            "whyCourse": "McGill's practical cases in global business management",
            "homeTies": "Parents and family assets in Chittagong",
            "fundsDetail": "CAD 50,000 seasoned in City Bank account"
        }
    },
    {
        "label": "Malaysia SOP (Family A)",
        "country": "malaysia",
        "doc_type": "sop",
        "data": {
            "fullName": "Applicant Malaysia A",
            "prior_degree": "BSc in Software Engineering",
            "prior_institution": "IUT",
            "program": "Master of Software Engineering",
            "university": "Asia Pacific University",
            "relevant_experience": "1.5 years as software engineer",
            "careerGoals": "senior software architect in tech sector",
            "country": "Malaysia",
            "whyCourse": "Advanced modules in mobile and cloud systems",
            "homeTies": "elderly parents and property inheritance in Sylhet"
        }
    },
    {
        "label": "South Korea Study Plan (Family C)",
        "country": "south_korea",
        "doc_type": "study_plan",
        "data": {
            "fullName": "Applicant South Korea C",
            "prior_degree": "BSc in Electrical Engineering",
            "prior_institution": "BUET",
            "program": "Master of Electrical Engineering",
            "university": "Seoul National University",
            "relevant_experience": "1 year in smart grid design",
            "careerGoals": "renewable energy grid engineer in Dhaka",
            "country": "South Korea",
            "whyCourse": "SNU's state of the art laboratory for power systems",
            "homeTies": "Immediate family and sibling dependency",
            "studyPlanRoadmap": "Semester 1: Korean language and core circuits, Semester 2: Smart grid lab, Semester 3: Thesis draft"
        }
    },
    {
        "label": "Ireland SOP (Family A)",
        "country": "ireland",
        "doc_type": "sop",
        "data": {
            "fullName": "Applicant Ireland A",
            "prior_degree": "BSc in Pharmacy",
            "prior_institution": "DIU",
            "program": "MSc in Pharmaceutical Sciences",
            "university": "Trinity College Dublin",
            "relevant_experience": "1 year as quality assurance officer",
            "careerGoals": "pharmaceutical QA lead in Dhaka",
            "country": "Ireland",
            "whyCourse": "Advanced QA methodologies and drug design modules",
            "homeTies": "Mother and family pharmacy business in Dhaka",
            "insuranceOrFunds": "seasoned bank balance of EUR 25,000"
        }
    }
]

def main():
    print("============================================================")
    print("Batch test for Remaining Countries (UK, Canada, Malaysia, South Korea, Ireland)")
    print("============================================================")
    if "--real" not in sys.argv:
        print("💡 Running with Mock LLM client. To test against real providers, run: python test_run_batch_remaining.py --real")
    else:
        print("⚡ Running against real LLM providers.")
    results = []
    import time
    for case in FACT_SHEETS:
        try:
            import asyncio
            res = asyncio.run(generate(case["country"], case["doc_type"], case["data"]))
            results.append((case["label"], res))
            if res.get("generation_failed"):
                print(f"❌ Failed: {res.get('failure_reason')}")
            elif res.get("needs_human_review"):
                print(f"⚠️ NEEDS REVIEW — Score: {res['critic_score']}/100 (Type: {res.get('critic_type')}) | LLM calls: {res['llm_calls']}")
                print(f"   Models Used: {res.get('model_used')}")
                print(f"Snippet:\n{res['text'][:150]}...\n")
            else:
                print(f"✅ Success! Score: {res['critic_score']}/100 (Type: {res.get('critic_type')}) | LLM calls: {res['llm_calls']}")
                print(f"   Models Used: {res.get('model_used')}")
                print(f"Snippet:\n{res['text'][:150]}...\n")
        except Exception as e:
            print(f"❌ FAILED: {e}")
            results.append((case["label"], None))
        
        # Add a delay to avoid Groq RPM (Requests Per Minute) rate limits
        print("Waiting 8 seconds to prevent RPM rate limit...")
        time.sleep(8)

    print("\n============================================================")
    print("SUMMARY")
    print("============================================================")
    all_ok = True
    for label, res in results:
        if res:
            if res.get("generation_failed"):
                print(f"❌ {label}: FAILED ({res.get('failure_reason')})")
                all_ok = False
            elif res.get("needs_human_review"):
                print(f"⚠️ {label}: NEEDS REVIEW (score {res['critic_score']}/100)")
            else:
                print(f"✅ {label}: score {res['critic_score']}/100")
        else:
            print(f"❌ {label}: crashed")
            all_ok = False
    
    if all_ok:
        print("\n🎉 All tests passed successfully!")
    else:
        print("\n⚠️ Some tests failed.")
            
    if not all_ok:
        sys.exit(1)

if __name__ == "__main__":
    main()
