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
    const { match: updatedMatchData } = body;
    
    console.log('📊 Updating match:', params.id);
    
    // Build update object with ALL fields
    const updateData: any = {
      status: updatedMatchData.status,
      toss_winner: updatedMatchData.toss_winner,
      toss_decision: updatedMatchData.toss_decision,
      batting_team: updatedMatchData.batting_team,
      bowling_team: updatedMatchData.bowling_team,
      currentInnings: updatedMatchData.currentInnings || 1,
      target: updatedMatchData.target,
      
      'teamOne.total_score': updatedMatchData.teamOne?.total_score || 0,
      'teamOne.total_wickets': updatedMatchData.teamOne?.total_wickets || 0,
      'teamOne.total_balls': updatedMatchData.teamOne?.total_balls || 0,
      'teamOne.extras': updatedMatchData.teamOne?.extras || 0,
      
      'teamTwo.total_score': updatedMatchData.teamTwo?.total_score || 0,
      'teamTwo.total_wickets': updatedMatchData.teamTwo?.total_wickets || 0,
      'teamTwo.total_balls': updatedMatchData.teamTwo?.total_balls || 0,
      'teamTwo.extras': updatedMatchData.teamTwo?.extras || 0,
      
      updatedAt: new Date()
    };

    // Add players if present
    if (updatedMatchData.teamOne?.players) {
      updateData['teamOne.players'] = updatedMatchData.teamOne.players;
    }
    if (updatedMatchData.teamTwo?.players) {
      updateData['teamTwo.players'] = updatedMatchData.teamTwo.players;
    }

    const match = await Match.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { 
        new: true,
        runValidators: false,
        strict: false
      }
    );

    if (!match) {
      console.error('❌ Match not found:', params.id);
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    console.log('✅ Match updated successfully');
    
    return NextResponse.json({
      success: true,
      data: match
    });

  } catch (error: any) {
    console.error('❌ Update score error:', error);
    return NextResponse.json(
      { error: 'Failed to update score', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const match = await Match.findById(params.id);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: match.status,
        teamOne: {
          name: match.teamOne.name,
          score: match.teamOne.total_score || 0,
          wickets: match.teamOne.total_wickets || 0,
          overs: `${Math.floor((match.teamOne.total_balls || 0) / 6)}.${(match.teamOne.total_balls || 0) % 6}`,
          extras: match.teamOne.extras || 0
        },
        teamTwo: {
          name: match.teamTwo.name,
          score: match.teamTwo.total_score || 0,
          wickets: match.teamTwo.total_wickets || 0,
          overs: `${Math.floor((match.teamTwo.total_balls || 0) / 6)}.${(match.teamTwo.total_balls || 0) % 6}`,
          extras: match.teamTwo.extras || 0
        },
        currentInnings: match.currentInnings,
        target: match.target
      }
    });

  } catch (error) {
    console.error('Get score error:', error);
    return NextResponse.json(
      { error: 'Failed to get score' },
      { status: 500 }
    );
  }
}