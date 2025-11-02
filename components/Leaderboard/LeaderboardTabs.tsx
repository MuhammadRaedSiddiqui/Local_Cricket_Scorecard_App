'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface LeaderboardTabsProps {
  battingStats: BattingStats[];
  bowlingStats: BowlingStats[];
  totalMatches: number;
}

export default function LeaderboardTabs({ 
  battingStats, 
  bowlingStats,
  totalMatches 
}: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');

  return (
    <div className="w-full">
      {/* Stats Summary */}
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
          <div className="text-sm opacity-90">Top Scorer</div>
          <div className="text-xl font-bold truncate">
            {battingStats[0]?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Tab Headers */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('batting')}
          className={`relative px-6 py-3 font-semibold transition-all duration-300 ${
            activeTab === 'batting'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            🏏 Batting Leaders
          </span>
          {activeTab === 'batting' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bowling')}
          className={`relative px-6 py-3 font-semibold transition-all duration-300 ${
            activeTab === 'bowling'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            ⚡ Bowling Leaders
          </span>
          {activeTab === 'bowling' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'batting' ? (
          <motion.div
            key="batting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <BattingLeaderboard stats={battingStats} />
          </motion.div>
        ) : (
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
      </AnimatePresence>
    </div>
  );
}

function BattingLeaderboard({ stats }: { stats: BattingStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">🏏</div>
        <p className="text-lg">No batting data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Desktop Table */}
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
            {stats.map((player, index) => (
              <motion.tr
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{player.name}</div>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{player.matches}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-blue-600 text-lg">{player.runs}</span>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{player.average}</td>
                <td className="px-6 py-4 text-center text-gray-700">{player.strikeRate}</td>
                <td className="px-6 py-4 text-center text-gray-700">{player.fours}</td>
                <td className="px-6 py-4 text-center text-gray-700">{player.sixes}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">{player.highScore}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {stats.map((player, index) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                'bg-gray-100 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-bold text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-500">{player.matches} matches</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Runs</div>
                <div className="font-bold text-blue-600">{player.runs}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Avg</div>
                <div className="font-semibold">{player.average}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">SR</div>
                <div className="font-semibold">{player.strikeRate}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">4s/6s</div>
                <div className="font-semibold">{player.fours}/{player.sixes}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">High Score</div>
                <div className="font-semibold">{player.highScore}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BowlingLeaderboard({ stats }: { stats: BowlingStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-lg">No bowling data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Desktop Table */}
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
                <td className="px-6 py-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{player.name}</div>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{player.matches}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-green-600 text-lg">{player.wickets}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">{player.bestBowling}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {stats.map((player, index) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                'bg-gray-100 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-bold text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-500">{player.matches} matches</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Wickets</div>
                <div className="font-bold text-green-600 text-lg">{player.wickets}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Best</div>
                <div className="font-semibold">{player.bestBowling}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}