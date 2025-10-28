'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, TrendingUp, Circle, Eye, Edit } from 'lucide-react'
import { motion } from 'framer-motion'

interface Match {
  id: string
  team1: {
    name: string
    score: string
    overs: string
    logo: string
  }
  team2: {
    name: string
    score: string
    overs: string
    logo: string
  }
  status: string
  venue: string
  viewers: number
  isAdmin: boolean
}

const liveMatches: Match[] = [
  {
    id: '1',
    team1: {
      name: 'Mumbai Warriors',
      score: '156/4',
      overs: '18.3',
      logo: '🏏',
    },
    team2: {
      name: 'Delhi Dynamos',
      score: '112/6',
      overs: '15.0',
      logo: '🦅',
    },
    status: 'Mumbai Warriors need 45 runs in 9 balls',
    venue: 'Wankhede Stadium',
    viewers: 1234,
    isAdmin: true,
  },
  {
    id: '2',
    team1: {
      name: 'Chennai Chargers',
      score: '198/7',
      overs: '20.0',
      logo: '⚡',
    },
    team2: {
      name: 'Kolkata Knights',
      score: '145/3',
      overs: '16.2',
      logo: '🛡️',
    },
    status: 'Kolkata Knights need 54 runs in 22 balls',
    venue: 'Eden Gardens',
    viewers: 892,
    isAdmin: false,
  },
  {
    id: '3',
    team1: {
      name: 'Bangalore Bulls',
      score: '78/2',
      overs: '8.4',
      logo: '🐂',
    },
    team2: {
      name: 'Punjab Panthers',
      score: 'Yet to bat',
      overs: '-',
      logo: '🐆',
    },
    status: 'Bangalore Bulls batting',
    venue: 'Chinnaswamy Stadium',
    viewers: 567,
    isAdmin: true,
  },
]

export default function LiveMatches() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Circle className="h-3 w-3 text-red-500 fill-current animate-pulse" />
            <Circle className="h-3 w-3 text-red-500 fill-current absolute top-0 animate-ping" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Live Matches</h2>
          <span className="text-sm text-gray-500">({liveMatches.length})</span>
        </div>
        <Button variant="ghost" size="sm">View All</Button>
      </div>

      <div className="space-y-4">
        {liveMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Match Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{match.venue}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>{match.viewers}</span>
                </div>
                {match.isAdmin ? (
                  <Button size="sm" variant="ghost" className="h-8">
                    <Edit className="h-3 w-3 mr-1" />
                    Score
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="h-8">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-3">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{match.team1.logo}</span>
                  <div>
                    <p className="font-medium text-gray-900">{match.team1.name}</p>
                    <p className="text-xs text-gray-500">Overs: {match.team1.overs}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{match.team1.score}</p>
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{match.team2.logo}</span>
                  <div>
                    <p className="font-medium text-gray-900">{match.team2.name}</p>
                    <p className="text-xs text-gray-500">
                      {match.team2.overs !== '-' ? `Overs: ${match.team2.overs}` : 'Yet to bat'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{match.team2.score}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-primary-600" />
                <p className="text-sm text-gray-700">{match.status}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}