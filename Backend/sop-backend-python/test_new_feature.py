import asyncio
import json
import sys
import os
from fastapi import HTTPException

# Configure manifest root in env if not set
os.environ.setdefault("MANIFEST_ROOT", "knowledge/manifests")

# Import the endpoint and helper from app.routes.sop
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.routes.sop import confirm_gs_structure_endpoint

async def run_test_case(name: str, university: str, expected_fail: bool):
    print(f"\n--- Running Test Case: {name} (Input: '{university}') ---")
    mock_payload = {
        "university": university,
        "structure": [
            {
                "section": "test_section",
                "instruction": "Test instructions...",
                "word_limit": 150
            }
        ],
        "country": "australia"
    }
    
    try:
        res = await confirm_gs_structure_endpoint(mock_payload)
        print(f"Result: SUCCESS! Cached at slug: {res.get('slug')}")
        if expected_fail:
            print("❌ ERROR: Expected overwrite protection to block this, but it succeeded!")
        else:
            print("✅ PASS: Succeeded as expected.")
    except HTTPException as e:
        print(f"Result: BLOCKED (HTTP {e.status_code}): {e.detail}")
        if expected_fail:
            print("✅ PASS: Correctly blocked by overwrite protection.")
        else:
            print("❌ ERROR: Expected success but got blocked!")
    except Exception as e:
        print(f"Result: CRITICAL ERROR: {str(e)}")

async def main():
    print("=== Testing Overwrite Protection & Fuzzy Slugging ===")
    
    # 1. Test "rmit" (slug base, verified in rmit.json)
    await run_test_case("Verify 'rmit'", "rmit", expected_fail=True)
    
    # 2. Test "RMIT University" (exact matches rmit.json's university field)
    await run_test_case("Verify 'RMIT University'", "RMIT University", expected_fail=True)
    
    # 3. Test "UNSW Sydney" (matches unsw.json's university field)
    await run_test_case("Verify 'UNSW Sydney'", "UNSW Sydney", expected_fail=True)
    
    # 4. Test new university "University of Wollongong" (new slug: wollongong)
    await run_test_case("Verify New Uni", "University of Wollongong", expected_fail=False)

if __name__ == "__main__":
    asyncio.run(main())
