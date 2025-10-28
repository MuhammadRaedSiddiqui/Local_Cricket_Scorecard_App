'use client'

import { Card } from '@/components/ui/card'
import { 
  Trophy, 
  UserPlus, 
  Calendar, 
  Edit, 
  Share2,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

const activities = [
  {
    id: '1',
    type: 'match_completed',
    title: 'Match Completed',
    description: 'Mumbai Warriors vs Delhi Dynamos',
    time: '2 hours ago',
    icon: Trophy,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    id: '2',
    type: 'player_added',
    title: 'New Player Added',
    description: 'Rahul Sharma joined Mumbai Warriors',
    time: '5 hours ago',
    icon: UserPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: '3',
    type: 'match_scheduled',
    title: 'Match Scheduled',
    description: 'Upcoming match on Dec 28',
    time: '1 day ago',
    icon: Calendar,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: '4',
    type: 'score_updated',
    title: 'Score Updated',
    description: 'Live match score updated',
    time: '2 days ago',
    icon: Edit,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: '5',
    type: 'match_shared',
    title: 'Match Shared',
    description: 'Match link shared with 45 people',
    time: '3 days ago',
    icon: Share2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

export default function RecentActivity() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Clock className="h-4 w-4 text-gray-400" />
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            <div className={`p-2 rounded-lg ${activity.bg} flex-shrink-0`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-600 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        View all activity →
      </button>
    </Card>
  )
}