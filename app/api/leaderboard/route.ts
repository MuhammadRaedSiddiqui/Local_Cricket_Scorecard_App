


import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // === 1. Batting Stats Aggregation ===
    const battingStats = await Match.aggregate([
      // Stage 1: Filter for completed matches only
      { $match: { status: 'completed' } },

      // Stage 2: Deconstruct the team arrays to access players
      { $unwind: '$teamOne.players' },
      { $unwind: '$teamTwo.players' },

      // Stage 3: Combine all players into a single stream
      {
        $project: {
          _id: 0,
          player: {
            $mergeObjects: ['$teamOne.players', '$teamTwo.players'],
          },
        },
      },
      // This is a common pattern, but a bit complex. A simpler way:
      // We can improve this, but let's stick to a readable version first.
      // Let's refine Stage 2 & 3 to be more efficient.

      // --- A More Efficient Aggregation ---
      // We'll restart the pipeline for clarity.
    ]);

    // === A BETTER PIPELINE ===
    
    // We need to process players from both teams.
    // Let's combine them first.
    
    const allPlayers = await Match.aggregate([
      // 1. Get only completed matches
      { $match: { status: 'completed' } },
      
      // 2. Combine players from both teams into one array per match
      {
        $project: {
          allPlayers: {
            $concatArrays: ['$teamOne.players', '$teamTwo.players'],
          },
        },
      },
      
      // 3. Deconstruct that new combined array
      { $unwind: '$allPlayers' },
      
      // 4. Replace the root with just the player document
      { $replaceRoot: { newRoot: '$allPlayers' } },
      
      // 5. Group by player name to aggregate stats
      {
        $group: {
          _id: '$name', // Group by player name
          matches: { $sum: 1 }, // Count matches played
          totalRuns: { $sum: '$runs_scored' },
          totalBalls: { $sum: '$balls_played' },
          fours: { $sum: '$fours' },
          sixes: { $sum: '$sixes' },
          highScore: { $max: '$runs_scored' },
          timesOut: {
            $sum: { $cond: [{ $eq: ['$is_out', true] }, 1, 0] },
          },
          innings: {
             $sum: { $cond: [{ $gt: ['$balls_played', 0] }, 1, 0] },
          },
        },
      },
      
      // 6. Project to calculate final stats (Average, Strike Rate)
      {
        $project: {
          _id: 0, // Exclude the default _id
          name: '$_id', // Rename _id to name
          matches: 1,
          innings: 1,
          runs: '$totalRuns',
          fours: 1,
          sixes: 1,
          highScore: 1,
          average: {
            $cond: [
              { $eq: ['$timesOut', 0] },
              '$totalRuns', // Avoid division by zero
              { $divide: ['$totalRuns', '$timesOut'] },
            ],
          },
          strikeRate: {
            $cond: [
              { $eq: ['$totalBalls', 0] },
              0, // Avoid division by zero
              {
                $multiply: [
                  { $divide: ['$totalRuns', '$totalBalls'] },
                  100,
                ],
              },
            ],
          },
        },
      },
      
      // 7. Sort by top runs
      { $sort: { runs: -1 } },
      
      // 8. Limit to top 10
      { $limit: 10 },
      
      // 9. Round the calculated fields
      {
         $project: {
            name: 1,
            matches: 1,
            innings: 1,
            runs: 1,
            fours: 1,
            sixes: 1,
            highScore: 1,
            average: { $round: ['$average', 2] },
            strikeRate: { $round: ['$strikeRate', 2] },
         }
      }
    ]);

    // === 2. Bowling Stats Aggregation ===
    const bowlingStats = await Match.aggregate([
      // 1. Get only completed matches
      { $match: { status: 'completed' } },
      
      // 2. Combine players from both teams
      {
        $project: {
          allPlayers: {
            $concatArrays: ['$teamOne.players', '$teamTwo.players'],
          },
        },
      },
      
      // 3. Deconstruct the array
      { $unwind: '$allPlayers' },
      
      // 4. Replace root with player
      { $replaceRoot: { newRoot: '$allPlayers' } },

      // 5. Filter for players who have actually bowled
      { $match: { 'balls_bowled': { $gt: 0 } } },
      
      // 6. Group by player name
      {
        $group: {
          _id: '$name',
          matches: { $sum: 1 },
          wickets: { $sum: '$wickets' },
          runsConceded: { $sum: '$runs_conceded' },
          ballsBowled: { $sum: '$balls_bowled' },
          maidens: { $sum: '$maidens' },
          dot_balls: { $sum: '$dot_balls' },
          // Note: "bestBowling" is complex and may require a separate query or simplification
        },
      },
      
      // 7. Project to calculate final stats (Economy, Average)
      {
        $project: {
          _id: 0,
          name: '$_id',
          matches: 1,
          wickets: 1,
          runs_conceded: '$runsConceded',
          maidens: 1,
          dot_balls: 1,
          overs: {
             $concat: [
                { $toString: { $floor: { $divide: ['$ballsBowled', 6] } } },
                '.',
                { $toString: { $mod: ['$ballsBowled', 6] } }
             ]
          },
          economy: {
            $cond: [
              { $eq: ['$ballsBowled', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$runsConceded', '$ballsBowled'] },
                  6,
                ],
              },
            ],
          },
          average: {
            $cond: [
              { $eq: ['$wickets', 0] },
              0,
              { $divide: ['$runsConceded', '$wickets'] },
            ],
          },
          bestBowling: '$wickets', // Simplified: using total wickets as a proxy.
        },
      },
      
      // 8. Sort by most wickets
      { $sort: { wickets: -1 } },
      
      // 9. Limit to top 10
      { $limit: 10 },

      // 10. Round the calculated fields
      {
         $project: {
            name: 1,
            matches: 1,
            wickets: 1,
            runs_conceded: 1,
            maidens: 1,
            dot_balls: 1,
            overs: 1,
            economy: { $round: ['$economy', 2] },
            average: { $round: ['$average', 2] },
            bestBowling: 1
         }
      }
    ]);
    
    // === 3. Team Stats Aggregation ===
    // (This one is more complex as each team appears once per match)
    // We'll create a stream of 'team performances' first
    
    const teamStats = await Match.aggregate([
        // 1. Get completed matches
        { $match: { status: 'completed' } },
        
        // 2. Project both teams into a single array
        {
            $project: {
                teams: [
                    {
                        name: '$teamOne.name',
                        score: '$teamOne.total_score',
                        wickets: '$teamOne.total_wickets',
                        // Determine winner
                        isWinner: {
                            $cond: [
                                { $gt: ['$teamOne.total_score', '$teamTwo.total_score'] }, 1, 0
                            ]
                        }
                    },
                    {
                        name: '$teamTwo.name',
                        score: '$teamTwo.total_score',
                        wickets: '$teamTwo.total_wickets',
                        isWinner: {
                            $cond: [
                                { $gt: ['$teamTwo.total_score', '$teamOne.total_score'] }, 1, 0
                            ]
                        }
                    }
                ]
            }
        },
        
        // 3. Unwind the teams array
        { $unwind: '$teams' },
        
        // 4. Group by team name
        {
            $group: {
                _id: '$teams.name',
                matches: { $sum: 1 },
                wins: { $sum: '$teams.isWinner' },
                totalRuns: { $sum: '$teams.score' },
                totalWickets: { $sum: '$teams.wickets' },
                highestScore: { $max: '$teams.score' },
            }
        },

        // 5. Project final calculated values
        {
            $project: {
                _id: 0,
                name: '$_id',
                matches: 1,
                wins: 1,
                losses: { $subtract: ['$matches', '$wins'] }, // Simple loss calc
                winRate: {
                    $cond: [
                         { $eq: ['$matches', 0] },
                         0,
                         { $multiply: [{ $divide: ['$wins', '$matches'] }, 100] }
                    ]
                },
                totalRuns: 1,
                totalWickets: 1,
                highestScore: 1,
                averageScore: {
                    $cond: [
                         { $eq: ['$matches', 0] },
                         0,
                         { $divide: ['$totalRuns', '$matches'] }
                    ]
                }
            }
        },
        
        // 6. Sort by wins, then win rate
        { $sort: { wins: -1, winRate: -1 } },
        
        // 7. Limit to top 10
        { $limit: 10 },
        
        // 8. Round calculated fields
        {
            $project: {
                name: 1,
                matches: 1,
                wins: 1,
                losses: 1,
                totalRuns: 1,
                totalWickets: 1,
                highestScore: 1,
                winRate: { $round: ['$winRate', 0] },
                averageScore: { $round: ['$averageScore', 0] }
            }
        }
    ]);

    // Count total matches separately (more efficient)
    const totalMatches = await Match.countDocuments({ status: 'completed' });

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