import os
from supabase import create_client, Client

SUPABASE_URL = "https://ngexukqvudjsyhkwovmx.supabase.co"
SUPABASE_KEY = "sb_publishable_m0zc0T2UIo7X3LZ7mTEwjg_LMjlMztQ"

def test_supabase_direct():
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("--- Testing Supabase Connection ---")
        
        # Try to select
        print("Querying 'resumes' table...")
        res = supabase.table("resumes").select("*").execute()
        print(f"Success! Found {len(res.data)} resumes.")
        
        # Try to insert dummy
        print("\nAttempting to insert test record...")
        try:
            ins = supabase.table("resumes").upsert({"filename": "test_connection_v2.txt", "full_text": "testing v2"}).execute()
            print("Insert/Upsert Success!")
            
            # Try to delete dummy
            print("\nAttempting to delete test record...")
            dele = supabase.table("resumes").delete().eq("filename", "test_connection_v2.txt").execute()
            print("Delete Success!")
            
        except Exception as e:
            print(f"Write operation failed: {str(e)}")

    except Exception as e:
        print(f"Supabase Client Error: {str(e)}")

if __name__ == "__main__":
    test_supabase_direct()
