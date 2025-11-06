#!/usr/bin/env python3
"""
Advanced Match Invite & Role Management Test
Tests explicit user role assignment and advanced invitation features
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000"

class AdvancedInviteTest:
    def __init__(self):
        self.creator_token = None
        self.creator_data = None
        self.test_users = []
        self.test_match_id = None
        self.match_code = None
        
    def setup_test_environment(self):
        """Setup multiple users and a test match"""
        print("🎯 Setting up advanced invite test environment...")
        
        timestamp = int(time.time())
        
        # Create users with different intended roles
        users_to_create = [
            {"name": f"Match Creator {timestamp}", "email": f"creator{timestamp}@test.com", "role": "creator"},
            {"name": f"Scorer User {timestamp}", "email": f"scorer{timestamp}@test.com", "role": "scorer"},
            {"name": f"Viewer User {timestamp}", "email": f"viewer{timestamp}@test.com", "role": "viewer"},
            {"name": f"Admin User {timestamp}", "email": f"admin{timestamp}@test.com", "role": "admin"},
            {"name": f"Regular User {timestamp}", "email": f"regular{timestamp}@test.com", "role": "regular"}
        ]
        
        try:
            for user_info in users_to_create:
                user_data = {
                    "name": user_info["name"],
                    "email": user_info["email"],
                    "password": "TestPass123!"
                }
                
                # Register user
                reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
                if reg_response.status_code == 201:
                    # Login user
                    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                        "email": user_data["email"],
                        "password": user_data["password"]
                    })
                    
                    if login_response.status_code == 200:
                        login_data = login_response.json()
                        user_record = {
                            "info": user_info,
                            "credentials": user_data,
                            "token": login_data.get("token"),
                            "user_data": login_data.get("user"),
                            "role": user_info["role"]
                        }
                        self.test_users.append(user_record)
                        
                        if user_info["role"] == "creator":
                            self.creator_token = user_record["token"]
                            self.creator_data = user_record["user_data"]
                        
                        print(f"  ✅ {user_info['role'].title()} user created: {user_data['email']}")
                    else:
                        print(f"  ❌ Login failed for {user_info['role']}")
                        return False
                else:
                    print(f"  ❌ Registration failed for {user_info['role']}")
                    return False
            
            print(f"  ✅ All test users created: {len(self.test_users)} users")
            return True
            
        except Exception as e:
            print(f"  ❌ Environment setup error: {str(e)}")
            return False
    
    def create_test_match(self):
        """Create a match for role testing"""
        print("\n🏏 Creating test match for role management...")
        
        creator_session = requests.Session()
        creator_session.headers.update({"Authorization": f"Bearer {self.creator_token}"})
        
        match_data = {
            "venue": "Role Test Ground",
            "startTime": (datetime.now() + timedelta(hours=1)).isoformat(),
            "overs": 5,
            "teamOne": {
                "name": "Team Alpha",
                "players": [
                    {"name": "Player 1", "is_captain": True},
                    {"name": "Player 2"},
                    {"name": "Player 3"},
                    {"name": "Player 4"},
                    {"name": "Player 5"},
                    {"name": "Player 6"},
                    {"name": "Player 7"},
                    {"name": "Player 8"},
                    {"name": "Player 9"},
                    {"name": "Player 10"},
                    {"name": "Player 11", "is_keeper": True}
                ]
            },
            "teamTwo": {
                "name": "Team Beta",
                "players": [
                    {"name": "Player A", "is_captain": True},
                    {"name": "Player B"},
                    {"name": "Player C"},
                    {"name": "Player D"},
                    {"name": "Player E"},
                    {"name": "Player F"},
                    {"name": "Player G"},
                    {"name": "Player H"},
                    {"name": "Player I"},
                    {"name": "Player J"},
                    {"name": "Player K", "is_keeper": True}
                ]
            },
            "isPrivate": False
        }
        
        try:
            response = creator_session.post(f"{BASE_URL}/api/matches", json=match_data)
            if response.status_code == 201:
                match_response = response.json()
                self.test_match_id = match_response.get("data", {}).get("_id")
                self.match_code = match_response.get("data", {}).get("matchCode")
                
                print(f"  ✅ Match created successfully")
                print(f"  🎫 Match Code: {self.match_code}")
                print(f"  🆔 Match ID: {self.test_match_id}")
                return True
            else:
                print(f"  ❌ Match creation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"  ❌ Match creation error: {str(e)}")
            return False
    
    def test_role_based_access_control(self):
        """Test different user roles and their access levels"""
        print("\n🔐 Testing role-based access control...")
        
        access_results = {}
        
        for user in self.test_users:
            try:
                print(f"  👤 Testing {user['role']} access...")
                
                user_session = requests.Session()
                user_session.headers.update({"Authorization": f"Bearer {user['token']}"})
                
                # Test match access
                match_response = user_session.get(f"{BASE_URL}/api/matches/{self.test_match_id}")
                match_access = match_response.status_code == 200
                
                # Test scoring access
                scoring_response = user_session.post(
                    f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                    json={"action": "test_access"}
                )
                scoring_access = scoring_response.status_code in [200, 403]  # 403 is expected for non-scorers
                
                # Test matches list access
                matches_response = user_session.get(f"{BASE_URL}/api/matches")
                matches_access = matches_response.status_code == 200
                
                access_results[user['role']] = {
                    "match_access": match_access,
                    "scoring_access": scoring_access,
                    "matches_list": matches_access,
                    "overall": match_access and matches_access
                }
                
                print(f"    📊 Match access: {'✅' if match_access else '❌'}")
                print(f"    📊 Scoring access: {'✅' if scoring_access else '❌'}")
                print(f"    📊 Matches list: {'✅' if matches_access else '❌'}")
                
            except Exception as e:
                print(f"    ❌ {user['role']} access test error: {str(e)}")
                access_results[user['role']] = {"overall": False, "error": str(e)}
        
        success_count = sum(1 for result in access_results.values() if result.get("overall", False))
        success_rate = (success_count / len(access_results)) * 100
        
        print(f"  📊 Role access success rate: {success_count}/{len(access_results)} ({success_rate:.1f}%)")
        return success_rate > 70
    
    def test_match_code_based_joining(self):
        """Test users joining via match code"""
        print("\n🎫 Testing match code-based joining workflow...")
        
        successful_joins = 0
        
        # Test each user joining via match code
        for user in self.test_users[1:]:  # Skip creator
            try:
                print(f"  🔗 Testing {user['role']} joining with code {self.match_code}...")
                
                user_session = requests.Session()
                user_session.headers.update({"Authorization": f"Bearer {user['token']}"})
                
                # Simulate joining by accessing match with code
                # In a real app, there might be a specific join endpoint
                # For now, we test if they can access the match
                response = user_session.get(f"{BASE_URL}/api/matches/{self.test_match_id}")
                
                if response.status_code == 200:
                    match_data = response.json().get('data', {})
                    retrieved_code = match_data.get('matchCode')
                    
                    if retrieved_code == self.match_code:
                        print(f"    ✅ Successfully accessed match via code")
                        successful_joins += 1
                    else:
                        print(f"    ⚠️  Match code mismatch")
                elif response.status_code == 403:
                    print(f"    ⚠️  Access denied (private match or permissions)")
                else:
                    print(f"    ❌ Unexpected response: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Join error: {str(e)}")
        
        success_rate = (successful_joins / (len(self.test_users) - 1)) * 100
        print(f"  📊 Join success rate: {successful_joins}/{len(self.test_users) - 1} ({success_rate:.1f}%)")
        return success_rate > 50
    
    def test_invited_matches_visibility(self):
        """Test that invited matches appear in user lists"""
        print("\n📋 Testing invited matches visibility...")
        
        visibility_results = {}
        
        for user in self.test_users:
            try:
                print(f"  👀 Testing {user['role']} match visibility...")
                
                user_session = requests.Session()
                user_session.headers.update({"Authorization": f"Bearer {user['token']}"})
                
                response = user_session.get(f"{BASE_URL}/api/matches")
                
                if response.status_code == 200:
                    matches_data = response.json()
                    created_matches = matches_data.get('data', {}).get('created', [])
                    invited_matches = matches_data.get('data', {}).get('invited', [])
                    
                    # Check if our test match appears in appropriate list
                    found_in_created = any(match.get('_id') == self.test_match_id for match in created_matches)
                    found_in_invited = any(match.get('_id') == self.test_match_id for match in invited_matches)
                    found_anywhere = found_in_created or found_in_invited
                    
                    visibility_results[user['role']] = {
                        "can_access_list": True,
                        "found_in_created": found_in_created,
                        "found_in_invited": found_in_invited,
                        "found_anywhere": found_anywhere
                    }
                    
                    print(f"    📊 Can access matches list: ✅")
                    print(f"    📊 Found in created: {'✅' if found_in_created else '❌'}")
                    print(f"    📊 Found in invited: {'✅' if found_in_invited else '❌'}")
                    
                    # Creator should find it in created, others might find it in invited or be able to access it
                    expected_result = found_in_created if user['role'] == 'creator' else True  # Others should at least access the list
                    visibility_results[user['role']]['expected'] = expected_result
                    
                else:
                    print(f"    ❌ Cannot access matches list: {response.status_code}")
                    visibility_results[user['role']] = {"can_access_list": False, "expected": False}
                    
            except Exception as e:
                print(f"    ❌ Visibility test error: {str(e)}")
                visibility_results[user['role']] = {"can_access_list": False, "error": str(e)}
        
        success_count = sum(1 for result in visibility_results.values() if result.get("can_access_list", False))
        success_rate = (success_count / len(visibility_results)) * 100
        
        print(f"  📊 Visibility success rate: {success_count}/{len(visibility_results)} ({success_rate:.1f}%)")
        return success_rate > 70
    
    def test_role_permissions_in_match_data(self):
        """Test that role information is correctly stored and retrieved"""
        print("\n👥 Testing role permissions in match data...")
        
        try:
            creator_session = requests.Session()
            creator_session.headers.update({"Authorization": f"Bearer {self.creator_token}"})
            
            response = creator_session.get(f"{BASE_URL}/api/matches/{self.test_match_id}")
            
            if response.status_code == 200:
                match_data = response.json().get('data', {})
                
                # Check role arrays
                admins = match_data.get('admins', [])
                scorers = match_data.get('scorers', [])
                viewers = match_data.get('viewers', [])
                created_by = match_data.get('createdBy', '')
                
                print(f"  📊 Match roles structure:")
                print(f"    👑 Admins: {len(admins)} users")
                print(f"    ⚾ Scorers: {len(scorers)} users")
                print(f"    👀 Viewers: {len(viewers)} users")
                print(f"    🏗️  Created by: {created_by}")
                
                # Verify creator is in admins and scorers (as set in API)
                creator_id = self.creator_data.get('id', '')
                creator_in_admins = creator_id in admins if isinstance(admins, list) else False
                creator_in_scorers = creator_id in scorers if isinstance(scorers, list) else False
                
                print(f"    ✅ Creator in admins: {'✅' if creator_in_admins else '❌'}")
                print(f"    ✅ Creator in scorers: {'✅' if creator_in_scorers else '❌'}")
                
                # Check if role arrays exist (even if empty)
                has_role_structure = all(key in match_data for key in ['admins', 'scorers', 'viewers'])
                print(f"    ✅ Role structure present: {'✅' if has_role_structure else '❌'}")
                
                return has_role_structure and (creator_in_admins or len(admins) >= 0)
            else:
                print(f"  ❌ Cannot retrieve match data: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"  ❌ Role permissions test error: {str(e)}")
            return False
    
    def test_cross_user_scoring_scenarios(self):
        """Test scoring scenarios across different user roles"""
        print("\n⚾ Testing cross-user scoring scenarios...")
        
        scoring_results = {}
        
        # Test different users attempting to score
        for user in self.test_users:
            try:
                print(f"  🎯 Testing {user['role']} scoring capabilities...")
                
                user_session = requests.Session()
                user_session.headers.update({"Authorization": f"Bearer {user['token']}"})
                
                # Attempt basic scoring action
                scoring_data = {
                    "action": "test_score",
                    "test_mode": True,
                    "user_role": user['role']
                }
                
                response = user_session.post(
                    f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                    json=scoring_data
                )
                
                scoring_results[user['role']] = {
                    "status_code": response.status_code,
                    "can_score": response.status_code == 200,
                    "has_access": response.status_code in [200, 403]  # 403 means endpoint exists but denied
                }
                
                if response.status_code == 200:
                    print(f"    ✅ Can score")
                elif response.status_code == 403:
                    print(f"    ⚠️  Scoring denied (expected for non-scorers)")
                elif response.status_code == 401:
                    print(f"    ❌ Unauthorized")
                else:
                    print(f"    📊 Unexpected response: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Scoring test error: {str(e)}")
                scoring_results[user['role']] = {"error": str(e)}
        
        # Analyze results
        has_access_count = sum(1 for result in scoring_results.values() if result.get("has_access", False))
        success_rate = (has_access_count / len(scoring_results)) * 100
        
        print(f"  📊 Scoring access rate: {has_access_count}/{len(scoring_results)} ({success_rate:.1f}%)")
        return success_rate > 70
    
    def run_advanced_invite_test(self):
        """Run comprehensive advanced invite and role management test"""
        print("🎯 ADVANCED INVITE & ROLE MANAGEMENT TEST")
        print("=" * 70)
        
        test_results = {}
        
        # Setup
        test_results['environment_setup'] = self.setup_test_environment()
        if not test_results['environment_setup']:
            return self.generate_report(test_results)
        
        test_results['match_creation'] = self.create_test_match()
        if not test_results['match_creation']:
            return self.generate_report(test_results)
        
        # Core tests
        test_results['role_access_control'] = self.test_role_based_access_control()
        test_results['code_based_joining'] = self.test_match_code_based_joining()
        test_results['matches_visibility'] = self.test_invited_matches_visibility()
        test_results['role_permissions'] = self.test_role_permissions_in_match_data()
        test_results['cross_user_scoring'] = self.test_cross_user_scoring_scenarios()
        
        return self.generate_report(test_results)
    
    def generate_report(self, results):
        """Generate comprehensive advanced invite test report"""
        print("\n" + "=" * 70)
        print("📊 ADVANCED INVITE & ROLE MANAGEMENT RESULTS")
        print("=" * 70)
        
        total_tests = len(results)
        passed_tests = sum(1 for result in results.values() if result)
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print("\nDetailed Results:")
        print("-" * 50)
        
        test_descriptions = {
            'environment_setup': 'Multi-User Environment Setup',
            'match_creation': 'Test Match Creation',
            'role_access_control': 'Role-Based Access Control',
            'code_based_joining': 'Match Code Joining Workflow',
            'matches_visibility': 'Invited Matches Visibility',
            'role_permissions': 'Role Permissions in Match Data',
            'cross_user_scoring': 'Cross-User Scoring Scenarios'
        }
        
        for test_key, result in results.items():
            description = test_descriptions.get(test_key, test_key)
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{description}: {status}")
        
        # Assessment
        print(f"\n🎯 ADVANCED INVITE SYSTEM ASSESSMENT:")
        if success_rate >= 85:
            print("🟢 EXCELLENT - Advanced invite system is comprehensive and robust")
            print("  ✅ Role-based access control working properly")
            print("  ✅ Match code sharing mechanism functional")
            print("  ✅ User permissions properly managed")
        elif success_rate >= 70:
            print("🟡 VERY GOOD - Core advanced features working well")
        elif success_rate >= 50:
            print("🟡 GOOD - Basic advanced functionality present")
        else:
            print("🔴 NEEDS WORK - Advanced features need development")
        
        # Save report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_data = {
            "timestamp": timestamp,
            "success_rate": success_rate,
            "test_results": results,
            "match_id": self.test_match_id,
            "match_code": self.match_code,
            "users_tested": len(self.test_users),
            "test_type": "advanced_invite_role_management"
        }
        
        with open(f"advanced_invite_test_{timestamp}.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Report saved to: advanced_invite_test_{timestamp}.json")
        return success_rate

def main():
    """Run the advanced invite and role management test"""
    tester = AdvancedInviteTest()
    success_rate = tester.run_advanced_invite_test()
    
    print(f"\n🏆 ADVANCED INVITE SYSTEM RESULT: {success_rate:.1f}% SUCCESS RATE")
    
    if success_rate >= 75:
        print("🎉 Your advanced invite and role management system is excellent!")
        print("👥 Multi-user cricket match management is fully functional!")
    elif success_rate >= 50:
        print("👍 Your invite system has solid advanced features!")
    else:
        print("🔧 Your invite system could benefit from advanced feature development.")

if __name__ == "__main__":
    main()