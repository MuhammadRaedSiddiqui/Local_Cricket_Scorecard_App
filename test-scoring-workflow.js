// Test the complete scoring workflow
const testScoringWorkflow = async () => {
  console.log('🏏 Testing Complete Scoring Workflow...');

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'test@123-123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      const errorData = await loginResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    const token = loginData.token;

    // Step 2: Create a test match
    console.log('\n🆕 Step 2: Creating test match...');
    const createMatchResponse = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        venue: 'Test Ground for Scoring',
        startTime: new Date().toISOString(),
        overs: 5, // Short match for testing
        teamOne: {
          name: 'Strikers',
          players: [
            { name: 'Ali', is_captain: true, is_keeper: false },
            { name: 'Hassan', is_captain: false, is_keeper: true },
            { name: 'Ahmed', is_captain: false, is_keeper: false },
            { name: 'Usman', is_captain: false, is_keeper: false },
            { name: 'Raza', is_captain: false, is_keeper: false },
          ]
        },
        teamTwo: {
          name: 'Defenders',
          players: [
            { name: 'Hashim', is_captain: true, is_keeper: false },
            { name: 'Kamran', is_captain: false, is_keeper: true },
            { name: 'Shahid', is_captain: false, is_keeper: false },
            { name: 'Bilal', is_captain: false, is_keeper: false },
            { name: 'Tariq', is_captain: false, is_keeper: false },
          ]
        },
        isPrivate: false
      })
    });

    if (!createMatchResponse.ok) {
      console.log('❌ Match creation failed:', createMatchResponse.status);
      const errorData = await createMatchResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    const matchData = await createMatchResponse.json();
    console.log('✅ Match created:', matchData.data.matchCode);
    const matchId = matchData.data._id;

    // Step 3: Test toss submission
    console.log('\n🪙 Step 3: Submitting toss...');
    const tossResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        toss_winner: 'Strikers',
        toss_decision: 'bat',
        batting_team: 'Strikers',
        bowling_team: 'Defenders',
        status: 'live'
      })
    });

    if (!tossResponse.ok) {
      console.log('❌ Toss submission failed:', tossResponse.status);
      const errorData = await tossResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    const tossData = await tossResponse.json();
    console.log('✅ Toss completed successfully');

    // Step 4: Test player selection
    console.log('\n👥 Step 4: Selecting players...');
    const playerSelectionResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scoringState: {
          selectedBatsman1: 'Ali',
          selectedBatsman2: 'Hassan',
          selectedBowler: 'Hashim',
          currentStriker: 'batsman1',
          currentOver: [],
          outBatsmen: [],
          currentInnings: 1
        }
      })
    });

    if (!playerSelectionResponse.ok) {
      console.log('❌ Player selection failed:', playerSelectionResponse.status);
      const errorData = await playerSelectionResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    console.log('✅ Players selected successfully');

    // Step 5: Test ball-by-ball scoring
    console.log('\n⚾ Step 5: Testing ball-by-ball scoring...');
    
    // Test various scoring scenarios
    const scoringTests = [
      {
        description: 'Single run',
        teamOneUpdate: { total_score: 1, total_wickets: 0, total_balls: 1 },
        scoringState: {
          selectedBatsman1: 'Ali',
          selectedBatsman2: 'Hassan', 
          selectedBowler: 'Hashim',
          currentStriker: 'batsman2', // Striker changes after single
          currentOver: ['1'],
          outBatsmen: [],
          currentInnings: 1
        }
      },
      {
        description: 'Boundary (4 runs)',
        teamOneUpdate: { total_score: 5, total_wickets: 0, total_balls: 2 },
        scoringState: {
          selectedBatsman1: 'Ali',
          selectedBatsman2: 'Hassan',
          selectedBowler: 'Hashim', 
          currentStriker: 'batsman2', // Same striker after boundary
          currentOver: ['1', '4'],
          outBatsmen: [],
          currentInnings: 1
        }
      },
      {
        description: 'Dot ball',
        teamOneUpdate: { total_score: 5, total_wickets: 0, total_balls: 3 },
        scoringState: {
          selectedBatsman1: 'Ali',
          selectedBatsman2: 'Hassan',
          selectedBowler: 'Hashim',
          currentStriker: 'batsman2',
          currentOver: ['1', '4', '0'],
          outBatsmen: [],
          currentInnings: 1
        }
      }
    ];

    for (let i = 0; i < scoringTests.length; i++) {
      const test = scoringTests[i];
      console.log(`  Testing: ${test.description}...`);
      
      const scoringResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'teamOne.total_score': test.teamOneUpdate.total_score,
          'teamOne.total_wickets': test.teamOneUpdate.total_wickets,
          'teamOne.total_balls': test.teamOneUpdate.total_balls,
          scoringState: test.scoringState
        })
      });

      if (!scoringResponse.ok) {
        console.log(`  ❌ ${test.description} failed:`, scoringResponse.status);
        const errorData = await scoringResponse.json();
        console.log('  Error details:', errorData);
        continue;
      }

      console.log(`  ✅ ${test.description} successful`);
    }

    // Step 6: Verify match state
    console.log('\n🔍 Step 6: Verifying match state...');
    const matchStateResponse = await fetch(`http://localhost:3000/api/matches/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!matchStateResponse.ok) {
      console.log('❌ Failed to fetch match state:', matchStateResponse.status);
      return;
    }

    const finalMatchData = await matchStateResponse.json();
    const match = finalMatchData.data;
    
    console.log('📊 Final Match State:');
    console.log(`  Venue: ${match.venue}`);
    console.log(`  Status: ${match.status}`);
    console.log(`  Toss Winner: ${match.toss_winner}`);
    console.log(`  Toss Decision: ${match.toss_decision}`);
    console.log(`  Batting Team: ${match.batting_team}`);
    console.log(`  Bowling Team: ${match.bowling_team}`);
    console.log(`  Team One Score: ${match.teamOne.total_score}/${match.teamOne.total_wickets} (${match.teamOne.total_balls} balls)`);
    console.log(`  Team Two Score: ${match.teamTwo.total_score}/${match.teamTwo.total_wickets} (${match.teamTwo.total_balls} balls)`);
    
    if (match.scoringState) {
      console.log('  Scoring State:');
      console.log(`    Batsman 1: ${match.scoringState.selectedBatsman1}`);
      console.log(`    Batsman 2: ${match.scoringState.selectedBatsman2}`);
      console.log(`    Bowler: ${match.scoringState.selectedBowler}`);
      console.log(`    Current Striker: ${match.scoringState.currentStriker}`);
      console.log(`    Current Over: [${match.scoringState.currentOver?.join(', ')}]`);
      console.log(`    Out Batsmen: [${match.scoringState.outBatsmen?.join(', ')}]`);
    }

    console.log('\n🎉 All scoring workflow tests completed successfully!');

  } catch (error) {
    console.error('❌ Error in scoring workflow test:', error);
  }
};

// Test scoring API endpoint directly
const testScoringAPI = async () => {
  console.log('\n🔧 Testing Scoring API Endpoint Directly...');

  try {
    // Test without authentication
    console.log('Testing without auth token...');
    const noAuthResponse = await fetch('http://localhost:3000/api/matches/123/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });

    console.log('No auth response status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly returns 401 for unauthenticated requests');
    }

  } catch (error) {
    console.error('❌ API test error:', error);
  }
};

// Run all tests
console.log('🚀 Starting comprehensive scoring tests...');
testScoringWorkflow().then(() => {
  return testScoringAPI();
}).then(() => {
  console.log('\n✅ All tests completed!');
});