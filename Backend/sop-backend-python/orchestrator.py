"""
Orchestrator — the single dispatch point for every document generation.

Hard rule (see RULES.md section 1): no "if country == X" or
"if doc_type == X" anywhere in this file, ever. All country- and
doc-type-specific behavior lives in the manifest. This file only knows
about families.

Persistence to Supabase (generations / generation_versions /
generation_errors) is NOT done here — call this from the API layer's
background task and persist the returned dict there. Keeping this
function pure makes it trivial to unit test without a DB connection.
"""

from knowledge.loader import load_manifest, validate_manifest_shape, ManifestError
from families import family_a, family_b, family_c, family_d

FAMILY_HANDLERS = {
    "A": family_a,
    "B": family_b,
    "C": family_c,
    "D": family_d,
}


def validate_fact_sheet(fact_sheet: dict, manifest: dict) -> None:
    """Stage 0 — free, rule-based, runs before any paid LLM call."""
    required = manifest.get("required_fact_sheet_fields", [])
    missing = [f for f in required if not fact_sheet.get(f)]
    if missing:
        raise ValueError(f"Fact sheet missing required fields: {missing}")


def generate(country: str, doc_type: str, fact_sheet: dict) -> dict:
    manifest = load_manifest(country, doc_type)
    validate_manifest_shape(manifest)

    family = manifest["family"]
    handler = FAMILY_HANDLERS.get(family)
    if handler is None:
        raise ManifestError(
            f"No handler registered for family '{family}' "
            f"(country={country}, doc_type={doc_type}). "
            f"Resolve the family and write its handler before dispatching this doc-type."
        )

    validate_fact_sheet(fact_sheet, manifest)

    result = handler.run(manifest, fact_sheet)
    result["country"] = country
    result["doc_type"] = doc_type
    return result
