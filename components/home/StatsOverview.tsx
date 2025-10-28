'use client'

import { TrendingUp, TrendingDown, Trophy, Users, Target, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
  {
    label: 'Total Matches',
    value: '124',
    change: '+12%',
    trend: 'up',
    icon: Trophy,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Active Players',
    value: '486',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'Win Rate',
    value: '68%',
    change: '+5%',
    trend: 'up',
    icon: Target,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Avg. Match Time',
    value: '3.2h',
    change: '-10%',
    trend: 'down',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}