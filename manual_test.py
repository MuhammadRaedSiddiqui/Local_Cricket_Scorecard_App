#!/usr/bin/env python3
"""
Manual Functionality Tester for Cricket Scoring App
This script tests core API endpoints and functionality manually
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3000"

def test_api_endpoints():
    """Test all API endpoints manually"""
    print("🔍 Testing API Endpoints...")
    
    endpoints = [
        {"method": "GET", "url": f"{BASE_URL}/api/health", "name": "Health Check"},
        {"method": "GET", "url": f"{BASE_URL}/api/test", "name": "Test Endpoint"},
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.request(
                endpoint["method"], 
                endpoint["url"], 
                timeout=10
            )
            duration = time.time() - start_time
            
            result = {
                "name": endpoint["name"],
                "url": endpoint["url"],
                "method": endpoint["method"],
                "status_code": response.status_code,
                "duration": duration,
                "success": 200 <= response.status_code < 300
            }
            
            if result["success"]:
                print(f"  ✅ {endpoint['name']}: {response.status_code} ({duration:.2f}s)")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text[:100]
            else:
                print(f"  ❌ {endpoint['name']}: {response.status_code} ({duration:.2f}s)")
                
            results.append(result)
            
        except Exception as e:
            print(f"  ❌ {endpoint['name']}: {str(e)}")
            results.append({
                "name": endpoint["name"],
                "error": str(e),
                "success": False
            })
    
    return results

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n🔐 Testing Authentication Endpoints...")
    
    # Test user registration
    test_user = {
        "name": f"Test User {int(time.time())}",
        "email": f"test{int(time.time())}@example.com",
        "password": "TestPassword123!"
    }
    
    try:
        print(f"  🔄 Testing registration with email: {test_user['email']}")
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user,
            timeout=10
        )
        
        if response.status_code == 201:
            print(f"  ✅ Registration: {response.status_code}")
            registration_data = response.json()
            
            # Test login with same credentials
            print(f"  🔄 Testing login with registered user...")
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={
                    "email": test_user["email"],
                    "password": test_user["password"]
                },
                timeout=10
            )
            
            if login_response.status_code == 200:
                print(f"  ✅ Login: {login_response.status_code}")
                login_data = login_response.json()
                return {
                    "registration": True,
                    "login": True,
                    "token": login_data.get("token"),
                    "user": login_data.get("user")
                }
            else:
                print(f"  ❌ Login failed: {login_response.status_code}")
                return {"registration": True, "login": False}
                
        else:
            print(f"  ❌ Registration failed: {response.status_code}")
            print(f"    Response: {response.text}")
            return {"registration": False, "login": False}
            
    except Exception as e:
        print(f"  ❌ Auth test error: {str(e)}")
        return {"registration": False, "login": False, "error": str(e)}

def test_protected_endpoints(auth_token=None):
    """Test protected endpoints that require authentication"""
    print("\n🔒 Testing Protected Endpoints...")
    
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
        print(f"  🔑 Using authentication token")
    else:
        print(f"  ⚠️  No authentication token provided")
    
    protected_endpoints = [
        {"method": "GET", "url": f"{BASE_URL}/api/matches", "name": "Get Matches"},
        {"method": "GET", "url": f"{BASE_URL}/api/auth/me", "name": "Get Current User"},
    ]
    
    for endpoint in protected_endpoints:
        try:
            response = requests.request(
                endpoint["method"],
                endpoint["url"],
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"  ✅ {endpoint['name']}: {response.status_code}")
            elif response.status_code == 401:
                print(f"  🔐 {endpoint['name']}: Unauthorized (expected without token)")
            else:
                print(f"  ❌ {endpoint['name']}: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {endpoint['name']}: {str(e)}")

def test_pages():
    """Test page accessibility"""
    print("\n📄 Testing Page Accessibility...")
    
    pages = [
        {"url": f"{BASE_URL}/", "name": "Home Page"},
        {"url": f"{BASE_URL}/login", "name": "Login Page"},
        {"url": f"{BASE_URL}/register", "name": "Register Page"},
    ]
    
    for page in pages:
        try:
            response = requests.get(page["url"], timeout=10)
            if response.status_code == 200:
                print(f"  ✅ {page['name']}: {response.status_code}")
                # Check if it's actually HTML
                if "<!DOCTYPE html>" in response.text or "<html" in response.text:
                    print(f"    📝 Valid HTML content detected")
                else:
                    print(f"    ⚠️  Non-HTML response")
            else:
                print(f"  ❌ {page['name']}: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {page['name']}: {str(e)}")

def main():
    """Run comprehensive manual tests"""
    print("🏏 Cricket Scoring App - Manual Functionality Test")
    print("=" * 60)
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    
    # Test basic API endpoints
    api_results = test_api_endpoints()
    
    # Test pages
    test_pages()
    
    # Test authentication
    auth_results = test_auth_endpoints()
    
    # Test protected endpoints
    token = auth_results.get("token") if isinstance(auth_results, dict) else None
    test_protected_endpoints(token)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 MANUAL TEST SUMMARY")
    print("=" * 60)
    
    api_success = sum(1 for r in api_results if r.get("success", False))
    print(f"API Endpoints: {api_success}/{len(api_results)} passed")
    
    if isinstance(auth_results, dict):
        auth_success = sum([auth_results.get("registration", False), auth_results.get("login", False)])
        print(f"Authentication: {auth_success}/2 passed")
    
    print(f"\n✅ Application Status: {'HEALTHY' if api_success > 0 else 'UNHEALTHY'}")
    
    if token:
        print(f"🔑 Authentication: WORKING (token obtained)")
    else:
        print(f"🔐 Authentication: NEEDS INVESTIGATION")
    
    print(f"\nTest Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()