import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match, { IMatch, IPlayer, ITeam, IScoringState, IBall } from '@/models/Match';
import { verifyToken } from '@/lib/auth';
import { calculateBallOutcome } from '@/utils/scoringValidations';
import { pusherServer } from '@/lib/pusher';
import mongoose from 'mongoose';

interface Params {
  params: { id: string };
}

interface RecordBallRequest {
  outcome: string;
  extraRuns: number;
}

// --- (All your server-side helper functions remain the same) ---
// finalizeMatch(...)
// handleInningsCompletion(...)
// updatePlayerStats(...)
// --- (Paste those helper functions here) ---
function finalizeMatch(match: IMatch) {
  match.status = 'completed';
  const battingTeam = match.batting_team === match.teamOne.name ? match.teamOne : match.teamTwo;
  const bowlingTeam = match.bowling_team === match.teamOne.name ? match.teamOne : match.teamTwo;
  const target = match.target || 0;
  if (battingTeam.total_score >= target) {
    const wicketsLeft = (battingTeam.players.length || 10) - battingTeam.total_wickets;
    console.log(`[Server] ${battingTeam.name} won by ${wicketsLeft} wickets`);
  } else {
    const runDiff = target - 1 - battingTeam.total_score;
    console.log(`[Server] ${bowlingTeam.name} won by ${runDiff} runs`);
  }
  match.scoringState = null;
}

function handleInningsCompletion(match: IMatch) {
  if (match.currentInnings === 1) {
    console.log('[Server] First innings complete');
    const battingTeam = match.batting_team === match.teamOne.name ? match.teamOne : match.teamTwo;
    match.target = battingTeam.total_score + 1;
    const oldBattingTeam = match.batting_team;
    match.batting_team = match.bowling_team;
    match.bowling_team = oldBattingTeam;
    match.currentInnings = 2;
    match.scoringState = {
      selectedBatsman1: '',
      selectedBatsman2: '',
      selectedBowler: '',
      previousBowler: '',
      currentStriker: 'batsman1',
      currentOver: [],
      outBatsmen: [],
      currentInnings: 2,
      extraRuns: 0,
    };
  } else {
    console.log('[Server] Second innings complete. Finalizing match.');
    finalizeMatch(match);
  }
}

function updatePlayerStats(
  outcome: string, runs: number, isWicket: boolean, isExtra: boolean,
  ballCounts: boolean, extraRuns: number, strikerName: string, bowlerName: string,
  battingTeam: ITeam, bowlingTeam: ITeam
) {
  const batsman = battingTeam.players.find((p: IPlayer) => p.name === strikerName);
  if (batsman) {
    if (ballCounts) batsman.balls_played = (batsman.balls_played || 0) + 1;
    if (!isExtra) batsman.runs_scored = (batsman.runs_scored || 0) + runs;
    if (runs === 4) batsman.fours = (batsman.fours || 0) + 1;
    if (runs === 6) batsman.sixes = (batsman.sixes || 0) + 1;
    if (isWicket) batsman.is_out = true;
  }
  const bowler = bowlingTeam.players.find((p: IPlayer) => p.name === bowlerName);
  if (bowler) {
    if (ballCounts) bowler.balls_bowled = (bowler.balls_bowled || 0) + 1;
    if (!isExtra || outcome === 'NB') {
      bowler.runs_conceded = (bowler.runs_conceded || 0) + runs;
    } else if (outcome === 'WD') {
      bowler.runs_conceded = (bowler.runs_conceded || 0) + (runs - extraRuns);
    }
    if (isWicket) bowler.wickets = (bowler.wickets || 0) + 1;
  }
}
// --- END OF HELPER FUNCTIONS ---


