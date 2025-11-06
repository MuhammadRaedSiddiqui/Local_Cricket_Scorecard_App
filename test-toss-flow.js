// Test the toss completion flow
const testTossFlow = async () => {
  console.log('🏏 Testing Toss Flow...');

  try {
    // Step 1: Login first
    console.log('Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test1762329812099@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    const token = loginData.token;

    // Step 2: Create a test match
    console.log('Step 2: Creating test match...');
    const createMatchResponse = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        venue: 'Test Ground',
        startTime: new Date().toISOString(),
        overs: 20,
        teamOne: {
          name: 'Team Alpha',
          players: [
            { name: 'Player A1', is_captain: true, is_keeper: false },
            { name: 'Player A2', is_captain: false, is_keeper: true },
            { name: 'Player A3', is_captain: false, is_keeper: false },
            { name: 'Player A4', is_captain: false, is_keeper: false },
            { name: 'Player A5', is_captain: false, is_keeper: false },
          ]
        },
        teamTwo: {
          name: 'Team Beta',
          players: [
            { name: 'Player B1', is_captain: true, is_keeper: false },
            { name: 'Player B2', is_captain: false, is_keeper: true },
            { name: 'Player B3', is_captain: false, is_keeper: false },
            { name: 'Player B4', is_captain: false, is_keeper: false },
            { name: 'Player B5', is_captain: false, is_keeper: false },
          ]
        },
        isPrivate: false
      })
    });

    if (!createMatchResponse.ok) {
      console.error('Match creation failed:', createMatchResponse.status);
      const errorData = await createMatchResponse.json();
      console.error('Error details:', errorData);
      return;
    }

    const matchData = await createMatchResponse.json();
    console.log('✅ Match created:', matchData.data.matchCode);
    const matchId = matchData.data._id;

    // Step 3: Test toss submission
    console.log('Step 3: Submitting toss...');
    const tossResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        toss_winner: 'Team Alpha',
        toss_decision: 'bat',
        batting_team: 'Team Alpha',
        bowling_team: 'Team Beta',
        status: 'live'
      })
    });

    if (!tossResponse.ok) {
      console.error('Toss submission failed:', tossResponse.status);
      const errorData = await tossResponse.json();
      console.error('Toss error details:', errorData);
      return;
    }

    const tossData = await tossResponse.json();
    console.log('✅ Toss submitted successfully');
    console.log('Toss result:', {
      toss_winner: tossData.data.toss_winner,
      toss_decision: tossData.data.toss_decision,
      batting_team: tossData.data.batting_team,
      bowling_team: tossData.data.bowling_team
    });

    // Step 4: Test player selection
    console.log('Step 4: Submitting player selection...');
    const playersResponse = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scoringState: {
          selectedBatsman1: 'Player A1',
          selectedBatsman2: 'Player A2',
          selectedBowler: 'Player B1',
          currentStriker: 'batsman1',
          currentOver: [],
          outBatsmen: [],
          currentInnings: 1,
          previousBowler: ''
        }
      })
    });

    if (!playersResponse.ok) {
      console.error('Player selection failed:', playersResponse.status);
      const errorData = await playersResponse.json();
      console.error('Players error details:', errorData);
      return;
    }

    const playersData = await playersResponse.json();
    console.log('✅ Players selected successfully');
    console.log('Scoring state:', playersData.data.scoringState);

    console.log('\n🎉 Toss flow test completed successfully!');
    console.log('Match ID for manual testing:', matchId);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testTossFlow();