"""
Deterministic relint. Runs after Edit (or after Draft, for Family D
which has no Edit stage) with zero LLM cost. This is the safety net
that catches a banned phrase the Edit pass reintroduced while fixing
something else — nothing upstream re-checks that on its own.
"""


import re


HEDGING_PATTERNS = [
    r"\bi am confident\b",
    r"\bi have a clear understanding\b",
    r"\bi firmly believe\b",
    r"\bi am aware of\b",
    r"\bi believe that\b",
    r"\bi feel that\b"
]

def relint(text: str, manifest: dict) -> list[str]:
    banned = manifest.get("banned_phrases", [])
    found = []
    for phrase in banned:
        if not phrase:
            continue
        # Ensure strict word boundaries
        pattern = rf'\b{re.escape(phrase)}\b'
        if re.search(pattern, text, re.IGNORECASE):
            found.append(phrase)
    return found

def detect_hedging(text: str) -> list[str]:
    found = []
    for pattern in HEDGING_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            found.append(pattern.replace(r"\b", ""))
    return found

