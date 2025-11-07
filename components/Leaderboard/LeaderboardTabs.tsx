'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamsLeaderboard from './TeamsLeaderboard';

// ==== Types ====
interface BattingStats {
  name: string;
  matches: number;
  innings: number;
  runs: number;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  highScore: number;
}

interface BowlingStats {
  name: string;
  matches: number;
  wickets: number;
  bestBowling: number;
}

interface TeamStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalRuns: number;
  averageScore: number;
  highestScore: number;
  totalWickets: number;
}

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
      {/* ===== Summary Cards ===== */}
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

      {/* ===== Tab Headers ===== */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        {['batting', 'bowling', 'teams'].map((tab) => {
          const colors =
            tab === 'batting'
              ? 'blue'
              : tab === 'bowling'
                ? 'green'
                : 'purple';

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'batting' | 'bowling' | 'teams')}
              className={`relative px-6 py-3 font-semibold transition-all duration-300 ${activeTab === tab
                  ? `text-${colors}-600`
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                {tab === 'batting' && '🏏 Batting Leaders'}
                {tab === 'bowling' && '⚡ Bowling Leaders'}
                {tab === 'teams' && '🏆 Teams'}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${colors}-600`}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ===== Tab Content ===== */}
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

// ===== Batting Leaderboard =====
function BattingLeaderboard({ stats }: { stats: BattingStats[] }) {
  if (stats.length === 0)
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">🏏</div>
        <p className="text-lg">No batting data available yet</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Mat</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Runs</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Avg</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">SR</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">4s</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">6s</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">HS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((playerObj, index) => {
              const p = playerObj.player; // nested data
              return (
                <motion.tr key={p._id || p.name}>
                  <td className="px-6 py-4 text-center">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold">{p.name}</td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-bold">{p.runs_scored}</td>
                  <td className="px-6 py-4 text-center">
                    {p.balls_played ? (p.runs_scored / p.balls_played).toFixed(2) : 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.balls_played ? ((p.runs_scored / p.balls_played) * 100).toFixed(2) : 0}
                  </td>
                  <td className="px-6 py-4 text-center">{p.fours}</td>
                  <td className="px-6 py-4 text-center">{p.sixes}</td>
                  <td className="px-6 py-4 text-center">{p.runs_scored}</td>
                </motion.tr>
              );
            })}

          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Bowling Leaderboard =====
function BowlingLeaderboard({ stats }: { stats: BowlingStats[] }) {
  if (stats.length === 0)
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-lg">No bowling data available yet</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Matches</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Wickets</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Best</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((player, index) => (
              <motion.tr
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-green-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-center">{index + 1}</td>
                <td className="px-6 py-4 font-semibold">{player.name}</td>
                <td className="px-6 py-4 text-center">{player.matches}</td>
                <td className="px-6 py-4 text-center text-green-600 font-bold">{player.wickets}</td>
                <td className="px-6 py-4 text-center">{player.bestBowling}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
