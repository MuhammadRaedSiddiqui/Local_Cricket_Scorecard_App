// app/api/leaderboard/route.ts - OPTIMIZED
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Match from '@/models/Match'

export const revalidate = 3600 // ✅ Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const [result] = await Match.aggregate([
      { $match: { status: 'completed' } },
      {
        $facet: {
          teamStats: [
            {
              $project: {
                teams: [
                  {
                    name: '$teamOne.name',
                    score: '$teamOne.total_score',
                    wickets: '$teamOne.total_wickets',
                    isWinner: { $cond: [{ $gt: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] },
                    isLoser: { $cond: [{ $lt: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] },
                    isDraw: { $cond: [{ $eq: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] },
                  },
                  {
                    name: '$teamTwo.name',
                    score: '$teamTwo.total_score',
                    wickets: '$teamTwo.total_wickets',
                    isWinner: { $cond: [{ $gt: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] },
                    isLoser: { $cond: [{ $lt: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] },
                    isDraw: { $cond: [{ $eq: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] },
                  },
                ],
              },
            },
            { $unwind: '$teams' },
            {
              $group: {
                _id: '$teams.name',
                matches: { $sum: 1 },
                wins: { $sum: '$teams.isWinner' },
                losses: { $sum: '$teams.isLoser' },
                draws: { $sum: '$teams.isDraw' },
                totalRuns: { $sum: '$teams.score' },
                totalWickets: { $sum: '$teams.wickets' },
                highestScore: { $max: '$teams.score' },
              },
            },
            {
              $project: {
                _id: 0,
                name: '$_id',
                matches: 1,
                wins: 1,
                losses: 1,
                draws: 1,
                winRate: {
                  $round: [
                    { $cond: [{ $eq: ['$matches', 0] }, 0, { $multiply: [{ $divide: ['$wins', '$matches'] }, 100] }] },
                    0,
                  ],
                },
                totalRuns: 1,
                totalWickets: 1,
                highestScore: 1,
                averageScore: {
                  $round: [{ $cond: [{ $eq: ['$matches', 0] }, 0, { $divide: ['$totalRuns', '$matches'] }] }, 0],
                },
              },
            },
            { $sort: { wins: -1, winRate: -1 } },
            { $limit: 10 },
          ],

          // Batting stats
          battingStats: [
            { $project: { players: { $concatArrays: ['$teamOne.players', '$teamTwo.players'] } } },
            { $unwind: '$players' },
            { $match: { 'players.balls_played': { $gt: 0 } } },
            {
              $group: {
                _id: '$players.name',
                matches: { $sum: 1 },
                runs: { $sum: '$players.runs_scored' },
                totalBalls: { $sum: '$players.balls_played' },
                fours: { $sum: '$players.fours' },
                sixes: { $sum: '$players.sixes' },
                highScore: { $max: '$players.runs_scored' },
                timesOut: { $sum: { $cond: ['$players.is_out', 1, 0] } },
                innings: { $sum: { $cond: [{ $gt: ['$players.balls_played', 0] }, 1, 0] } },
              },
            },
            { $sort: { runs: -1 } },
            { $limit: 10 },
            {
              $project: {
                _id: 0,
                name: '$_id',
                matches: 1,
                innings: 1,
                runs: 1,
                fours: 1,
                sixes: 1,
                highScore: 1,
                average: {
                  $round: [{ $cond: [{ $eq: ['$timesOut', 0] }, '$runs', { $divide: ['$runs', '$timesOut'] }] }, 2],
                },
                strikeRate: {
                  $round: [{ $cond: [{ $eq: ['$totalBalls', 0] }, 0, { $multiply: [{ $divide: ['$runs', '$totalBalls'] }, 100] }] }, 2],
                },
              },
            },
          ],

          // Bowling stats
          bowlingStats: [
            { $project: { players: { $concatArrays: ['$teamOne.players', '$teamTwo.players'] } } },
            { $unwind: '$players' },
            { $match: { 'players.balls_bowled': { $gt: 0 } } },
            {
              $group: {
                _id: '$players.name',
                matches: { $sum: 1 },
                wickets: { $sum: '$players.wickets' },
                runsConceded: { $sum: '$players.runs_conceded' },
                ballsBowled: { $sum: '$players.balls_bowled' },
                maidens: { $sum: '$players.maidens' },
              },
            },
            { $sort: { wickets: -1 } },
            { $limit: 10 },
            {
              $project: {
                _id: 0,
                name: '$_id',
                matches: 1,
                wickets: 1,
                runs_conceded: '$runsConceded',
                maidens: 1,
                overs: {
                  $concat: [
                    { $toString: { $floor: { $divide: ['$ballsBowled', 6] } } },
                    '.',
                    { $toString: { $mod: ['$ballsBowled', 6] } },
                  ],
                },
                economy: {
                  $round: [{ $cond: [{ $eq: ['$ballsBowled', 0] }, 0, { $multiply: [{ $divide: ['$runsConceded', '$ballsBowled'] }, 6] }] }, 2],
                },
                average: {
                  $round: [{ $cond: [{ $eq: ['$wickets', 0] }, null, { $divide: ['$runsConceded', '$wickets'] }] }, 2],
                },
              },
            },
          ],

          totalMatches: [{ $count: 'count' }],
        },
      },
    ]);

   
    return NextResponse.json({
      battingStats: result.battingStats || [],
      bowlingStats: result.bowlingStats || [],
      teamStats: result.teamStats || [],
      totalMatches: result.totalMatches[0]?.count || 0,
    })
  } catch (error: any) {
    console.error('Leaderboard API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard data', message: error.message }, { status: 500 })
  }
}