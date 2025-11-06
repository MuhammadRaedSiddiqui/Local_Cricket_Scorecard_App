#!/usr/bin/env python3
"""
Comprehensive Test Runner for Local Cricket Scorecard App
This script runs multiple test scenarios and generates a detailed report.
"""

import asyncio
import subprocess
import sys
import os
import time
from datetime import datetime
import json

# Test scenarios to run
TEST_SCENARIOS = [
    {
        "id": "TC021",
        "name": "Landing Page Load Test",
        "file": "TC021_Landing_Page_Loads_Marketing_Content_and_Live_Previews.py",
        "category": "Frontend UI"
    },
    {
        "id": "TC003",
        "name": "User Login Success Test",
        "file": "TC003_User_Login_Success.py",
        "category": "Authentication"
    },
    {
        "id": "TC001",
        "name": "User Registration Test",
        "file": "TC001_User_Registration_Success.py",
        "category": "Authentication"
    },
    {
        "id": "TC006",
        "name": "Match Creation Test",
        "file": "TC006_Create_Match_with_Valid_Data.py",
        "category": "Match Management"
    },
    {
        "id": "TC009",
        "name": "Live Scoring Test",
        "file": "TC009_Live_Scoring_Ball_by_Ball_Valid_Event_Recording.py",
        "category": "Live Scoring"
    },
    {
        "id": "TC020",
        "name": "Dashboard Test",
        "file": "TC020_User_Dashboard_Shows_Relevant_Match_Overviews_and_Actions.py",
        "category": "Dashboard"
    }
]

async def check_app_health():
    """Check if the application is running and healthy"""
    try:
        import requests
        response = requests.get("http://localhost:3000/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Application Health Check: {health_data['status']}")
            print(f"✅ Database Status: {health_data['database']}")
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        return False

def run_single_test(test_file_path):
    """Run a single test file and return results"""
    try:
        start_time = time.time()
        result = subprocess.run(
            [sys.executable, test_file_path],
            capture_output=True,
            text=True,
            timeout=60  # 60 second timeout
        )
        end_time = time.time()
        duration = end_time - start_time
        
        return {
            "success": result.returncode == 0,
            "duration": duration,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "duration": 60,
            "stdout": "",
            "stderr": "Test timed out after 60 seconds",
            "return_code": -1
        }
    except Exception as e:
        return {
            "success": False,
            "duration": 0,
            "stdout": "",
            "stderr": f"Failed to run test: {str(e)}",
            "return_code": -2
        }

async def run_comprehensive_tests():
    """Run all test scenarios and generate a report"""
    print("🚀 Starting Comprehensive Testing for Local Cricket Scorecard App")
    print("=" * 70)
    
    # Check application health first
    print("\n📋 Pre-Test Health Check:")
    app_healthy = await check_app_health()
    if not app_healthy:
        print("❌ Cannot proceed with testing - application is not healthy")
        return
    
    # Initialize results
    test_results = []
    total_tests = len(TEST_SCENARIOS)
    passed_tests = 0
    failed_tests = 0
    
    print(f"\n🧪 Running {total_tests} Test Scenarios:")
    print("-" * 50)
    
    # Run each test
    for i, test_scenario in enumerate(TEST_SCENARIOS, 1):
        test_file = os.path.join("testsprite_tests", test_scenario["file"])
        
        if not os.path.exists(test_file):
            print(f"❌ [{i}/{total_tests}] {test_scenario['name']} - File not found: {test_file}")
            test_results.append({
                "scenario": test_scenario,
                "result": {
                    "success": False,
                    "duration": 0,
                    "stdout": "",
                    "stderr": f"Test file not found: {test_file}",
                    "return_code": -3
                }
            })
            failed_tests += 1
            continue
        
        print(f"🔄 [{i}/{total_tests}] Running {test_scenario['name']}...")
        
        # Run the test
        result = run_single_test(test_file)
        test_results.append({
            "scenario": test_scenario,
            "result": result
        })
        
        # Update counters and show result
        if result["success"]:
            passed_tests += 1
            status = "✅ PASSED"
        else:
            failed_tests += 1
            status = "❌ FAILED"
        
        print(f"   {status} ({result['duration']:.2f}s)")
        if not result["success"] and result["stderr"]:
            print(f"   Error: {result['stderr'][:100]}...")
    
    # Generate summary report
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    # Category breakdown
    print("\n📈 Results by Category:")
    categories = {}
    for test_result in test_results:
        category = test_result["scenario"]["category"]
        if category not in categories:
            categories[category] = {"passed": 0, "failed": 0, "total": 0}
        
        categories[category]["total"] += 1
        if test_result["result"]["success"]:
            categories[category]["passed"] += 1
        else:
            categories[category]["failed"] += 1
    
    for category, stats in categories.items():
        success_rate = (stats["passed"] / stats["total"]) * 100
        print(f"  {category}: {stats['passed']}/{stats['total']} ({success_rate:.1f}%)")
    
    # Detailed results
    print("\n📋 Detailed Test Results:")
    print("-" * 50)
    for test_result in test_results:
        scenario = test_result["scenario"]
        result = test_result["result"]
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        
        print(f"\n{scenario['id']} - {scenario['name']}")
        print(f"  Category: {scenario['category']}")
        print(f"  Status: {status}")
        print(f"  Duration: {result['duration']:.2f}s")
        
        if not result["success"]:
            print(f"  Error: {result['stderr']}")
    
    # Save detailed report to file
    report_data = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100
        },
        "categories": categories,
        "detailed_results": test_results
    }
    
    report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report_data, f, indent=2)
    
    print(f"\n💾 Detailed report saved to: {report_file}")
    
    # Application functionality verification
    print("\n🔍 Additional Application Verification:")
    await verify_application_functionality()
    
    print("\n✨ Comprehensive testing completed!")

async def verify_application_functionality():
    """Verify key application endpoints and functionality"""
    try:
        import requests
        
        # Test endpoints
        endpoints = [
            {"url": "http://localhost:3000/api/health", "name": "Health Check"},
            {"url": "http://localhost:3000/api/test", "name": "API Test Endpoint"},
            {"url": "http://localhost:3000", "name": "Home Page"},
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint["url"], timeout=10)
                if response.status_code == 200:
                    print(f"  ✅ {endpoint['name']}: OK ({response.status_code})")
                else:
                    print(f"  ⚠️  {endpoint['name']}: {response.status_code}")
            except Exception as e:
                print(f"  ❌ {endpoint['name']}: {str(e)}")
    
    except ImportError:
        print("  ℹ️  Install 'requests' library for endpoint verification")

if __name__ == "__main__":
    # Install requests if not available
    try:
        import requests
    except ImportError:
        print("Installing requests library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        import requests
    
    # Run the comprehensive tests
    asyncio.run(run_comprehensive_tests())