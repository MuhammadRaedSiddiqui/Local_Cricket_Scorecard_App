'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- 1. IMPORT YOUR NEW COMPONENTS ---
import TeamsLeaderboard from './TeamsLeaderboard';
import BattingLeaderboard from './BattingLeaderboard';
import BowlingLeaderboard from './BowlingLeaderboard';

// --- 2. IMPORT ICONS ---
import { BarChart, Shield, Trophy } from 'lucide-react';

// --- 3. IMPORT CENTRALIZED TYPES ---
import { BattingStats, BowlingStats, TeamStats } from '@/types/leaderboard';

// --- 4. REMOVE REDEFINED INTERFACES ---
// (The interfaces for BattingStats, BowlingStats, TeamStats are deleted from this file)

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

  return (
    <div className="w-full">
      {/* ===== Summary Cards (Unchanged) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Matches</div>
          <div className="text-3xl font-bold">{totalMatches}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Players</div>
          <div className="text-3xl font-bold">
            {Math.max(battingStats.length, bowlingStats.length)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Teams</div>
          <div className="text-3xl font-bold">{teamStats.length}</div>
        </div>
      </div>

      {/* ===== Tab Headers (Updated with Icons) ===== */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        {[
          { id: 'batting', label: 'Batting', icon: BarChart, color: 'blue' },
          { id: 'bowling', label: 'Bowling', icon: Shield, color: 'green' },
          { id: 'teams', label: 'Teams', icon: Trophy, color: 'purple' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'batting' | 'bowling' | 'teams')}
            className={`relative px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? `text-${tab.color}-600`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600`}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ===== Tab Content (Now uses imported components) ===== */}
      <AnimatePresence mode="wait">
        {activeTab === 'batting' && (
          <motion.div
            key="batting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.2 }}
          >
            <TeamsLeaderboard stats={teamStats} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 5. DELETED BattingLeaderboard and BowlingLeaderboard from this file ---