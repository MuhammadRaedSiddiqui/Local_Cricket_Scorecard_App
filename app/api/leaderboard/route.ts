import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const aggregationResult = await Match.aggregate([
      // 1. Filter for completed matches once
      { $match: { status: 'completed' } },

      // 2. Use $facet to run parallel aggregations
      {
        $facet: {
          
          // --- Pipeline A: Team Stats (Unchanged, this is perfect) ---
          teamStats: [
            {
              $project: {
                teams: [
                  { 
                    name: '$teamOne.name', score: '$teamOne.total_score', wickets: '$teamOne.total_wickets',
                    isWinner: { $cond: [{ $gt: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] },
                    isLoser: { $cond: [{ $lt: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] },
                    isDraw: { $cond: [{ $eq: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0] }
                  },
                  { 
                    name: '$teamTwo.name', score: '$teamTwo.total_score', wickets: '$teamTwo.total_wickets',
                    isWinner: { $cond: [{ $gt: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] },
                    isLoser: { $cond: [{ $lt: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] },
                    isDraw: { $cond: [{ $eq: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0] }
                  }
                ]
              }
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
              }
            },
            {
              $project: {
                _id: 0, name: '$_id', matches: 1, wins: 1, losses: 1, draws: 1,
                winRate: { $cond: [{ $eq: ['$matches', 0] }, 0, { $multiply: [{ $divide: ['$wins', '$matches'] }, 100] }] },
                totalRuns: 1, totalWickets: 1, highestScore: 1,
                averageScore: { $cond: [{ $eq: ['$matches', 0] }, 0, { $divide: ['$totalRuns', '$matches'] }] }
              }
            },
            { $sort: { wins: -1, winRate: -1 } },
            { $limit: 10 },
            {
              $project: {
                name: 1, matches: 1, wins: 1, losses: 1, draws: 1,
                totalRuns: 1, totalWickets: 1, highestScore: 1,
                winRate: { $round: ['$winRate', 0] },
                averageScore: { $round: ['$averageScore', 0] }
              }
            }
          ],

          // --- OPTIMIZATION: Replaced 'playerStats' with two focused pipelines ---

          // --- Pipeline B: Batting Stats ---
          battingStats: [
            { $project: { players: { $concatArrays: ['$teamOne.players', '$teamTwo.players'] } } },
            { $unwind: '$players' },
            { $replaceRoot: { newRoot: '$players' } },
            { $match: { balls_played: { $gt: 0 } } }, // Only players who batted
            {
              $group: {
                _id: '$name',
                matches: { $sum: 1 },
                runs: { $sum: '$runs_scored' },
                totalBalls: { $sum: '$balls_played' },
                fours: { $sum: '$fours' },
                sixes: { $sum: '$sixes' },
                highScore: { $max: '$runs_scored' },
                timesOut: { $sum: { $cond: [{ $eq: ['$is_out', true] }, 1, 0] } },
                innings: { $sum: { $cond: [{ $gt: ['$balls_played', 0] }, 1, 0] } },
              }
            },
            { $sort: { runs: -1 } }, // Sort by runs
            { $limit: 10 }, // Get top 10
            {
              $project: {
                _id: 0, name: '$_id', matches: 1, innings: 1,
                runs: 1, fours: 1, sixes: 1, highScore: 1,
                average: { $round: [{ $cond: [{ $eq: ['$timesOut', 0] }, '$runs', { $divide: ['$runs', '$timesOut'] }] }, 2] },
                strikeRate: { $round: [{ $cond: [{ $eq: ['$totalBalls', 0] }, 0, { $multiply: [{ $divide: ['$runs', '$totalBalls'] }, 100] }] }, 2] },
              }
            }
          ],

          // --- Pipeline C: Bowling Stats ---
          bowlingStats: [
            { $project: { players: { $concatArrays: ['$teamOne.players', '$teamTwo.players'] } } },
            { $unwind: '$players' },
            { $replaceRoot: { newRoot: '$players' } },
            { $match: { balls_bowled: { $gt: 0 } } }, // Only players who bowled
            {
              $group: {
                _id: '$name',
                matches: { $sum: 1 },
                wickets: { $sum: '$wickets' },
                runsConceded: { $sum: '$runs_conceded' },
                ballsBowled: { $sum: '$balls_bowled' },
                maidens: { $sum: '$maidens' },
              }
            },
            { $sort: { wickets: -1 } }, // Sort by wickets
            { $limit: 10 }, // Get top 10
            {
              $project: {
                _id: 0, name: '$_id', matches: 1, wickets: 1,
                runs_conceded: '$runsConceded', maidens: 1,
                overs: { $concat: [{ $toString: { $floor: { $divide: ['$ballsBowled', 6] } } }, '.', { $toString: { $mod: ['$ballsBowled', 6] } }] },
                economy: { $round: [{ $cond: [{ $eq: ['$ballsBowled', 0] }, 0, { $multiply: [{ $divide: ['$runsConceded', '$ballsBowled'] }, 6] }] }, 2] },
                average: { $round: [{ $cond: [{ $eq: ['$wickets', 0] }, null, { $divide: ['$runsConceded', '$wickets'] }] }, 2] },
              }
            }
          ],
          
          // --- Pipeline D: Total Match Count (Unchanged) ---
          totalMatches: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    // --- 3. Format the Results (Now much simpler) ---
    const results = aggregationResult[0];

    // The data is already sorted, limited, and formatted by the database.
    const battingStats = results.battingStats || [];
    const bowlingStats = results.bowlingStats || [];
    const teamStats = results.teamStats || [];
    const totalMatches = results.totalMatches[0]?.count || 0;

    return NextResponse.json({
      battingStats,
      bowlingStats,
      teamStats,
      totalMatches,
    });
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data', message: error.message },
      { status: 500 }
    );
  }
}