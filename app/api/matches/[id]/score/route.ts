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

    const user = await verifyToken(request)
    if (!user) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    console.log('✅ [API] Database connected')

    const existingMatch = await Match.findById(params.id)
    if (!existingMatch) {
      console.log('❌ [API] Match not found')
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

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

    // CHANGED: normalize body to support { match: {...} } and flat body
    const raw = await request.json()
    const body = raw?.match ?? raw
    console.log('📥 [API] Request body (normalized):', JSON.stringify(body, null, 2))

    const updateData: any = {}
    const before = {
      innings: existingMatch.currentInnings,
      bat: existingMatch.batting_team,
      bowl: existingMatch.bowling_team,
      target: existingMatch.target,
    }

    const isDefined = (v: any) => typeof v !== 'undefined'

    // Simple root fields
    if (isDefined(body.toss_winner)) updateData.toss_winner = body.toss_winner
    if (isDefined(body.toss_decision)) updateData.toss_decision = body.toss_decision
    if (isDefined(body.batting_team)) updateData.batting_team = body.batting_team
    if (isDefined(body.bowling_team)) updateData.bowling_team = body.bowling_team
    if (isDefined(body.status)) updateData.status = body.status
    // NEW: persist target at root
    if (isDefined(body.target)) updateData.target = body.target

    // NEW: normalize and persist currentInnings at root
    const normalizedInnings =
      (isDefined(body.currentInnings) ? body.currentInnings : undefined) ??
      (isDefined(body.scoringState?.currentInnings) ? body.scoringState.currentInnings : undefined) ??
      existingMatch.currentInnings

    updateData.currentInnings = normalizedInnings

    // Team score updates
    if (isDefined(body['teamOne.total_score'])) updateData['teamOne.total_score'] = body['teamOne.total_score']
    if (isDefined(body['teamOne.total_wickets'])) updateData['teamOne.total_wickets'] = body['teamOne.total_wickets']
    if (isDefined(body['teamOne.total_balls'])) updateData['teamOne.total_balls'] = body['teamOne.total_balls']
    if (isDefined(body['teamOne.extras'])) updateData['teamOne.extras'] = body['teamOne.extras']

    if (isDefined(body['teamTwo.total_score'])) updateData['teamTwo.total_score'] = body['teamTwo.total_score']
    if (isDefined(body['teamTwo.total_wickets'])) updateData['teamTwo.total_wickets'] = body['teamTwo.total_wickets']
    if (isDefined(body['teamTwo.total_balls'])) updateData['teamTwo.total_balls'] = body['teamTwo.total_balls']
    if (isDefined(body['teamTwo.extras'])) updateData['teamTwo.extras'] = body['teamTwo.extras']

    // Optional players
    if (isDefined(body.teamOne?.players)) updateData['teamOne.players'] = body.teamOne.players
    if (isDefined(body.teamTwo?.players)) updateData['teamTwo.players'] = body.teamTwo.players

    // CHANGED: scoringState forced to use normalizedInnings
    if (isDefined(body.scoringState)) {
      updateData.scoringState = {
        ...body.scoringState,
        currentInnings: normalizedInnings,
      }
    }

    // Optional ballHistory passthrough
    if (isDefined(body.ballHistory)) {
      updateData.ballHistory = body.ballHistory
    }

    // NEW: defensive auto-swap teams on innings change if client forgot
    const inningsChangedTo2 = before.innings !== 2 && normalizedInnings === 2
    const noTeamsProvided = !isDefined(body.batting_team) && !isDefined(body.bowling_team)
    if (inningsChangedTo2 && noTeamsProvided) {
      updateData.batting_team = before.bowl
      updateData.bowling_team = before.bat
      console.log('🔄 [API] Auto-swapped teams for second innings:', {
        batting_team: updateData.batting_team,
        bowling_team: updateData.bowling_team,
      })
    }

    updateData.updatedAt = new Date()

    console.log('📝 [API] Update data (computed):', JSON.stringify(updateData, null, 2))
    console.log('🧭 [API] Innings before/after:', {
      before,
      after: {
        innings: updateData.currentInnings,
        bat: updateData.batting_team ?? before.bat,
        bowl: updateData.bowling_team ?? before.bowl,
        target: updateData.target ?? before.target,
      },
    })

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
    console.log('✅ [API] Post-update snapshot:', {
      currentInnings: updatedMatch.currentInnings,
      batting_team: updatedMatch.batting_team,
      bowling_team: updatedMatch.bowling_team,
      target: updatedMatch.target,
      scoringState: updatedMatch.scoringState
        ? {
            currentInnings: updatedMatch.scoringState.currentInnings,
            selectedBatsman1: updatedMatch.scoringState.selectedBatsman1,
            selectedBatsman2: updatedMatch.scoringState.selectedBatsman2,
            selectedBowler: updatedMatch.scoringState.selectedBowler,
          }
        : null,
    })

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