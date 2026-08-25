import pytest
from httpx import AsyncClient
from main import app

ROUTES_TO_TEST = [
    ("/sop/generate", {"doc_type": "sop", "country": "australia"}),
    ("/sop/generate", {"doc_type": "gs", "country": "australia"}),
    ("/sop/generate", {"doc_type": "motivation_letter", "country": "germany"}),
    ("/sop/generate", {"doc_type": "loe", "country": "canada"}),
    ("/sop/generate", {"doc_type": "gap_explanation", "country": "uk"}),
    ("/sop/generate", {"doc_type": "study_plan", "country": "canada"}),
    ("/sop/generate", {"doc_type": "personal_statement", "country": "uk"}),
]

@pytest.mark.asyncio
@pytest.mark.parametrize("route,payload", ROUTES_TO_TEST)
async def test_document_generation_pipeline(route, payload):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        full_payload = {
            "factSheet": {
                "fullName": "Rahim Ahmed",
                "email": "rahim@example.com",
                "nationality": "Bangladesh",
                "country": payload["country"],
                "targetCountry": payload["country"],
                "doc_type": payload["doc_type"],
                "university": "University of Melbourne" if payload["country"] == "australia" else "Technical University of Munich",
                "program": "Master of Data Science",
                "previousDegree": "BSc in CSE from BRAC University",
                "cgpa": "3.65",
                "graduationYear": "2024",
                "gap_start": "2024",
                "gap_end": "2025",
                "gap_duration": "1 year",
                "gap_reason": "Poribar theke financial issue chilo tai 1 year job korsi software company te.",
                "clarification_reason": "Source of tuition funding from personal savings and father's business revenue.",
                "structure_answers": {
                    "current_circumstances": "Ties to Bangladesh through family property and employment.",
                    "course_provider_motivation": "Specialized curriculum at University of Melbourne.",
                    "future_benefit": "Career advancement in Dhaka tech industry.",
                    "additional_information": "Clean academic history."
                }
            }
        }
        response = await ac.post(
            route,
            json=full_payload,
            headers={"Authorization": "Bearer mock-dev-token"}
        )
        assert response.status_code in (200, 202)
        data = response.json()
        assert "generation_id" in data or "status" in data or "result" in data
