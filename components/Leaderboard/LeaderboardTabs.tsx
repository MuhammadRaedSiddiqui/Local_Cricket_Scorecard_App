// components/Leaderboard/LeaderboardTabs.tsx
'use client';

import TeamsLeaderboard from './TeamsLeaderboard';
import BattingLeaderboard from './BattingLeaderboard';
import BowlingLeaderboard from './BowlingLeaderboard';
import { BarChartHorizontalBig, Zap, Trophy, Star, Shield } from 'lucide-react';
import { BattingStats, BowlingStats, TeamStats } from '@/types/leaderboard';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card } from '../ui/card';

interface LeaderboardTabsProps {
  battingStats: BattingStats[];
  bowlingStats: BowlingStats[];
  teamStats: TeamStats[];
  totalMatches: number;
}

export default function LeaderboardTabs({
  battingStats,
  bowlingStats,
  teamStats,
  totalMatches,
}: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'teams'>('batting');

  const tabs = [
    { id: 'batting', label: 'Batting', icon: BarChartHorizontalBig, gradient: 'from-green-500 to-emerald-500' },
    { id: 'bowling', label: 'Bowling', icon: Shield, gradient: 'from-green-500 to-emerald-500' },
    { id: 'teams', label: 'Teams', icon: Trophy, gradient: 'from-green-500 to-emerald-500' },
  ];

  const totalPlayers = Math.max(battingStats.length, bowlingStats.length);

  return (
    <div className="w-full">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        
        {/* Total Matches Card */}
        <Card className="group relative overflow-hidden p-5 md:p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm md:text-base font-medium opacity-90">Total Matches</div>
              <BarChartHorizontalBig className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
            </div>
            <div className="text-3xl md:text-4xl font-bold">{totalMatches}</div>
            <div className="mt-2 text-xs md:text-sm opacity-75">Completed games</div>
          </div>
        </Card>

        {/* Total Players Card */}
        <Card className="group relative overflow-hidden p-5 md:p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm md:text-base font-medium opacity-90">Total Players</div>
              <Zap className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
            </div>
            <div className="text-3xl md:text-4xl font-bold">
              {Math.max(battingStats.length, bowlingStats.length)}
            </div>
            <div className="mt-2 text-xs md:text-sm opacity-75">Active participants</div>
          </div>
        </Card>

        {/* Total Teams Card */}
        <Card className="group relative overflow-hidden p-5 md:p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm md:text-base font-medium opacity-90">Total Teams</div>
              <Trophy className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
            </div>
            <div className="text-3xl md:text-4xl font-bold">{teamStats.length}</div>
            <div className="mt-2 text-xs md:text-sm opacity-75">Competing squads</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl md:p-2 md:mb-8 border border-gray-200 shadow-xl">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'batting' | 'bowling' | 'teams')}
              className={`flex-1 relative md:px-6 py-3 md:py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'batting' && (
          <motion.div
            key="batting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BattingLeaderboard stats={battingStats} />
          </motion.div>
        )}

        {activeTab === 'bowling' && (
          <motion.div
            key="bowling"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BowlingLeaderboard stats={bowlingStats} />
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TeamsLeaderboard stats={teamStats} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}