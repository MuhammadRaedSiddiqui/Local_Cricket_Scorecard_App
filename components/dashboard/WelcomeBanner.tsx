'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'

interface WelcomeBannerProps {
  userName: string;
  totalMatches: number;
  liveMatches: number;
  friendsPlaying: number; // We'll keep this even if it's 0 for now
}

export default function WelcomeBanner({
  userName,
  totalMatches,
  liveMatches,
  friendsPlaying
}: WelcomeBannerProps) {


  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-6 sm:p-8 border border-green-200/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              >
                Welcome back, {userName}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600"
              >
                Manage your matches or join your friends to keep scores live.
              </motion.p>
            </div>

            {/* Cricket illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-6xl sm:text-7xl"
            >
              🏏
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mt-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMatches}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Matches</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center relative">
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{liveMatches}</p>
              <p className="text-xs sm:text-sm text-gray-600">Live Now</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{friendsPlaying}</p>
              <p className="text-xs sm:text-sm text-gray-600">Friends Playing</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}