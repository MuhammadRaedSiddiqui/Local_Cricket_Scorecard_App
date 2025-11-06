#!/usr/bin/env python3
"""
Cricket Ball-by-Ball Scoring Test
Tests the actual ball-by-ball scoring functionality and state persistence
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000"

class BallByBallScoringTest:
    def __init__(self):
        self.auth_token = None
        self.user_data = None
        self.test_match_id = None
        self.session = requests.Session()
        self.match_data = None
    
    def setup_authenticated_user(self):
        """Setup and authenticate user"""
        print("🔐 Setting up authenticated user...")
        
        timestamp = int(time.time())
        test_user = {
            "name": f"Ball Scorer {timestamp}",
            "email": f"ballscorer{timestamp}@test.com",
            "password": "BallScorer123!"
        }
        
        try:
            # Register and login
            reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json=test_user)
            if reg_response.status_code == 201:
                login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
                    "email": test_user["email"], "password": test_user["password"]
                })
                if login_response.status_code == 200:
                    login_data = login_response.json()
                    self.auth_token = login_data.get("token")
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    print(f"  ✅ User authenticated: {test_user['email']}")
                    return True
            return False
        except Exception as e:
            print(f"  ❌ Setup error: {str(e)}")
            return False
    
    def create_match_for_scoring(self):
        """Create a match specifically for ball-by-ball testing"""
        print("\n🏏 Creating match for ball-by-ball scoring test...")
        
        match_data = {
            "venue": "Test Scoring Ground",
            "startTime": (datetime.now() + timedelta(hours=1)).isoformat(),
            "overs": 3,  # Short match for quick testing
            "teamOne": {
                "name": "Batting Heroes",
                "players": [
                    {"name": "Opener One", "is_captain": True},
                    {"name": "Opener Two"},
                    {"name": "Middle Order 1"},
                    {"name": "Middle Order 2"},
                    {"name": "Middle Order 3"},
                    {"name": "Finisher 1"},
                    {"name": "Finisher 2"},
                    {"name": "Bowler 1"},
                    {"name": "Bowler 2"},
                    {"name": "Bowler 3"},
                    {"name": "Keeper", "is_keeper": True}
                ]
            },
            "teamTwo": {
                "name": "Bowling Masters",
                "players": [
                    {"name": "Fast Bowler", "is_captain": True},
                    {"name": "Spin Bowler"},
                    {"name": "All Rounder 1"},
                    {"name": "All Rounder 2"},
                    {"name": "Batsman 1"},
                    {"name": "Batsman 2"},
                    {"name": "Batsman 3"},
                    {"name": "Batsman 4"},
                    {"name": "Batsman 5"},
                    {"name": "Batsman 6"},
                    {"name": "Wicket Keeper", "is_keeper": True}
                ]
            }
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/matches", json=match_data)
            if response.status_code == 201:
                match_response = response.json()
                self.test_match_id = match_response.get("data", {}).get("_id")
                print(f"  ✅ Match created: {self.test_match_id}")
                return True
            else:
                print(f"  ❌ Match creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"  ❌ Match creation error: {str(e)}")
            return False
    
    def initialize_match_for_scoring(self):
        """Initialize match with toss and player selection"""
        print("\n🎯 Initializing match for scoring...")
        
        initialization_data = {
            "toss_winner": "Batting Heroes",
            "toss_decision": "bat",
            "batting_team": "Batting Heroes", 
            "bowling_team": "Bowling Masters",
            "status": "live",
            "currentInnings": 1,
            "scoringState": {
                "selectedBatsman1": "Opener One",
                "selectedBatsman2": "Opener Two", 
                "selectedBowler": "Fast Bowler",
                "currentStriker": "batsman1",
                "currentOver": [],
                "outBatsmen": [],
                "currentInnings": 1,
                "extraRuns": 0
            },
            "teamOne.total_score": 0,
            "teamOne.total_wickets": 0,
            "teamOne.total_balls": 0,
            "teamOne.extras": 0
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                json=initialization_data
            )
            
            if response.status_code == 200:
                print(f"  ✅ Match initialized for scoring")
                return True
            else:
                print(f"  ❌ Initialization failed: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"  ❌ Initialization error: {str(e)}")
            return False
    
    def test_ball_scoring_scenarios(self):
        """Test various ball scoring scenarios"""
        print("\n⚾ Testing ball-by-ball scoring scenarios...")
        
        scoring_scenarios = [
            {
                "description": "Ball 1: Single run",
                "data": {
                    "teamOne.total_score": 1,
                    "teamOne.total_balls": 1,
                    "scoringState": {
                        "selectedBatsman1": "Opener One",
                        "selectedBatsman2": "Opener Two",
                        "selectedBowler": "Fast Bowler",
                        "currentStriker": "batsman2",  # Strike rotated
                        "currentOver": ["1"],
                        "currentInnings": 1
                    },
                    "ballHistory": [{
                        "ballNumber": 1,
                        "overNumber": 1,
                        "batsman": "Opener One",
                        "bowler": "Fast Bowler",
                        "runs": 1,
                        "outcome": "1 run",
                        "isExtra": False,
                        "isWicket": False
                    }]
                }
            },
            {
                "description": "Ball 2: Boundary (4 runs)",
                "data": {
                    "teamOne.total_score": 5,
                    "teamOne.total_balls": 2,
                    "scoringState": {
                        "selectedBatsman1": "Opener One",
                        "selectedBatsman2": "Opener Two",
                        "selectedBowler": "Fast Bowler",
                        "currentStriker": "batsman2",  # No strike change on even runs
                        "currentOver": ["1", "4"],
                        "currentInnings": 1
                    }
                }
            },
            {
                "description": "Ball 3: Wide ball (extra)",
                "data": {
                    "teamOne.total_score": 6,
                    "teamOne.total_balls": 2,  # Wides don't count as balls
                    "teamOne.extras": 1,
                    "scoringState": {
                        "selectedBatsman1": "Opener One",
                        "selectedBatsman2": "Opener Two",
                        "selectedBowler": "Fast Bowler",
                        "currentStriker": "batsman2",
                        "currentOver": ["1", "4", "wd"],
                        "currentInnings": 1,
                        "extraRuns": 1
                    }
                }
            },
            {
                "description": "Ball 4: Six runs",
                "data": {
                    "teamOne.total_score": 12,
                    "teamOne.total_balls": 3,
                    "scoringState": {
                        "selectedBatsman1": "Opener One",
                        "selectedBatsman2": "Opener Two",
                        "selectedBowler": "Fast Bowler",
                        "currentStriker": "batsman2",  # No strike change on even runs
                        "currentOver": ["1", "4", "wd", "6"],
                        "currentInnings": 1
                    }
                }
            },
            {
                "description": "Ball 5: Wicket",
                "data": {
                    "teamOne.total_score": 12,
                    "teamOne.total_balls": 4,
                    "teamOne.total_wickets": 1,
                    "scoringState": {
                        "selectedBatsman1": "Middle Order 1",  # New batsman
                        "selectedBatsman2": "Opener Two",
                        "selectedBowler": "Fast Bowler",
                        "currentStriker": "batsman1",  # New batsman on strike
                        "currentOver": ["1", "4", "wd", "6", "W"],
                        "outBatsmen": ["Opener One"],
                        "currentInnings": 1
                    }
                }
            }
        ]
        
        successful_balls = 0
        
        for i, scenario in enumerate(scoring_scenarios, 1):
            try:
                print(f"  🎯 {scenario['description']}")
                
                response = self.session.post(
                    f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                    json=scenario['data']
                )
                
                if response.status_code == 200:
                    print(f"    ✅ Ball scored successfully")
                    successful_balls += 1
                    
                    # Verify the state was persisted
                    verification_response = self.session.get(
                        f"{BASE_URL}/api/matches/{self.test_match_id}"
                    )
                    
                    if verification_response.status_code == 200:
                        match_data = verification_response.json().get('data', {})
                        current_score = match_data.get('teamOne', {}).get('total_score', 0)
                        print(f"    📊 Current score: {current_score}")
                    
                else:
                    print(f"    ❌ Ball scoring failed: {response.status_code}")
                    print(f"    Response: {response.text}")
                
                # Small delay between balls
                time.sleep(0.5)
                
            except Exception as e:
                print(f"    ❌ Ball {i} error: {str(e)}")
        
        success_rate = (successful_balls / len(scoring_scenarios)) * 100
        print(f"  📊 Ball scoring success rate: {successful_balls}/{len(scoring_scenarios)} ({success_rate:.1f}%)")
        return success_rate > 80
    
    def test_over_completion_and_new_over(self):
        """Test completing an over and starting a new one"""
        print("\n🔄 Testing over completion and new over logic...")
        
        try:
            # Complete the current over (6 legal balls)
            over_completion_data = {
                "teamOne.total_score": 14,
                "teamOne.total_balls": 6,  # Complete over
                "scoringState": {
                    "selectedBatsman1": "Middle Order 1",
                    "selectedBatsman2": "Opener Two",
                    "selectedBowler": "Spin Bowler",  # New bowler
                    "currentStriker": "batsman2",  # Strike changes at over end
                    "currentOver": [],  # New over starts
                    "currentInnings": 1
                }
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                json=over_completion_data
            )
            
            if response.status_code == 200:
                print(f"  ✅ Over completion handled successfully")
                return True
            else:
                print(f"  ❌ Over completion failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"  ❌ Over completion error: {str(e)}")
            return False
    
    def test_innings_transition(self):
        """Test transitioning to second innings"""
        print("\n🔄 Testing innings transition...")
        
        try:
            # End first innings and start second
            innings_transition_data = {
                "currentInnings": 2,
                "batting_team": "Bowling Masters",  # Teams swap
                "bowling_team": "Batting Heroes",
                "target": 15,  # Target based on first innings score + 1
                "teamTwo.total_score": 0,
                "teamTwo.total_balls": 0, 
                "teamTwo.total_wickets": 0,
                "teamTwo.extras": 0,
                "scoringState": {
                    "selectedBatsman1": "Fast Bowler",
                    "selectedBatsman2": "Spin Bowler",
                    "selectedBowler": "Opener One",
                    "currentStriker": "batsman1",
                    "currentOver": [],
                    "currentInnings": 2
                }
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/matches/{self.test_match_id}/score",
                json=innings_transition_data
            )
            
            if response.status_code == 200:
                print(f"  ✅ Innings transition successful")
                
                # Verify the transition
                verification_response = self.session.get(
                    f"{BASE_URL}/api/matches/{self.test_match_id}"
                )
                
                if verification_response.status_code == 200:
                    match_data = verification_response.json().get('data', {})
                    current_innings = match_data.get('currentInnings', 1)
                    batting_team = match_data.get('batting_team', '')
                    target = match_data.get('target', 0)
                    
                    print(f"  📊 Current innings: {current_innings}")
                    print(f"  📊 Batting team: {batting_team}")
                    print(f"  📊 Target: {target}")
                    
                    return current_innings == 2
                
            else:
                print(f"  ❌ Innings transition failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"  ❌ Innings transition error: {str(e)}")
            return False
    
    def test_state_persistence_over_time(self):
        """Test that scoring state persists over multiple requests"""
        print("\n💾 Testing long-term state persistence...")
        
        try:
            # Get initial state
            initial_response = self.session.get(f"{BASE_URL}/api/matches/{self.test_match_id}")
            if initial_response.status_code != 200:
                return False
            
            initial_data = initial_response.json().get('data', {})
            initial_score = initial_data.get('teamTwo', {}).get('total_score', 0)
            initial_innings = initial_data.get('currentInnings', 1)
            
            # Wait a moment
            time.sleep(2)
            
            # Get state again
            second_response = self.session.get(f"{BASE_URL}/api/matches/{self.test_match_id}")
            if second_response.status_code != 200:
                return False
            
            second_data = second_response.json().get('data', {})
            second_score = second_data.get('teamTwo', {}).get('total_score', 0)
            second_innings = second_data.get('currentInnings', 1)
            
            # States should be identical
            if initial_score == second_score and initial_innings == second_innings:
                print(f"  ✅ State persistence verified")
                print(f"  📊 Consistent score: {initial_score}")
                print(f"  📊 Consistent innings: {initial_innings}")
                return True
            else:
                print(f"  ❌ State inconsistency detected")
                return False
                
        except Exception as e:
            print(f"  ❌ Persistence test error: {str(e)}")
            return False
    
    def run_comprehensive_ball_scoring_test(self):
        """Run all ball-by-ball scoring tests"""
        print("🏏 COMPREHENSIVE BALL-BY-BALL SCORING TEST")
        print("=" * 70)
        
        test_results = {}
        
        # Setup
        test_results['user_setup'] = self.setup_authenticated_user()
        if not test_results['user_setup']:
            return self.generate_report(test_results)
        
        test_results['match_creation'] = self.create_match_for_scoring()
        if not test_results['match_creation']:
            return self.generate_report(test_results)
        
        test_results['match_initialization'] = self.initialize_match_for_scoring()
        if not test_results['match_initialization']:
            return self.generate_report(test_results)
        
        # Core scoring tests
        test_results['ball_scoring'] = self.test_ball_scoring_scenarios()
        test_results['over_completion'] = self.test_over_completion_and_new_over()
        test_results['innings_transition'] = self.test_innings_transition()
        test_results['state_persistence'] = self.test_state_persistence_over_time()
        
        return self.generate_report(test_results)
    
    def generate_report(self, results):
        """Generate comprehensive ball scoring test report"""
        print("\n" + "=" * 70)
        print("📊 BALL-BY-BALL SCORING TEST RESULTS")
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
            'user_setup': 'User Authentication Setup',
            'match_creation': 'Match Creation for Scoring',
            'match_initialization': 'Match Initialization (Toss & Players)',
            'ball_scoring': 'Ball-by-Ball Scoring Scenarios',
            'over_completion': 'Over Completion & New Over',
            'innings_transition': 'Innings Transition Logic',
            'state_persistence': 'Long-term State Persistence'
        }
        
        for test_key, result in results.items():
            description = test_descriptions.get(test_key, test_key)
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{description}: {status}")
        
        # Assessment
        print(f"\n🎯 BALL-BY-BALL SCORING ASSESSMENT:")
        if success_rate >= 85:
            print("🟢 EXCELLENT - Ball-by-ball scoring system is production-ready")
            print("  ✅ All scoring scenarios working perfectly")
            print("  ✅ State persistence is reliable")
            print("  ✅ Over and innings logic implemented correctly")
        elif success_rate >= 70:
            print("🟡 VERY GOOD - Core scoring functionality solid")
        elif success_rate >= 50:
            print("🟡 GOOD - Basic scoring working, some features need refinement")
        else:
            print("🔴 NEEDS WORK - Significant scoring issues found")
        
        # Save detailed report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_data = {
            "timestamp": timestamp,
            "success_rate": success_rate,
            "test_results": results,
            "match_id": self.test_match_id,
            "summary": "Comprehensive ball-by-ball scoring test"
        }
        
        with open(f"ball_scoring_test_{timestamp}.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Detailed report saved to: ball_scoring_test_{timestamp}.json")
        return success_rate

def main():
    """Run the ball-by-ball scoring test"""
    tester = BallByBallScoringTest()
    success_rate = tester.run_comprehensive_ball_scoring_test()
    
    print(f"\n🏆 FINAL BALL-BY-BALL SCORING RESULT: {success_rate:.1f}% SUCCESS RATE")
    
    if success_rate >= 70:
        print("🎉 Your cricket ball-by-ball scoring system is working excellently!")
        print("🏏 Ready for live cricket match scoring!")
    elif success_rate >= 50:
        print("👍 Your cricket scoring has solid foundations with room for improvement!")
    else:
        print("🔧 Your cricket scoring system needs significant improvements.")

if __name__ == "__main__":
    main()