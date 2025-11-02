'use client'

import { motion } from 'framer-motion'
import { Plus, Link2, Trophy, Users } from 'lucide-react'
import { useState } from 'react'
import JoinMatchModal from './JoinMatchModel'
import { useRouter } from 'next/navigation'

const actions = [
  {
    icon: Plus,
    title: 'Create New Match',
    description: 'Start a new game',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    action: 'create'
  },
  {
    icon: Link2,
    title: 'Join via Code',
    description: 'Enter match code',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    action: 'join'
  },
  {
    icon: Trophy,
    title: 'View Leaderboard',
    description: 'Check rankings',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-50 to-orange-50',
    action: 'leaderboard'
  },
  {
    icon: Users,
    title: 'Invite Friends',
    description: 'Share the app',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    action: 'invite'
  }
]

export default function QuickActions() {
  const router = useRouter()
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  const handleAction = (action: string) => {
    switch(action) {
      case 'create':
        // Navigate to create match
        router.push('/matches/create')
        break
      case 'join':
        setIsJoinModalOpen(true)
        break
      case 'leaderboard':
        // Navigate to leaderboard
        router.push('/leaderboard')
        break
      case 'invite':
        // Open share modal
        console.log('Invite friends')
        break
    }
  }

  return (
    <>
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(action.action)}
              className="group relative bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{action.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <JoinMatchModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </>
  )
}