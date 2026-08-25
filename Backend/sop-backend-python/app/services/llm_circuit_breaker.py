"""
Resilient Multi-Tier LLM Fallback & Circuit Breaker Engine.

Tier 1: Groq (llama-3.3-70b-versatile / llama-3.1-8b-instant)
Tier 2: Gemini Flash (gemini-2.5-flash / gemini-flash-latest)

Implements tenacity-backed exponential backoff for transient 429 rate-limits,
504 timeouts, circuit breaker state tracking, and Sentry/Bugsink error logging.
"""

import time
import logging
from typing import Dict, Any, Tuple, Optional, List
from enum import Enum
import httpx
import sentry_sdk
from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from app import config
from knowledge.budget_tracker import check_budget, record_call
from app.utils.groq_helper import call_groq_with_retry
from app.utils.gemini_client import call_gemini_rest

logger = logging.getLogger("visawrite.circuit_breaker")

class CircuitState(Enum):
    CLOSED = "CLOSED"      # Healthy
    OPEN = "OPEN"          # Tripped, failing fast
    HALF_OPEN = "HALF_OPEN" # Recovery test


class GenerationUnavailableError(Exception):
    """Raised when all configured LLM providers fail or circuit breakers are open."""
    pass


class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_state_change = time.time()

    def can_execute(self) -> bool:
        now = time.time()
        if self.state == CircuitState.OPEN:
            if now - self.last_state_change > self.recovery_timeout:
                logger.info(f"[CircuitBreaker:{self.name}] Transitioning from OPEN to HALF_OPEN for testing.")
                self.state = CircuitState.HALF_OPEN
                self.last_state_change = now
                return True
            return False
        return True

    def record_success(self):
        self.failure_count = 0
        if self.state != CircuitState.CLOSED:
            logger.info(f"[CircuitBreaker:{self.name}] Circuit recovered! Setting to CLOSED.")
            self.state = CircuitState.CLOSED
            self.last_state_change = time.time()

    def record_failure(self):
        self.failure_count += 1
        self.last_state_change = time.time()
        if self.failure_count >= self.failure_threshold:
            logger.warning(f"[CircuitBreaker:{self.name}] Failure threshold {self.failure_threshold} reached. Tripping to OPEN.")
            self.state = CircuitState.OPEN


# Circuit Breakers per provider
_GROQ_CIRCUIT = CircuitBreaker("groq", failure_threshold=3, recovery_timeout=45.0)
_GEMINI_CIRCUIT = CircuitBreaker("gemini", failure_threshold=3, recovery_timeout=45.0)


# Tenacity retry specification for transient network errors
@retry(
    stop=stop_after_attempt(3),
    wait=wait_random_exponential(min=1, max=6),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException, httpx.RequestError)),
    before_sleep=before_sleep_log(logger, logging.WARNING)
)
async def _execute_groq_attempt(model: str, messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> str:
    return await call_groq_with_retry(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )


async def execute_llm_draft(
    manifest: dict,
    fact_sheet: dict,
    system_text: str,
    user_prompt: str
) -> Tuple[str, str]:
    """
    Executes draft LLM generation across Tier 1 (Groq) and Tier 2 (Gemini).
    Guarantees zero unhandled crashes; logs exceptions to Sentry/Bugsink.
    """
    provider_errors = []

    # --------------------------------------------------------------------------
    # Tier 1: Primary — Groq (Llama 3.3 70B / Llama 3.1 8B)
    # --------------------------------------------------------------------------
    model_groq = config.GROQ_GENERATOR_MODEL or "llama-3.3-70b-versatile"
    provider_key = "groq_70b" if "70b" in model_groq else "groq_8b"

    if config.GROQ_API_KEY and check_budget(provider_key) and _GROQ_CIRCUIT.can_execute():
        try:
            messages = [
                {"role": "system", "content": system_text},
                {"role": "user", "content": user_prompt}
            ]
            text = await _execute_groq_attempt(
                model=model_groq,
                messages=messages,
                temperature=0.7,
                max_tokens=2500
            )
            record_call(provider_key)
            _GROQ_CIRCUIT.record_success()
            logger.info(f"[LLMOrchestrator] Tier 1 Groq ({model_groq}) succeeded.")
            return text, model_groq
        except Exception as e:
            _GROQ_CIRCUIT.record_failure()
            err_msg = f"Tier 1 Groq ({model_groq}) failed: {str(e)}"
            logger.warning(f"[LLMOrchestrator] {err_msg}")
            sentry_sdk.capture_exception(e)
            provider_errors.append(err_msg)

    # --------------------------------------------------------------------------
    # Tier 2: Secondary Fallback — Gemini Flash
    # --------------------------------------------------------------------------
    model_gemini = config.GEMINI_DRAFT_MODEL or "gemini-2.5-flash"
    if config.GEMINI_API_KEY and check_budget("gemini") and _GEMINI_CIRCUIT.can_execute():
        try:
            text = await call_gemini_rest(
                model=model_gemini,
                system_instruction=system_text,
                prompt=user_prompt
            )
            record_call("gemini")
            _GEMINI_CIRCUIT.record_success()
            logger.info(f"[LLMOrchestrator] Tier 2 Gemini ({model_gemini}) fallback succeeded.")
            return text, model_gemini
        except Exception as e:
            _GEMINI_CIRCUIT.record_failure()
            err_msg = f"Tier 2 Gemini ({model_gemini}) failed: {str(e)}"
            logger.error(f"[LLMOrchestrator] {err_msg}")
            sentry_sdk.capture_exception(e)
            provider_errors.append(err_msg)

    # --------------------------------------------------------------------------
    # Exhaustion Failure Handling
    # --------------------------------------------------------------------------
    failure_summary = "; ".join(provider_errors) if provider_errors else "All provider circuits OPEN or budget exhausted"
    logger.critical(f"[LLMOrchestrator] Critical failure: All LLM tiers exhausted. Summary: {failure_summary}")
    
    raise GenerationUnavailableError(
        f"LLM Generation service unavailable across all tiers. Diagnostics: {failure_summary}"
    )
