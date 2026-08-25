from app.db.supabase_client import get_supabase
import sys

def inspect_table(table_name: str):
    print(f"\n--- Inspecting Table: {table_name} ---")
    supabase = get_supabase()
    try:
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            print("Existing columns:", list(res.data[0].keys()))
        else:
            print("No rows found. Triggering schema error...")
            supabase.table(table_name).insert({"invalid_column_to_trigger_error": "test"}).execute()
    except Exception as e:
        print("Schema error details:")
        print(str(e))

def main():
    for table in ["applicants", "fact_sheets", "generations", "generation_versions", "generation_errors"]:
        inspect_table(table)

if __name__ == "__main__":
    main()
