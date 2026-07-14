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
                seen = set()
                for item in val_core + val_manifest:
                    if item not in seen:
                        combined.append(item)
                        seen.add(item)
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


def load_manifest(country: str, doc_type: str) -> dict:
    path = os.path.join(MANIFEST_ROOT, country, f"{doc_type}.json")
    if not os.path.exists(path):
        raise ManifestError(f"No manifest at {path}")

    with open(path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    if "extends" in manifest:
        core_path = os.path.join(MANIFEST_ROOT, country, f"{manifest['extends']}.json")
        if not os.path.exists(core_path):
            raise ManifestError(f"{path} extends missing file {core_path}")
        with open(core_path, "r", encoding="utf-8") as f:
            core = json.load(f)
        
        # Merge core and manifest with special handling for lists and dicts
        merged = merge_manifests(core, manifest)
        merged["_core"] = core
        merged["_self"] = manifest
        return merged

    return manifest


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
