import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { sanitizeString } from '@/utils/sanitize';



// GET - Fetch user's matches
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Matches created by user
    const createdMatches = await Match.find({ 
      createdBy: user.userId 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    // Matches where user is invited (admin, scorer, or viewer)
    const invitedMatches = await Match.find({ 
      $and: [
        { createdBy: { $ne: user.userId } },
        {
          $or: [
            { admins: user.userId },
            { scorers: user.userId },
            { viewers: user.userId }
          ]
        }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    // Format matches for easier display
    const formatMatch = (match: any) => {
      // Calculate total balls from players if total_balls doesn't exist
      const calculateBalls = (team: any) => {
        if (team.total_balls !== undefined && team.total_balls !== null) {
          return team.total_balls;
        }
        // Sum up all players' balls_played
        return team.players?.reduce((total: number, player: any) => {
          return total + (player.balls_played || 0);
        }, 0) || 0;
      };

      const teamOneBalls = calculateBalls(match.teamOne);
      const teamTwoBalls = calculateBalls(match.teamTwo);

      return {
        ...match,
        _id: match._id.toString(),
        teamOne: {
          ...match.teamOne,
          total_balls: teamOneBalls,
          overs: `${Math.floor(teamOneBalls / 6)}.${teamOneBalls % 6}`
        },
        teamTwo: {
          ...match.teamTwo,
          total_balls: teamTwoBalls,
          overs: `${Math.floor(teamTwoBalls / 6)}.${teamTwoBalls % 6}`
        }
      };
    };

    return NextResponse.json({
      success: true,
      data: {
        created: createdMatches.map(formatMatch),
        invited: invitedMatches.map(formatMatch)
      }
    });
  } catch (error) {
    console.error('Fetch matches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// POST - Create new match
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const matchData = await request.json();

    // Validation (TC007) - Match creation with proper error messages
    if (!matchData.teamOne || !matchData.teamTwo) {
      return NextResponse.json(
        { error: 'Both teams are required' },
        { status: 400 }
      );
    }

    if (!matchData.teamOne.name || !matchData.teamTwo.name) {
      return NextResponse.json(
        { error: 'Team names are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(matchData.teamOne.players) || !Array.isArray(matchData.teamTwo.players)) {
      return NextResponse.json(
        { error: 'Players must be arrays for both teams' },
        { status: 400 }
      );
    }

    if (matchData.teamOne.players.length === 0 || matchData.teamTwo.players.length === 0) {
      return NextResponse.json(
        { error: 'Each team must have at least one player' },
        { status: 400 }
      );
    }

    if (!matchData.overs || typeof matchData.overs !== 'number' || matchData.overs <= 0) {
      return NextResponse.json(
        { error: 'Valid number of overs is required (must be greater than 0)' },
        { status: 400 }
      );
    }

    if (!matchData.venue || typeof matchData.venue !== 'string' || matchData.venue.trim().length === 0) {
      return NextResponse.json(
        { error: 'Venue is required' },
        { status: 400 }
      );
    }

    if (!matchData.startTime) {
      return NextResponse.json(
        { error: 'Start time is required' },
        { status: 400 }
      );
    }

    // Input sanitization (TC013) - Sanitize team names and venue
    matchData.teamOne.name = sanitizeString(matchData.teamOne.name);
    matchData.teamTwo.name = sanitizeString(matchData.teamTwo.name);
    matchData.venue = sanitizeString(matchData.venue);

    // Sanitize player names
    matchData.teamOne.players = matchData.teamOne.players.map((player: any) => ({
      ...player,
      name: sanitizeString(player.name || '')
    }));
    matchData.teamTwo.players = matchData.teamTwo.players.map((player: any) => ({
      ...player,
      name: sanitizeString(player.name || '')
    }));

    // Create match with generated code
    const match = await Match.create({
      ...matchData,
      createdBy: user.userId,
      admins: [user.userId],
      scorers: [user.userId],
      status: 'upcoming'
    });

    // Update user's created matches
    await User.findByIdAndUpdate(user.userId, {
      $push: { createdMatches: match._id }
    });

    return NextResponse.json({
      success: true,
      data: match
    }, { status: 201 });

  } catch (error) {
    console.error('Create match error:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}