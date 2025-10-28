'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const upcomingMatches = [
  {
    id: '1',
    team1: 'Riverside Rangers',
    team2: 'Valley Vikings',
    date: 'Today',
    time: '3:00 PM',
    venue: 'Central Ground',
    type: 'League Match',
  },
  {
    id: '2',
    team1: 'City Crushers',
    team2: 'Beach Blazers',
    date: 'Tomorrow',
    time: '10:00 AM',
    venue: 'Sports Complex',
    type: 'Friendly',
  },
  {
    id: '3',
    team1: 'North Stars',
    team2: 'South Strikers',
    date: 'Dec 28',
    time: '2:00 PM',
    venue: 'Stadium A',
    type: 'Tournament',
  },
]

export default function UpcomingMatches() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Matches</h2>
        <Button variant="ghost" size="sm">
          Schedule
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {upcomingMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {match.type}
                </span>
                <span className="text-xs text-gray-500">{match.date}</span>
              </div>
              <p className="font-medium text-gray-900">
                {match.team1} vs {match.team2}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{match.venue}</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="secondary">
              Set Reminder
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}