import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all completed matches
    const matches = await Match.find({ status: 'completed' }).lean();

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        battingStats: [],
        bowlingStats: []
      });
    }

    // Aggregate player statistics
    const playerStatsMap = new Map();

    matches.forEach((match: any) => {
      const teams = [match.teamOne, match.teamTwo];

      teams.forEach((team) => {
        if (!team?.players) return;

        team.players.forEach((player: any) => {
          const playerName = player.name;

          if (!playerStatsMap.has(playerName)) {
            playerStatsMap.set(playerName, {
              name: playerName,
              matches: new Set(),
              totalRuns: 0,
              totalBalls: 0,
              timesOut: 0,
              fours: 0,
              sixes: 0,
              wickets: 0,
              highScore: 0,
              ballsBowled: 0,
              runsConceded: 0,
              innings: 0,
            });
          }

          const stats = playerStatsMap.get(playerName);

          // Add match ID to set (for unique match count)
          stats.matches.add(match._id.toString());

          // Batting stats
          if (player.balls_played > 0) {
            stats.innings += 1;
          }
          stats.totalRuns += player.runs_scored || 0;
          stats.totalBalls += player.balls_played || 0;
          stats.timesOut += player.is_out ? 1 : 0;
          stats.fours += player.fours || 0;
          stats.sixes += player.sixes || 0;
          stats.highScore = Math.max(stats.highScore, player.runs_scored || 0);

          // Bowling stats
          stats.wickets += player.wickets || 0;
        });
      });
    });

    // Calculate batting leaderboard

    const battingStats = Array.from(playerStatsMap.values())
      .filter((stats) => stats.totalBalls > 0) // Only players who have batted
      .map((stats) => {
        const average = stats.timesOut > 0
          ? (stats.totalRuns / stats.timesOut).toFixed(2)
          : stats.totalRuns.toFixed(2);

        const strikeRate = stats.totalBalls > 0
          ? ((stats.totalRuns / stats.totalBalls) * 100).toFixed(2)
          : '0.00';

        return {
          name: stats.name,
          matches: stats.matches.size,
          innings: stats.innings,
          runs: stats.totalRuns,
          average: parseFloat(average),
          strikeRate: parseFloat(strikeRate),
          fours: stats.fours,
          sixes: stats.sixes,
          highScore: stats.highScore,
        };
      })
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    // Calculate bowling stats
    const bowlingStats = Array.from(playerStatsMap.values())
      .filter((stats) => stats.wickets > 0 || stats.balls_bowled > 0)
      .map((stats) => {
        const overs = stats.balls_bowled > 0
          ? Math.floor(stats.balls_bowled / 6) + (stats.balls_bowled % 6) / 10
          : 0

        const economy = stats.balls_bowled > 0
          ? ((stats.runs_conceded / stats.balls_bowled) * 6).toFixed(2)
          : '0.00'

        const average = stats.wickets > 0
          ? (stats.runs_conceded / stats.wickets).toFixed(2)
          : '0.00'

        return {
          name: stats.name,
          matches: stats.matches.size,
          wickets: stats.wickets,
          overs: overs.toFixed(1),
          runs_conceded: stats.runs_conceded,
          economy: parseFloat(economy),
          average: parseFloat(average),
          maidens: stats.maidens,
          dot_balls: stats.dot_balls,
          bestBowling: stats.wickets,
        };
      })
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 10);


    return NextResponse.json({
      battingStats,
      bowlingStats,
      totalMatches: matches.length
    });

  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data', message: error.message },
      { status: 500 }
    );
  }
}