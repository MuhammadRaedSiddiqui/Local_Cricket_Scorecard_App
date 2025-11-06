// Test specific scoring page components and state management
const testScoringPageComponents = async () => {
  console.log('🎯 Testing Scoring Page Components...');

  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'test@123-123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get existing matches
    const matchesResponse = await fetch('http://localhost:3000/api/matches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const matchesData = await matchesResponse.json();
    const allMatches = [
      ...(matchesData.data?.created || []),
      ...(matchesData.data?.invited || [])
    ];

    if (allMatches.length === 0) {
      console.log('❌ No matches found for testing');
      return;
    }

    // Test different match states
    for (const match of allMatches.slice(0, 3)) { // Test first 3 matches
      console.log(`\n📋 Testing match: ${match.venue} (${match.matchCode})`);
      
      // Get match details
      const matchDetailResponse = await fetch(`http://localhost:3000/api/matches/${match._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!matchDetailResponse.ok) {
        console.log(`❌ Failed to fetch match details: ${matchDetailResponse.status}`);
        continue;
      }

      const matchDetail = await matchDetailResponse.json();
      const matchData = matchDetail.data;

      // Analyze current state
      console.log(`  Status: ${matchData.status}`);
      console.log(`  Toss Winner: ${matchData.toss_winner || 'None'}`);
      console.log(`  Batting Team: ${matchData.batting_team || 'None'}`);
      
      if (matchData.scoringState) {
        console.log(`  Has Scoring State: Yes`);
        console.log(`    Batsman1: ${matchData.scoringState.selectedBatsman1 || 'None'}`);
        console.log(`    Batsman2: ${matchData.scoringState.selectedBatsman2 || 'None'}`);
        console.log(`    Bowler: ${matchData.scoringState.selectedBowler || 'None'}`);
        console.log(`    Current Over: [${matchData.scoringState.currentOver?.join(', ') || ''}]`);
      } else {
        console.log(`  Has Scoring State: No`);
      }

      // Test state transitions
      await testStateTransitions(match._id, token, matchData);
    }

  } catch (error) {
    console.error('❌ Error in component testing:', error);
  }
};

const testStateTransitions = async (matchId, token, currentMatchData) => {
  console.log('  🔄 Testing state transitions...');

  try {
    // Test 1: If no toss, test toss completion
    if (!currentMatchData.toss_winner) {
      console.log('    Testing toss completion...');
      const tossResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toss_winner: currentMatchData.teamOne.name,
          toss_decision: 'bat',
          batting_team: currentMatchData.teamOne.name,
          bowling_team: currentMatchData.teamTwo.name,
          status: 'live'
        })
      });

      if (tossResponse.ok) {
        console.log('    ✅ Toss transition successful');
      } else {
        console.log(`    ❌ Toss transition failed: ${tossResponse.status}`);
      }
    }

    // Test 2: If toss done but no players, test player selection
    if (currentMatchData.toss_winner && !currentMatchData.scoringState?.selectedBatsman1) {
      console.log('    Testing player selection...');
      const battingTeam = currentMatchData.batting_team === currentMatchData.teamOne.name 
        ? currentMatchData.teamOne 
        : currentMatchData.teamTwo;
      const bowlingTeam = currentMatchData.bowling_team === currentMatchData.teamOne.name 
        ? currentMatchData.teamOne 
        : currentMatchData.teamTwo;

      if (battingTeam.players.length >= 2 && bowlingTeam.players.length >= 1) {
        const playerSelectionResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            scoringState: {
              selectedBatsman1: battingTeam.players[0].name,
              selectedBatsman2: battingTeam.players[1].name,
              selectedBowler: bowlingTeam.players[0].name,
              currentStriker: 'batsman1',
              currentOver: [],
              outBatsmen: [],
              currentInnings: 1
            }
          })
        });

        if (playerSelectionResponse.ok) {
          console.log('    ✅ Player selection transition successful');
        } else {
          console.log(`    ❌ Player selection transition failed: ${playerSelectionResponse.status}`);
        }
      }
    }

    // Test 3: If players selected, test scoring
    if (currentMatchData.scoringState?.selectedBatsman1) {
      console.log('    Testing scoring update...');
      const currentScore = currentMatchData.teamOne.total_score || 0;
      const currentBalls = currentMatchData.teamOne.total_balls || 0;
      
      const scoringResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'teamOne.total_score': currentScore + 1,
          'teamOne.total_balls': currentBalls + 1,
          scoringState: {
            ...currentMatchData.scoringState,
            currentOver: [...(currentMatchData.scoringState.currentOver || []), '1']
          }
        })
      });

      if (scoringResponse.ok) {
        console.log('    ✅ Scoring update successful');
      } else {
        console.log(`    ❌ Scoring update failed: ${scoringResponse.status}`);
      }
    }

  } catch (error) {
    console.log(`    ❌ State transition error: ${error.message}`);
  }
};

// Test error handling
const testErrorHandling = async () => {
  console.log('\n🚨 Testing Error Handling...');

  try {
    // Login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'test@123-123'
      })
    });
    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test 1: Invalid match ID
    console.log('Testing invalid match ID...');
    const invalidMatchResponse = await fetch('http://localhost:3000/api/matches/invalid-id/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ test: 'data' })
    });

    console.log(`Invalid match ID response: ${invalidMatchResponse.status}`);
    if (invalidMatchResponse.status === 404 || invalidMatchResponse.status === 500) {
      console.log('✅ Correctly handles invalid match ID');
    }

    // Test 2: Missing required data
    const matchesResponse = await fetch('http://localhost:3000/api/matches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const matchesData = await matchesResponse.json();
    const allMatches = [
      ...(matchesData.data?.created || []),
      ...(matchesData.data?.invited || [])
    ];

    if (allMatches.length > 0) {
      const testMatch = allMatches[0];
      
      console.log('Testing malformed scoring data...');
      const malformedResponse = await fetch(`http://localhost:3000/api/matches/${testMatch._id}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invalidField: 'should be ignored',
          'teamOne.total_score': 'not-a-number' // This should be handled gracefully
        })
      });

      console.log(`Malformed data response: ${malformedResponse.status}`);
      if (malformedResponse.ok) {
        console.log('✅ Gracefully handles malformed data');
      } else {
        console.log('⚠️  Returns error for malformed data');
      }
    }

  } catch (error) {
    console.error('❌ Error handling test failed:', error);
  }
};

// Run all tests
console.log('🧪 Starting detailed scoring page tests...');
testScoringPageComponents().then(() => {
  return testErrorHandling();
}).then(() => {
  console.log('\n✅ All detailed tests completed!');
});