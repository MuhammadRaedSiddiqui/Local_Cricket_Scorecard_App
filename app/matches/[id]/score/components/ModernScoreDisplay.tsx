import React from 'react';
import { Trophy, Target } from 'lucide-react';

interface Team {
  name: string;
  total_score: number;
  total_wickets: number;
  total_balls: number;
  extras: number;
  players: any[];
}

interface Match {
  target?: number;
  overs: number;
  currentInnings: number;
}

interface ScoreDisplayProps {
  battingTeam: Team | null;
  bowlingTeam: Team | null;
  currentInnings: number;
  match: Match;
}

// Helper function to convert balls to overs
const ballsToOvers = (balls: number): string => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
};

export default function ModernScoreDisplay({
  battingTeam,
  bowlingTeam,
  currentInnings,
  match,
}: ScoreDisplayProps) {
  if (!battingTeam || !bowlingTeam) {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <p>No match data available</p>
          </div>
        </div>
      </div>
    );
  }

  const runsNeeded = match.target ? Math.max(0, match.target - battingTeam.total_score) : 0;
  const ballsRemaining = (match.overs * 6) - battingTeam.total_balls;
  const oversRemaining = ballsToOvers(ballsRemaining);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Match Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Batting Team */}
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Batting
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {battingTeam.name}
              </h2>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
                {battingTeam.total_score}/{battingTeam.total_wickets}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {ballsToOvers(battingTeam.total_balls)} overs
                {battingTeam.extras > 0 && ` • ${battingTeam.extras} extras`}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="text-xl md:text-2xl font-semibold text-gray-400 px-4">vs</div>
            </div>

            {/* Bowling Team */}
            <div className="flex flex-col items-center md:items-end flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Bowling
                </span>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {bowlingTeam.name}
              </h2>
              <div className="text-lg md:text-xl font-semibold text-gray-700 mt-3">
                {currentInnings === 1 ? 'First Innings' : 'Second Innings'}
              </div>
              {currentInnings === 2 && match.target && (
                <div className="text-sm text-gray-500 mt-1">
                  Defending {match.target} runs
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Target Banner (Second Innings Only) */}
        {currentInnings === 2 && match.target && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-white" />
                <div className="text-center md:text-left">
                  <p className="text-white font-bold text-lg">
                    {battingTeam.name} need {runsNeeded} runs to win
                  </p>
                  <p className="text-green-100 text-sm">
                    from {ballsRemaining} balls ({oversRemaining} overs)
                  </p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="text-white text-center">
                  <p className="text-xs opacity-90">Target</p>
                  <p className="text-2xl font-black">{match.target}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First Innings Info Banner */}
        {currentInnings === 1 && (
          <div className="bg-gray-100 px-6 md:px-8 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">First Innings in Progress</span>
              <span className="text-gray-400">•</span>
              <span>{match.overs} overs match</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}