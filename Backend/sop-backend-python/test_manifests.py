import os
from knowledge.loader import load_manifest, validate_manifest_shape

countries_docs = {
    "australia": ["sop", "gs", "gap_explanation"],
    "germany": ["motivation_letter", "gap_explanation"],
    "canada": ["sop", "loe", "gap_explanation"],
    "uk": ["sop", "personal_statement", "gap_explanation"],
    "ireland": ["sop", "personal_statement", "gap_explanation"],
    "malaysia": ["sop", "gap_explanation"],
    "south_korea": ["sop", "study_plan", "gap_explanation"]
}

if __name__ == "__main__":
    print("=== Testing Manifest Loading & Shape Validation ===")
    errors = 0
    for country, docs in countries_docs.items():
        for doc in docs:
            try:
                manifest = load_manifest(country, doc)
                validate_manifest_shape(manifest)
                print(f"✅ {country}/{doc} loads successfully. Family: {manifest['family']}")
            except Exception as e:
                print(f"❌ {country}/{doc} failed: {e}")
                errors += 1
    
    if errors == 0:
        print("\nAll manifests validated successfully!")
    else:
        print(f"\nCompleted with {errors} errors.")
