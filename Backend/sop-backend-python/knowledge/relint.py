"""
Deterministic relint. Runs after Edit (or after Draft, for Family D
which has no Edit stage) with zero LLM cost. This is the safety net
that catches a banned phrase the Edit pass reintroduced while fixing
something else — nothing upstream re-checks that on its own.
"""


def relint(text: str, manifest: dict) -> list[str]:
    banned = manifest.get("banned_phrases", [])
    lowered = text.lower()
    return [phrase for phrase in banned if phrase.lower() in lowered]
