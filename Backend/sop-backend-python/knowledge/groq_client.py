"""
Groq API client wrapper.
Handles Draft and Edit only — Critic lives in gemini_client.py.
"""

import os
import asyncio
from knowledge.prompt_builder import render_system_prompt
from app.utils.groq_helper import call_groq_with_retry
from app.utils.gemini_client import call_gemini_rest
from app import config

MODEL = config.GROQ_GENERATOR_MODEL or "llama-3.3-70b-versatile"
MAX_TOKENS = 2000

def run_sync(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    if loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, coro)
            return future.result()
    else:
        return loop.run_until_complete(coro)

def draft(manifest: dict, fact_sheet: dict) -> str:
    system_text = render_system_prompt(manifest)
    user_prompt = (
        f"Applicant fact sheet:\n{fact_sheet}\n\n"
        "Write the document now, following the system instructions exactly. "
        "Return only the finished document text — no preamble, no headers, "
        "no explanation of what you wrote."
    )
    if config.GROQ_API_KEY:
        messages = [
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_prompt}
        ]
        return run_sync(call_groq_with_retry(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=MAX_TOKENS
        ))
    else:
        # Fallback to Gemini
        return run_sync(call_gemini_rest(
            model=config.GEMINI_DRAFT_MODEL or "gemini-2.5-flash",
            system_instruction=system_text,
            prompt=user_prompt
        ))

def edit(manifest: dict, draft_text: str, critic_result: dict) -> str:
    """
    Single revision pass. Humanizing is folded into this prompt rather
    than being a separate LLM call.
    """
    system_text = render_system_prompt(manifest)
    user_prompt = (
        f"Here is a draft document:\n\n{draft_text}\n\n"
        f"A reviewer flagged these issues (score {critic_result['score']}/100):\n"
        f"{critic_result['flags']}\n\n"
        "Revise the document in a single pass to resolve these issues. "
        "While revising, also make the writing sound naturally human: vary "
        "sentence length, cut robotic transitions and filler, avoid repeating "
        "sentence structures. Do not introduce any new claims not supported "
        "by the fact sheet. Return only the finished, revised document text — "
        "no preamble, no list of changes made."
    )
    if config.GROQ_API_KEY:
        messages = [
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_prompt}
        ]
        return run_sync(call_groq_with_retry(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=MAX_TOKENS
        ))
    else:
        # Fallback to Gemini
        return run_sync(call_gemini_rest(
            model=config.GEMINI_DRAFT_MODEL or "gemini-2.5-flash",
            system_instruction=system_text,
            prompt=user_prompt
        ))
