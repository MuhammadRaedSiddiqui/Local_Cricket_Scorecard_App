import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Match from '@/models/Match'
import { verifyToken } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: Params) {
  const startTime = Date.now()

  try {
    console.log('🔵 [API] POST /api/matches/:id/score started')

    // Auth
    const user = await verifyToken(request)
    if (!user) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    console.log('✅ [API] Database connected')

    // Get existing match
    const existingMatch = await Match.findById(params.id)
    if (!existingMatch) {
      console.log('❌ [API] Match not found')
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Authorization check
    const isAuthorized =
      existingMatch.scorers.some((id: any) => id.toString() === user.userId) ||
      existingMatch.admins.some((id: any) => id.toString() === user.userId) ||
      existingMatch.createdBy.toString() === user.userId

    if (!isAuthorized) {
      console.log('❌ [API] User not authorized to score')
      return NextResponse.json(
        { error: 'Not authorized to score this match' },
        { status: 403 }
      )
    }

    // Parse body
    const body = await request.json()
    console.log('📥 [API] Request body:', JSON.stringify(body, null, 2))

    // Build update object
    const updateData: any = {}

    // Simple field updates
    if (body.toss_winner !== undefined) updateData.toss_winner = body.toss_winner
    if (body.toss_decision !== undefined)
      updateData.toss_decision = body.toss_decision
    if (body.batting_team !== undefined) updateData.batting_team = body.batting_team
    if (body.bowling_team !== undefined)
      updateData.bowling_team = body.bowling_team
    if (body.status !== undefined) updateData.status = body.status
    if (body.scoringState !== undefined)
      updateData.scoringState = body.scoringState

    // Team score updates
    if (body['teamOne.total_score'] !== undefined)
      updateData['teamOne.total_score'] = body['teamOne.total_score']
    if (body['teamOne.total_wickets'] !== undefined)
      updateData['teamOne.total_wickets'] = body['teamOne.total_wickets']
    if (body['teamOne.total_balls'] !== undefined)
      updateData['teamOne.total_balls'] = body['teamOne.total_balls']
    if (body['teamTwo.total_score'] !== undefined)
      updateData['teamTwo.total_score'] = body['teamTwo.total_score']
    if (body['teamTwo.total_wickets'] !== undefined)
      updateData['teamTwo.total_wickets'] = body['teamTwo.total_wickets']
    if (body['teamTwo.total_balls'] !== undefined)
      updateData['teamTwo.total_balls'] = body['teamTwo.total_balls']

    updateData.updatedAt = new Date()

    console.log('📝 [API] Update data:', JSON.stringify(updateData, null, 2))

    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    )

    if (!updatedMatch) {
      console.log('❌ [API] Failed to update match')
      return NextResponse.json(
        { error: 'Failed to update match' },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`✅ [API] Match updated successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: updatedMatch,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [API] Error after ${duration}ms:`, error)
    return NextResponse.json(
      { error: 'Failed to update match', details: error.message },
      { status: 500 }
    )
  }
}