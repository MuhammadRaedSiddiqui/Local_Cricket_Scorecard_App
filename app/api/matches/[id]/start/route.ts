import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';

interface Params {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validation (TC008) - Toss and player selection required
    if (!body.tossWonBy || !body.electedTo) {
      return NextResponse.json(
        { error: 'Toss decision is required. Please select toss winner and choice.' },
        { status: 400 }
      );
    }

    if (!body.openingBatsmen || !Array.isArray(body.openingBatsmen) || body.openingBatsmen.length !== 2) {
      return NextResponse.json(
        { error: 'Two opening batsmen must be selected' },
        { status: 400 }
      );
    }

    if (!body.openingBowler) {
      return NextResponse.json(
        { error: 'Opening bowler must be selected' },
        { status: 400 }
      );
    }

    const match = await Match.findById(params.id);

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if match is already started or completed
    if (match.status === 'live' || match.status === 'completed') {
      return NextResponse.json(
        { error: `Match is already ${match.status}` },
        { status: 400 }
      );
    }

    // Check if user is admin (TC012)
    const isAdmin = match.createdBy.toString() === user.userId ||
      match.admins.some((adminId: any) => adminId.toString() === user.userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only match admin can start the match' },
        { status: 403 }
      );
    }

    // Validate players exist in teams
    const battingTeamName = body.electedTo === 'bat' ? body.tossWonBy :
      (body.tossWonBy === match.teamOne.name ? match.teamTwo.name : match.teamOne.name);
    const bowlingTeamName = body.electedTo === 'bowl' ? body.tossWonBy :
      (body.tossWonBy === match.teamOne.name ? match.teamTwo.name : match.teamOne.name);

    const battingTeam = battingTeamName === match.teamOne.name ? match.teamOne : match.teamTwo;
    const bowlingTeam = bowlingTeamName === match.teamOne.name ? match.teamOne : match.teamTwo;

    // Validate opening batsmen
    const batsmenValid = body.openingBatsmen.every((name: string) =>
      battingTeam.players.some((p: any) => p.name === name)
    );

    if (!batsmenValid) {
      return NextResponse.json(
        { error: 'Opening batsmen must be from the batting team' },
        { status: 400 }
      );
    }

    // Validate opening bowler
    const bowlerValid = bowlingTeam.players.some((p: any) => p.name === body.openingBowler);
    if (!bowlerValid) {
      return NextResponse.json(
        { error: 'Opening bowler must be from the bowling team' },
        { status: 400 }
      );
    }

    // Update match with toss and player selection (TC008)
    match.status = 'live';
    match.toss_winner = body.tossWonBy;
    match.toss_decision = body.electedTo;
    match.batting_team = battingTeamName;
    match.bowling_team = bowlingTeamName;

    // Initialize scoring state (TC008)
    match.scoringState = {
      selectedBatsman1: body.openingBatsmen[0],
      selectedBatsman2: body.openingBatsmen[1],
      selectedBowler: body.openingBowler,
      previousBowler: '', // No previous bowler for first over
      currentStriker: 'batsman1',
      currentOver: [],
      outBatsmen: [],
      currentInnings: 1,
      extraRuns: 0,
    };

    await match.save();

    return NextResponse.json({
      success: true,
      data: match
    });

  } catch (error: any) {
    console.error('Start match error:', error);
    
    // Improved error handling (TC020)
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to start match',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  }
}