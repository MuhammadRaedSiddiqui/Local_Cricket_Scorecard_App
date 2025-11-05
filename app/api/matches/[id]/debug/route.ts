import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Match from '@/models/Match'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB()

    const match = await Match.findById(params.id).lean()

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Return EVERYTHING for debugging
    return NextResponse.json({
      success: true,
      data: {
        _id: match._id,
        matchCode: match.matchCode,
        status: match.status,
        
        // ✅ Toss data
        toss_winner: match.toss_winner,
        toss_decision: match.toss_decision,
        batting_team: match.batting_team,
        bowling_team: match.bowling_team,
        
        // ✅ Scoring state
        scoringState: match.scoringState,
        
        // ✅ Ball history
        ballHistory: match.ballHistory,
        
        // ✅ Team scores
        teamOne: {
          name: match.teamOne.name,
          total_score: match.teamOne.total_score,
          total_wickets: match.teamOne.total_wickets,
          total_balls: match.teamOne.total_balls,
          extras: match.teamOne.extras,
        },
        teamTwo: {
          name: match.teamTwo.name,
          total_score: match.teamTwo.total_score,
          total_wickets: match.teamTwo.total_wickets,
          total_balls: match.teamTwo.total_balls,
          extras: match.teamTwo.extras,
        },
        
        target: match.target,
        currentInnings: match.currentInnings,
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}