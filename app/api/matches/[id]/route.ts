import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Match from '@/models/Match'
import { verifyToken } from '@/lib/auth'

interface Params {
  params: { id: string }
}

// GET single match
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // ✅ Use .lean() to get plain object and include ALL fields
    const match = await Match.findById(params.id).lean()
    console.log("match api:",match)

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    console.log('📥 Fetched match from DB:', {
      id: match._id,
      tossWinner: match.toss_winner,
      battingTeam: match.batting_team,
      scoringState: match.scoringState,
    })

    // ✅ Return the FULL match object
    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error: any) {
    console.error('Get match error:', error)
    
    // Improved error handling (TC020)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid match ID format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get match',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update match (if needed)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    const match = await Match.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: false }
    )

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error: any) {
    console.error('Update match error:', error)
    
    // Improved error handling (TC020)
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid match ID format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update match',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    )
  }
}