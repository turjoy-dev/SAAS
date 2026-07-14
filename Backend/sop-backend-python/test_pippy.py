import requests

print("⚡ Querying local Pippy Debugger on port 8001...")

buggy_code = """
def calculate_area(radius):
    # Bug: using addition instead of multiplication for squaring
    pi = 3.14159
    return pi * (radius + radius)
"""

url = "http://localhost:8001/debug"
params = {
    "code": buggy_code,
    "context": False
}

try:
    response = requests.post(url, params=params, timeout=60)
    if response.status_code == 200:
        print("✅ Pippy Debugger is ACTIVE and working!")
        print("\n--- Bug Analysis from Pippy ---")
        print(response.json().get("answer"))
    else:
        print(f"❌ Pippy Debugger returned status code: {response.status_code}")
except Exception as e:
    print(f"❌ Failed to reach Pippy Debugger on http://localhost:8001/debug")
    print(f"   Error detail: {e}")
    print("\n💡 Make sure the Pippy Debugger server is running on port 8001:")
    print("   cd D:\\Demo_project\\Pr-01\\pippy-debugger-backend")
    print("   python -m uvicorn main:app --reload --port 8001")
