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

    // Aggregate player statistics and team statistics
    const playerStatsMap = new Map();
    const teamStatsMap = new Map();

    matches.forEach((match: any) => {
      const teams = [match.teamOne, match.teamTwo];
      
      // Determine match winner for team stats
      let winnerTeam = null;
      let loserTeam = null;
      
      if (match.result && match.result.winner) {
        if (match.result.winner === 'team_one') {
          winnerTeam = match.teamOne;
          loserTeam = match.teamTwo;
        } else if (match.result.winner === 'team_two') {
          winnerTeam = match.teamTwo;
          loserTeam = match.teamOne;
        }
      }

      teams.forEach((team, index) => {
        if (!team?.players) return;
        
        // Team Statistics
        const teamName = team.name;
        if (!teamStatsMap.has(teamName)) {
          teamStatsMap.set(teamName, {
            name: teamName,
            matches: new Set(),
            wins: 0,
            losses: 0,
            totalRuns: 0,
            highestScore: 0,
            totalWickets: 0,
            matchScores: []
          });
        }

        const teamStats = teamStatsMap.get(teamName);
        teamStats.matches.add(match._id.toString());
        
        if (winnerTeam && winnerTeam.name === teamName) {
          teamStats.wins += 1;
        } else if (loserTeam && loserTeam.name === teamName) {
          teamStats.losses += 1;
        }
        
        const teamScore = team.total_score || 0;
        teamStats.totalRuns += teamScore;
        teamStats.highestScore = Math.max(teamStats.highestScore, teamScore);
        teamStats.totalWickets += team.total_wickets || 0;
        teamStats.matchScores.push(teamScore);

        // Player Statistics
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

    // Calculate team leaderboard
    const teamStats = Array.from(teamStatsMap.values())
      .map((stats) => {
        const matches = stats.matches.size;
        const winRate = matches > 0 ? Math.round((stats.wins / matches) * 100) : 0;
        const averageScore = stats.matchScores.length > 0 
          ? Math.round(stats.totalRuns / stats.matchScores.length) 
          : 0;

        return {
          name: stats.name,
          matches: matches,
          wins: stats.wins,
          losses: stats.losses,
          winRate: winRate,
          totalRuns: stats.totalRuns,
          averageScore: averageScore,
          highestScore: stats.highestScore,
          totalWickets: stats.totalWickets,
        };
      })
      .sort((a, b) => {
        // Sort by win rate first, then by wins
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      })
      .slice(0, 10);


    return NextResponse.json({
      battingStats,
      bowlingStats,
      teamStats,
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