export async function POST(request: NextRequest, { params }: Params) {
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { outcome, extraRuns }: RecordBallRequest = await request.json();
  if (!outcome) {
    return NextResponse.json({ error: 'Invalid ball outcome' }, { status: 400 });
  }

  await connectDB();

  try {
    // --- 1. FETCH CURRENT STATE (LIGHTWEIGHT) ---
    const match = await Match.findById(params.id).lean();
    if (!match) throw new Error('Match not found');

    // --- 2. VALIDATION & PRE-COMPUTATION ---
    const isAuthorized =
      match.scorers.some((id: any) => id.toString() === user.userId) ||
      match.admins.some((id: any) => id.toString() === user.userId) ||
      match.createdBy.toString() === user.userId;

    if (!isAuthorized) throw new Error('Not authorized to score this match');
    if (match.status !== 'live') throw new Error('Match is not live');

    const state = match.scoringState;
    if (!state) throw new Error('Match has not been set up for scoring.');

    const battingTeamKey = match.batting_team === match.teamOne.name ? 'teamOne' : 'teamTwo';
    const bowlingTeamKey = match.bowling_team === match.teamOne.name ? 'teamOne' : 'teamTwo';
    const battingTeam = match[battingTeamKey];
    const strikerName = state.currentStriker === 'batsman1' ? state.selectedBatsman1 : state.selectedBatsman2;
    const bowlerName = state.selectedBowler;

    const { runs, isWicket, isExtra, ballCounts, shouldRotateStrike } =
      calculateBallOutcome(outcome, extraRuns);

    const newBall: IBall = {
      ballNumber: battingTeam.total_balls + (ballCounts ? 1 : 0),
      overNumber: Math.floor(battingTeam.total_balls / 6) + 1,
      innings: match.currentInnings,
      batsman: strikerName,
      bowler: bowlerName,
      runs: runs,
      outcome: outcome,
      isExtra: isExtra,
      isWicket: isWicket,
      timestamp: new Date(),
    };

    // --- REFACTORED: build scoringStateClone instead of mixed $set/$push on scoringState ---
    let scoringStateClone = { ...state, currentOver: [...state.currentOver, outcome] };

    // Wicket handling (mutate clone instead of $push/$set nested paths)
    if (isWicket) {
      scoringStateClone.outBatsmen = [...scoringStateClone.outBatsmen, strikerName];
      if (state.currentStriker === 'batsman1') {
        scoringStateClone.selectedBatsman1 = '';
      } else {
        scoringStateClone.selectedBatsman2 = '';
      }
    } else if (shouldRotateStrike) {
      scoringStateClone.currentStriker = state.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1';
    }

    // Over completion logic
    const legalBalls = scoringStateClone.currentOver.filter(b => b !== 'WD' && b !== 'NB').length;
    let inningsOver = false;
    if (legalBalls === 6) {
      scoringStateClone.previousBowler = state.selectedBowler;
      scoringStateClone.selectedBowler = '';
      scoringStateClone.currentOver = [];
      // rotate strike at over end
      scoringStateClone.currentStriker = scoringStateClone.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1';
      if ((battingTeam.total_balls + (ballCounts ? 1 : 0)) >= match.overs * 6) {
        inningsOver = true;
      }
    }

    // All out condition
    if (isWicket && (battingTeam.total_wickets + 1) >= (battingTeam.players.length || 10) - 1) {
      inningsOver = true;
    }

    // Target reached condition
    if (!isWicket && match.currentInnings === 2 && (battingTeam.total_score + runs) >= (match.target || 0)) {
      inningsOver = true;
    }

    // If innings/match ends, apply completion logic and replace scoringStateClone entirely
    if (inningsOver) {
      const tempMatch = JSON.parse(JSON.stringify(match));
      tempMatch[battingTeamKey].total_score += runs;
      tempMatch[battingTeamKey].total_wickets += (isWicket ? 1 : 0);
      handleInningsCompletion(tempMatch as IMatch);
      scoringStateClone = tempMatch.scoringState; // may be null at match end
    }

    // --- Build atomic updateOps (no nested scoringState paths) ---
    const updateOps: any = {
      $push: { ballHistory: newBall },
      $inc: {
        [`${battingTeamKey}.total_score`]: runs,
        [`${battingTeamKey}.total_balls`]: ballCounts ? 1 : 0,
        [`${battingTeamKey}.extras`]: (outcome === 'WD' || outcome === 'B' || outcome === 'LB') ? runs : (outcome === 'NB' ? 1 : 0),
        [`${bowlingTeamKey}.players.$[bowler].balls_bowled`]: ballCounts ? 1 : 0,
        [`${bowlingTeamKey}.players.$[bowler].runs_conceded`]: (outcome === 'NB' || outcome === 'WD') ? runs : (!isExtra ? runs : 0),
        [`${bowlingTeamKey}.players.$[bowler].wickets`]: isWicket ? 1 : 0,
        [`${battingTeamKey}.players.$[striker].balls_played`]: ballCounts ? 1 : 0,
        [`${battingTeamKey}.players.$[striker].runs_scored`]: !isExtra ? runs : (outcome === 'NB' ? extraRuns : 0),
        [`${battingTeamKey}.players.$[striker].fours`]: (!isExtra && runs === 4) || (outcome === 'NB' && extraRuns === 4) ? 1 : 0,
        [`${battingTeamKey}.players.$[striker].sixes`]: (!isExtra && runs === 6) || (outcome === 'NB' && extraRuns === 6) ? 1 : 0,
        ...(isWicket ? { [`${battingTeamKey}.total_wickets`]: 1 } : {}),
      },
      $set: {
        scoringState: scoringStateClone,
        ...(inningsOver
          ? {
              status: scoringStateClone ? match.status : 'completed', // if finalizeMatch set null we already set status inside helper
              target: match.target,
              batting_team: inningsOver ? (match.bowling_team) : match.batting_team, // helper already swapped; but we can't rely on lean changed? optional
              bowling_team: inningsOver ? (match.batting_team) : match.bowling_team,
              currentInnings: inningsOver ? (match.currentInnings === 1 ? 2 : match.currentInnings) : match.currentInnings,
            }
          : {}),
      },
    };

    // Clean up match-level sets for inningsOver using tempMatch (more accurate)
    if (inningsOver) {
      const tempMatch = JSON.parse(JSON.stringify(match));
      tempMatch[battingTeamKey].total_score += runs;
      tempMatch[battingTeamKey].total_wickets += (isWicket ? 1 : 0);
      handleInningsCompletion(tempMatch as IMatch);
      updateOps.$set.status = tempMatch.status;
      updateOps.$set.target = tempMatch.target;
      updateOps.$set.batting_team = tempMatch.batting_team;
      updateOps.$set.bowling_team = tempMatch.bowling_team;
      updateOps.$set.currentInnings = tempMatch.currentInnings;
      updateOps.$set.scoringState = tempMatch.scoringState;
    }

    // Array filters unchanged
    const arrayFilters = [
      { 'bowler.name': bowlerName },
      { 'striker.name': strikerName },
    ];

    // --- Execute atomic update ---
    const updatedMatch = await Match.findOneAndUpdate(
      { _id: params.id, __v: match.__v },
      updateOps,
      {
        new: true,
        arrayFilters,
      }
    );

    if (!updatedMatch) {
      throw new Error('Conflict: Match was updated by another scorer. Please refresh.');
    }

    // --- 7. TRIGGER REAL-TIME EVENT ---
    const allParticipantIds = new Set([
        updatedMatch.createdBy.toString(),
        ...updatedMatch.admins.map((id: any) => id.toString()),
        ...updatedMatch.scorers.map((id: any) => id.toString()),
        ...updatedMatch.viewers.map((id: any) => id.toString()),
    ]);
    const payload = updatedMatch.toObject(); 
    const triggers = Array.from(allParticipantIds).map(userId => {
        const channelName = `private-user-${userId}`;
        const eventName = 'match-updated';
        return pusherServer.trigger(channelName, eventName, payload);
    });
    await Promise.allSettled(triggers);
    
    return NextResponse.json({
      success: true,
      data: updatedMatch,
    });

  } catch (error: any) {
    console.error(`❌ [API] /record-ball Error: ${error.message}`);
    
    if (error.message.startsWith('Conflict:')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to record ball' },
      { status: 500 }
    );
  }
}