'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Award, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const teamStats = {
  name: 'Mumbai Warriors',
  position: '2nd',
  played: 15,
  won: 10,
  lost: 4,
  tied: 1,
  winRate: 67,
  recentForm: ['W', 'W', 'L', 'W', 'W'],
  topScorer: {
    name: 'Virat Singh',
    runs: 342,
  },
  topWickets: {
    name: 'Amit Sharma',
    wickets: 18,
  },
}

export default function TeamPerformance() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Team</h2>
        <span className="text-2xl">🏆</span>
      </div>

      <div className="space-y-4">
        {/* Team Name & Position */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{teamStats.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              Currently {teamStats.position} in League
            </span>
          </div>
        </div>

        {/* Win Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Win Rate</span>
            <span className="text-sm font-semibold text-gray-900">{teamStats.winRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${teamStats.winRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Match Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{teamStats.won}</p>
            <p className="text-xs text-gray-600">Won</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{teamStats.lost}</p>
            <p className="text-xs text-gray-600">Lost</p>
          </div>
        </div>

        {/* Recent Form */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Recent Form</p>
          <div className="flex gap-1">
            {teamStats.recentForm.map((result, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  result === 'W'
                    ? 'bg-green-100 text-green-600'
                    : result === 'L'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Top Scorer</p>
              <p className="font-medium text-gray-900">{teamStats.topScorer.name}</p>
            </div>
            <p className="text-lg font-bold text-primary-600">{teamStats.topScorer.runs}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Top Bowler</p>
              <p className="font-medium text-gray-900">{teamStats.topWickets.name}</p>
            </div>
            <p className="text-lg font-bold text-primary-600">{teamStats.topWickets.wickets}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}