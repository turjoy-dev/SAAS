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


import asyncio
from app import config

def validate_fact_sheet(fact_sheet: dict, manifest: dict) -> None:
    """Stage 0 — free, rule-based, runs before any paid LLM call."""
    required = manifest.get("required_fact_sheet_fields", [])
    missing = []
    for f in required:
        if f in ("fullName", "applicant_name"):
            if not (fact_sheet.get("fullName") or fact_sheet.get("applicant_name")):
                missing.append(f)
        elif f == "gap_start":
            if not (fact_sheet.get("gap_start") or fact_sheet.get("startDate") or fact_sheet.get("gap_duration")):
                missing.append(f)
        elif f == "gap_end":
            if not (fact_sheet.get("gap_end") or fact_sheet.get("endDate") or fact_sheet.get("gap_duration")):
                missing.append(f)
        elif not fact_sheet.get(f):
            missing.append(f)
            
    if missing:
        raise ValueError(f"Fact sheet missing required fields: {missing}")


async def generate(country: str, doc_type: str, fact_sheet: dict) -> dict:
    # 1. UK Undergrad vs Postgrad Gating logic
    if country.lower() == "uk" and doc_type in ("sop", "personal_statement"):
        is_pg = None
        level = (fact_sheet.get("level") or fact_sheet.get("degree_level") or "").lower()
        if "post" in level or "master" in level or "phd" in level or "pg" in level:
            is_pg = True
        elif "under" in level or "bachelor" in level or "ug" in level:
            is_pg = False
        else:
            program = (fact_sheet.get("program") or fact_sheet.get("programName") or "").lower()
            if any(k in program for k in ["master", "msc", "ma ", "mba", "phd", "mphil", "postgrad"]):
                is_pg = True
            elif any(k in program for k in ["bachelor", "bsc", "ba ", "ug", "undergrad"]):
                is_pg = False
            else:
                prior = (fact_sheet.get("prior_degree") or "").lower()
                if any(k in prior for k in ["bachelor", "bsc", "ba ", "bba", "btech"]):
                    is_pg = True
                elif prior:
                    is_pg = False

        if is_pg is None:
            raise ValueError(
                "UK ROUTING ERROR: Unable to resolve undergraduate vs postgraduate status from applicant fact sheet. "
                "Please specify target degree level (Master/Bachelor/Postgrad/Undergrad) to route to the correct manifest."
            )
        doc_type = "sop" if is_pg else "personal_statement"

    manifest = load_manifest(country, doc_type, fact_sheet.get("university"))
    
    # 2. Canada LOE Refusal Escalation logic
    if country.lower() == "canada" and doc_type == "loe":
        has_refusal = False
        if fact_sheet.get("has_prior_refusal") or fact_sheet.get("has_refusals"):
            has_refusal = True
        elif fact_sheet.get("prior_refusals") or fact_sheet.get("refusal_reasons") or fact_sheet.get("refusals"):
            has_refusal = True
            
        if has_refusal:
            refusal_instruction = (
                "Systematically address each reason for refusal from your prior visa application. "
                "Provide clear, factual, and document-supported counter-evidence or mitigations for each refusal point."
            )
            new_structure = []
            for item in manifest.get("structure", []):
                new_structure.append(item)
                if item.get("section") == "introduction":
                    new_structure.append({
                        "section": "address_prior_refusals",
                        "instruction": refusal_instruction
                    })
            manifest["structure"] = new_structure

    validate_manifest_shape(manifest)

    family = manifest["family"]
    
    # Deterministic Structural Template Variant Selection (Families A & C)
    if family in ("A", "C"):
        variants = manifest.get("structural_variants", ["skeleton_a", "skeleton_b", "skeleton_c"])
        if variants and isinstance(variants, list) and len(variants) > 0:
            applicant_id = (
                fact_sheet.get("applicant_id") or
                fact_sheet.get("applicantId") or
                fact_sheet.get("fullName") or
                "default_applicant"
            )
            import hashlib
            hash_val = int(hashlib.md5(applicant_id.encode("utf-8")).hexdigest(), 16)
            variant_idx = hash_val % len(variants)
            selected_variant = variants[variant_idx]
            manifest["selected_structural_variant"] = selected_variant
            
            variant_structures = manifest.get("variant_structures", {})
            if selected_variant in variant_structures:
                manifest["structure"] = variant_structures[selected_variant]

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
    result["edited"] = result.get("edit_loops_used", 0) > 0

    # Task 4 — Optional feature-flagged Claude Sonnet polish step
    if getattr(config, "ENABLE_CLAUDE_POLISH", False):
        from app.utils.anthropic_client import polish_with_claude
        result = await polish_with_claude(manifest, fact_sheet, result)

    return result

