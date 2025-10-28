'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Eye, UserPlus, Tag } from 'lucide-react'

interface InvitedMatch {
  id: string
  team1: string
  team2: string
  status: 'upcoming' | 'live' | 'completed'
  date: string
  time: string
  venue: string
  invitedBy: string
  matchCode: string
  score?: {
    team1: string
    team2: string
  }
}

const invitedMatches: InvitedMatch[] = [
  {
    id: '1',
    team1: 'Office Champions',
    team2: 'Desk Warriors',
    status: 'live',
    date: 'Today',
    time: '2:00 PM',
    venue: 'Corporate Ground',
    invitedBy: 'Rahul Singh',
    matchCode: 'ABC123',
    score: {
      team1: '89/3 (10.2)',
      team2: 'Yet to bat'
    }
  },
  {
    id: '2',
    team1: 'Neighborhood XI',
    team2: 'Street Legends',
    status: 'upcoming',
    date: 'Sunday',
    time: '9:00 AM',
    venue: 'Colony Park',
    invitedBy: 'Ali Ahmed',
    matchCode: 'XYZ789'
  }
]

export default function InvitedMatches() {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Joined Matches</h2>
          <p className="text-sm text-gray-500">Matches you've joined via invite code</p>
        </div>
        
        <Button variant="secondary" className="sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Join New Match
        </Button>
      </div>

      {invitedMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitedMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-5 hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-gray-100">
                {/* Invite Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Code: {match.matchCode}</span>
                  </div>
                  {match.status === 'live' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>

                {/* Teams */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{match.team1}</h3>
                      {match.score && (
                        <span className="text-sm font-medium text-gray-700">{match.score.team1}</span>
                      )}
                    </div>
                    <div className="text-center text-xs text-gray-400 my-1">vs</div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{match.team2}</h3>
                      {match.score && (
                        <span className="text-sm font-medium text-gray-700">{match.score.team2}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>Invited by {match.invitedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{match.date} • {match.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{match.venue}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button variant="secondary" className="w-full">
                  <Eye className="h-4 w-4 mr-1.5" />
                  View Live Score
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-gray-50/50 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🏏</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No joined matches yet</h3>
          <p className="text-sm text-gray-600 mb-4">Ask your friends for a match code to join their games</p>
          <Button variant="secondary">
            <UserPlus className="h-4 w-4 mr-2" />
            Join a Match
          </Button>
        </Card>
      )}
    </section>
  )
}