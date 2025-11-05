'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Users } from 'lucide-react'
import { Team, Match } from '@/types/match'

interface ScoreDisplayProps {
  battingTeam: Team | null
  bowlingTeam: Team | null
  currentInnings: number
  match: Match
}

export const ScoreDisplay = ({
  battingTeam,
  bowlingTeam,
  currentInnings,
  match,
}: ScoreDisplayProps) => {
  if (!battingTeam || !bowlingTeam) return null

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {/* Batting Team Card */}
      <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5" />
          <h3 className="text-sm font-medium opacity-90">BATTING</h3>
        </div>
        <h2 className="text-2xl font-bold mb-2">{battingTeam.name}</h2>
        <div className="text-4xl font-bold mb-2">
          {battingTeam.total_score}/{battingTeam.total_wickets}
        </div>
        <p className="text-sm opacity-90">
          Overs: {Math.floor(battingTeam.total_balls / 6)}.
          {battingTeam.total_balls % 6}
          {battingTeam.extras > 0 && ` • Extras: ${battingTeam.extras}`}
        </p>
        {currentInnings === 2 && match.target && (
          <div className="mt-3 pt-3 border-t border-white/30">
            <p className="text-sm">Target: {match.target}</p>
            <p className="text-lg font-bold">
              Need {Math.max(0, match.target - battingTeam.total_score)} runs
            </p>
          </div>
        )}
      </Card>

      {/* Bowling Team Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5" />
          <h3 className="text-sm font-medium opacity-90">BOWLING</h3>
        </div>
        <h2 className="text-2xl font-bold mb-4">{bowlingTeam.name}</h2>
        {currentInnings === 1 && (
          <p className="text-sm opacity-90">First Innings</p>
        )}
        {currentInnings === 2 && match.target && (
          <div>
            <p className="text-sm opacity-90">Second Innings</p>
            <p className="text-lg font-bold mt-2">
              Defending {match.target} runs
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}