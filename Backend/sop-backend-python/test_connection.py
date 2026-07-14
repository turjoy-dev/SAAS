"""
Quick end-to-end test: confirms the Python backend can actually talk to
Supabase using the service_role key, and that the schema/FKs work the
same way through the client library as they did through raw SQL.

Run this once after setting up .env, before building the real pipeline
on top of it. If this fails, nothing downstream will work either — fix
this first.

Usage:
    python test_connection.py
"""

import sys
from app.db.supabase_client import get_supabase

# Replace with the real test user UID you created in Supabase Auth
TEST_USER_ID = "7389953e-c41e-4326-b0de-00db83cd2f7b"


def run():
    supabase = get_supabase()

    print("1. Testing connection: reading applicants table...")
    try:
        result = supabase.table("applicants").select("*").limit(5).execute()
        print(f"   OK — connected. Found {len(result.data)} existing row(s).")
    except Exception as e:
        print(f"   FAILED — connection or credentials issue: {e}")
        sys.exit(1)

    print("\n2. Testing insert: creating a new applicant via Python client...")
    try:
        insert_result = (
            supabase.table("applicants")
            .insert({"user_id": TEST_USER_ID, "full_name": "Python Client Test"})
            .execute()
        )
        applicant_id = insert_result.data[0]["id"]
        print(f"   OK — inserted applicant id: {applicant_id}")
    except Exception as e:
        print(f"   FAILED — insert failed: {e}")
        print("   Common cause: TEST_USER_ID doesn't exist in auth.users.")
        print("   Fix: replace TEST_USER_ID at the top of this script with")
        print("   a real UID from Supabase Auth > Users.")
        sys.exit(1)

    print("\n3. Testing FK chain: creating a fact_sheet linked to that applicant...")
    try:
        fs_result = (
            supabase.table("fact_sheets")
            .insert(
                {
                    "applicant_id": applicant_id,
                    "target_country": "australia",
                    "target_course": "Master of Data Science (Python client test)",
                }
            )
            .execute()
        )
        fact_sheet_id = fs_result.data[0]["id"]
        print(f"   OK — inserted fact_sheet id: {fact_sheet_id}")
    except Exception as e:
        print(f"   FAILED — fact_sheet insert failed: {e}")
        sys.exit(1)

    print("\n4. Cleaning up test rows...")
    try:
        supabase.table("applicants").delete().eq("id", applicant_id).execute()
        print("   OK — deleted test applicant (fact_sheet cascades via FK).")
    except Exception as e:
        print(f"   WARNING — cleanup failed, delete manually: {e}")

    print("\nAll checks passed. Backend <-> Supabase connection is confirmed working.")


if __name__ == "__main__":
    run()
