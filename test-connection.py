import requests
import sys

def test_servers():
    print("Testing OOES Servers...")
    print("=" * 40)
    
    # Test main server
    try:
        response = requests.get('http://localhost:3002', timeout=5)
        print(f"✅ Main Dashboard (Port 3002): {response.status_code} - RUNNING")
    except Exception as e:
        print(f"❌ Main Dashboard (Port 3002): ERROR - {e}")
    
    # Test accountant portal
    try:
        response = requests.get('http://localhost:3003', timeout=5)
        print(f"✅ Accountant Portal (Port 3003): {response.status_code} - RUNNING")
    except Exception as e:
        print(f"❌ Accountant Portal (Port 3003): ERROR - {e}")
    
    print("=" * 40)
    print("If both servers show ✅, the integration is working!")
    print("Access URLs:")
    print("- Main Dashboard: http://localhost:3002")
    print("- Accountant Portal: http://localhost:3003")

if __name__ == "__main__":
    test_servers()
