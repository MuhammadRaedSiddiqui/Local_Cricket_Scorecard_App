'use client'

import { Button } from '@/components/ui/button'
import { 
  PlusCircle, 
  Trophy, 
  Users, 
  Calendar,
  FileText,
  Share2
} from 'lucide-react'
import { motion } from 'framer-motion'

const actions = [
  {
    icon: PlusCircle,
    label: 'New Match',
    color: 'from-blue-500 to-cyan-500',
    href: '/matches/new',
  },
  {
    icon: Trophy,
    label: 'Live Score',
    color: 'from-green-500 to-emerald-500',
    href: '/matches/live',
  },
  {
    icon: Users,
    label: 'Add Team',
    color: 'from-purple-500 to-pink-500',
    href: '/teams/new',
  },
  {
    icon: Calendar,
    label: 'Schedule',
    color: 'from-orange-500 to-red-500',
    href: '/schedule',
  },
  {
    icon: FileText,
    label: 'Reports',
    color: 'from-indigo-500 to-purple-500',
    href: '/reports',
  },
  {
    icon: Share2,
    label: 'Share',
    color: 'from-teal-500 to-cyan-500',
    href: '/share',
  },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <motion.a
            key={index}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}