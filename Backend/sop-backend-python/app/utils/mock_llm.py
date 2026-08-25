import random

class MockLLMClient:
    """
    Drop-in replacement for groq_client/gemini_client/humanizer during logic testing.
    Simulates draft/edit/critique/humanize without any network call —
    verifies retry/fallback/loop/cooldown code paths for free, unlimited times.
    """
    def __init__(self, simulate_failures: bool = False, fail_rate: float = 0.3):
        self.simulate_failures = simulate_failures
        self.fail_rate = fail_rate
        self.call_count = 0

    def _maybe_fail(self, stage: str):
        self.call_count += 1
        if self.simulate_failures and random.random() < self.fail_rate:
            raise RuntimeError(f"[MOCK] Simulated {stage} failure (call #{self.call_count})")

    def draft(self, manifest, fact_sheet):
        self._maybe_fail("draft")
        return f"[MOCK DRAFT for {manifest.get('doc_type', 'SOP')}] Lorem ipsum applicant text...", "mock-model"

    def edit(self, manifest, text, critic_result, fact_sheet=None):
        self._maybe_fail("edit")
        return text + " [edited]", "mock-model"

    def critique(self, manifest, text, fact_sheet, required_provider=None):
        self._maybe_fail("critique")
        score = random.randint(90, 100)
        return {
            "score": score,
            "flags": [] if score >= 90 else ["mock flag"],
            "metrics": {
                "grammar_accuracy": score,
                "humanization_score": score,
                "ai_detection_risk": 5,
                "readability": score,
                "university_requirement_coverage": 100,
                "country_gs_compliance": 100,
                "question_coverage": 100,
                "logical_flow": score,
                "clarity": score,
                "tone_consistency": score,
                "word_limit_compliance": 100
            },
            "reports": {
                "quality_score_report": "All quality gates passed under the strict evaluation protocol.",
                "compliance_report": "The candidate document fully conforms to target country and university guidelines.",
                "grammar_report": "No spelling or grammatical issues detected in the generated content."
            },
            "passed": score >= 90,
            "model_used": "mock-model",
            "critic_type": "llm_judged"
        }

    def humanize(self, text, manifest=None):
        self._maybe_fail("humanize")
        return text + " [humanized]", "mock-model"

mock_llm = MockLLMClient()
