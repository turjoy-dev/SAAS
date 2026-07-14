"""
Batch test for Family A (narrative) — first real test now that Australia's
matrix includes SOP. Mirrors test_run_batch.py's structure for Family D.

Run: python test_run_batch_family_a.py
"""

from orchestrator import generate

FACT_SHEETS = [
    {
        "label": "CS background -> Data Science Masters",
        "data": {
            "fullName": "Applicant A",
            "prior_degree": "BSc in Computer Science",
            "prior_institution": "Daffodil International University",
            "program": "Master of Data Science",
            "university": "University of Melbourne",
            "relevant_experience": "1 year as a junior data analyst, built two ML course projects",
            "careerGoals": "work as a data scientist in the fintech sector after graduation",
            "country": "Australia"
        },
    },
    {
        "label": "Business background -> MBA",
        "data": {
            "fullName": "Applicant B",
            "prior_degree": "BBA in Marketing",
            "prior_institution": "North South University",
            "program": "Master of Business Administration",
            "university": "Monash University",
            "relevant_experience": "2 years in brand management at a local FMCG company",
            "careerGoals": "move into international marketing strategy roles",
            "country": "Australia"
        },
    },
    {
        "label": "Engineering background -> Civil Engineering Masters",
        "data": {
            "fullName": "Applicant C",
            "prior_degree": "BSc in Civil Engineering",
            "prior_institution": "BUET",
            "program": "Master of Structural Engineering",
            "university": "University of Sydney",
            "relevant_experience": "1.5 years as a site engineer on infrastructure projects",
            "careerGoals": "specialize in earthquake-resistant structural design",
            "country": "Australia"
        },
    },
    {
        "label": "Thin experience edge case (fresh graduate)",
        "data": {
            "fullName": "Applicant D",
            "prior_degree": "BSc in Electrical and Electronic Engineering",
            "prior_institution": "Islamic University of Technology",
            "program": "Master of Renewable Energy Engineering",
            "university": "UNSW Sydney",
            "relevant_experience": "final-year thesis on solar microgrid design, no industry experience yet",
            "careerGoals": "work on renewable energy infrastructure projects in Bangladesh after graduation",
            "country": "Australia"
        },
    },
]


def main():
    results = []
    for case in FACT_SHEETS:
        print(f"\n{'='*60}\nRunning: {case['label']}\n{'='*60}")
        try:
            result = generate("australia", "sop", case["data"])
            results.append((case["label"], result))
            print(f"Score: {result['critic_score']}/100 | Edited: {result['edited']} | "
                  f"Residual flags: {result['residual_flags']} | "
                  f"Needs review: {result['needs_human_review']}")
            print(f"\n{result['text']}\n")
        except Exception as e:
            print(f"FAILED: {e}")
            results.append((case["label"], None))

    print(f"\n{'='*60}\nSUMMARY\n{'='*60}")
    for label, result in results:
        if result is None:
            print(f"❌ {label}: crashed")
        elif result["needs_human_review"]:
            print(f"⚠️  {label}: score {result['critic_score']}/100, flagged for review")
        else:
            mark = "edited" if result["edited"] else "no edit needed"
            print(f"✅ {label}: score {result['critic_score']}/100, {mark}")

    print(f"\n{'='*60}\nDIVERSITY CHECK (first 100 chars of each)\n{'='*60}")
    for label, result in results:
        if result:
            print(f"{label}: {result['text'][:100]}...")


if __name__ == "__main__":
    main()
