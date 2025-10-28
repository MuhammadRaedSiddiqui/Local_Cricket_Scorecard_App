'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Eye, Edit2, Play, CheckCircle, Clock, Filter } from 'lucide-react'

interface Match {
  id: string
  team1: string
  team2: string
  status: 'upcoming' | 'live' | 'completed'
  date: string
  time: string
  venue: string
  score?: {
    team1: string
    team2: string
  }
  myRole: 'admin' | 'scorer'
}

const myMatches: Match[] = [
  {
    id: '1',
    team1: 'Weekend Warriors',
    team2: 'Sunday Strikers',
    status: 'live',
    date: 'Today',
    time: '3:00 PM',
    venue: 'Local Park Ground',
    score: {
      team1: '156/4 (18.3)',
      team2: '98/2 (12.0)'
    },
    myRole: 'admin'
  },
  {
    id: '2',
    team1: 'Thunder Bolts',
    team2: 'Lightning Fast',
    status: 'upcoming',
    date: 'Tomorrow',
    time: '10:00 AM',
    venue: 'Community Cricket Field',
    myRole: 'scorer'
  },
  {
    id: '3',
    team1: 'Morning Mavericks',
    team2: 'Evening Eagles',
    status: 'completed',
    date: 'Yesterday',
    time: '4:00 PM',
    venue: 'School Ground',
    score: {
      team1: '178/7 (20.0)',
      team2: '165/9 (20.0)'
    },
    myRole: 'admin'
  }
]

export default function MyMatches() {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all')
  
  const filteredMatches = filter === 'all' 
    ? myMatches 
    : myMatches.filter(match => match.status === filter)

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'live':
        return <Play className="h-4 w-4" />
      case 'upcoming':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'live':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Matches</h2>
          <p className="text-sm text-gray-500">Matches you've created or manage</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          {(['all', 'live', 'upcoming', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === status 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-5 hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-gray-100">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(match.status)}`}>
                  {getStatusIcon(match.status)}
                  <span className="capitalize">{match.status}</span>
                  {match.status === 'live' && (
                    <span className="ml-1 relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {match.myRole === 'admin' ? '👑 Admin' : '📝 Scorer'}
                </span>
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
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{match.date} • {match.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{match.venue}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {match.status === 'live' ? (
                  <Button className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                    <Edit2 className="h-4 w-4 mr-1.5" />
                    Continue Scoring
                  </Button>
                ) : match.status === 'upcoming' ? (
                  <>
                    <Button variant="secondary" className="flex-1">
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      Start
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" className="flex-1">
                    <Eye className="h-4 w-4 mr-1.5" />
                    View Details
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}