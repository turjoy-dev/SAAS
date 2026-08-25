"""
Manifest loader.

Loads /knowledge/manifests/{country}/{doc_type}.json and merges it with
the country's core.json if the manifest declares "extends".

This is the ONLY place that touches the filesystem for manifest data.
Orchestrator and family handlers never read JSON directly.
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve and load .env variables
env_path = Path(__file__).resolve().parents[1] / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

MANIFEST_ROOT = os.getenv("MANIFEST_ROOT", "/knowledge/manifests")

VALID_FAMILIES = {"A", "B", "C", "D"}
REQUIRED_KEYS = ["country", "doc_type", "family"]


class ManifestError(Exception):
    pass




def merge_manifests(core: dict, manifest: dict) -> dict:
    merged = {}
    all_keys = set(core.keys()) | set(manifest.keys())
    for key in all_keys:
        if key in core and key in manifest:
            val_core = core[key]
            val_manifest = manifest[key]
            if isinstance(val_core, list) and isinstance(val_manifest, list):
                # Concatenate and de-duplicate by exact match
                combined = []
                seen_hashable = set()
                seen_unhashable = []
                for item in val_core + val_manifest:
                    try:
                        if item not in seen_hashable:
                            combined.append(item)
                            seen_hashable.add(item)
                    except TypeError:
                        if isinstance(item, dict):
                            key_repr = json.dumps(item, sort_keys=True)
                            if key_repr not in seen_unhashable:
                                combined.append(item)
                                seen_unhashable.append(key_repr)
                        else:
                            if item not in combined:
                                combined.append(item)
                merged[key] = combined
            elif isinstance(val_core, dict) and isinstance(val_manifest, dict):
                # Merge dictionaries
                merged[key] = {**val_core, **val_manifest}
            else:
                # doc-type-specific key overrides core
                merged[key] = val_manifest
        elif key in manifest:
            merged[key] = manifest[key]
        else:
            merged[key] = core[key]
    return merged


import re

def _sanitize_path_component(component: str) -> str:
    if not component or not isinstance(component, str):
        return ""
    if ".." in component or "/" in component or "\\" in component:
        raise ManifestError("Security violation: Directory traversal characters detected.")
    if not re.match(r"^[a-zA-Z0-9_\-\. ]+$", component):
        raise ManifestError("Security violation: Disallowed characters in path parameter.")
    return component

def _verify_safe_path(base_root: str, target_file: str) -> str:
    base_resolved = Path(base_root).resolve()
    target_resolved = Path(target_file).resolve()
    try:
        target_resolved.relative_to(base_resolved)
    except ValueError:
        raise ManifestError("Security violation: Path traversal outside manifest root detected.")
    return str(target_resolved)

def load_manifest(country: str, doc_type: str, university: str = None) -> dict:
    country_clean = _sanitize_path_component(country)
    doc_type_clean = _sanitize_path_component(doc_type)
    
    if country_clean.lower() == "south_korea" and doc_type_clean.lower() == "sop":
        raise ManifestError("South Korea does not support a separate SOP document. Only study_plan is allowed.")
        
    raw_path = os.path.join(MANIFEST_ROOT, country_clean, f"{doc_type_clean}.json")
    path = _verify_safe_path(MANIFEST_ROOT, raw_path)
    
    if not os.path.exists(path):
        raise ManifestError(f"No manifest at {path}")

    with open(path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    merged = manifest
    if "extends" in manifest:
        extends_name = manifest["extends"]
        if "/" in extends_name:
            core_path = os.path.join(MANIFEST_ROOT, f"{extends_name}.json")
        else:
            core_path = os.path.join(MANIFEST_ROOT, country, f"{extends_name}.json")
            
        if not os.path.exists(core_path):
            raise ManifestError(f"{path} extends missing file {core_path}")
        with open(core_path, "r", encoding="utf-8") as f:
            core = json.load(f)
        
        merged = merge_manifests(core, manifest)
        merged["_core"] = core
        merged["_self"] = manifest

    # Load university-specific overrides if provided and exists
    if university:
        uni_slug = university.lower().replace("university", "").replace("of", "").replace(" ", "_").strip("_")
        uni_path = os.path.join(MANIFEST_ROOT, country, "universities", f"{uni_slug}.json")
        if os.path.exists(uni_path):
            with open(uni_path, "r", encoding="utf-8") as f:
                uni_manifest = json.load(f)
            
            status = uni_manifest.get("content_status")
            if status in ("verified", "user_extracted"):
                # Resolve extends inside university manifest if present
                if "extends" in uni_manifest:
                    uni_extends_name = uni_manifest["extends"]
                    if "/" in uni_extends_name:
                        uni_extends_path = os.path.join(MANIFEST_ROOT, f"{uni_extends_name}.json")
                    else:
                        uni_extends_path = os.path.join(MANIFEST_ROOT, country, f"{uni_extends_name}.json")
                    
                    if os.path.exists(uni_extends_path):
                        with open(uni_extends_path, "r", encoding="utf-8") as f:
                            uni_base = json.load(f)
                        
                        # Merge university manifest on top of its extended base
                        uni_manifest = merge_manifests(uni_base, uni_manifest)

                merged = merge_manifests(merged, uni_manifest)
                merged["_university"] = uni_manifest

    return merged


def validate_manifest_shape(manifest: dict) -> None:
    """Fail fast on a malformed manifest before any LLM call happens."""
    missing = [k for k in REQUIRED_KEYS if k not in manifest]
    if missing:
        raise ManifestError(f"Manifest missing required keys: {missing}")

    family = manifest["family"]
    if family not in VALID_FAMILIES:
        raise ManifestError(
            f"Manifest family '{family}' is not resolved (must be one of {VALID_FAMILIES}). "
            f"Do not dispatch this doc-type until the family is confirmed."
        )
