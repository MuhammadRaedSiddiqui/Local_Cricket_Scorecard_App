'use client'

import { motion } from 'framer-motion';
// 1. FIX: Corrected import path from your types file
import { BowlingStats } from '@/types/leaderboard';
import { Zap } from 'lucide-react';

interface BowlingLeaderboardProps {
  stats: BowlingStats[];
}

export default function BowlingLeaderboard({ stats }: BowlingLeaderboardProps) {
  if (stats.length === 0)
    return (
      <div className="text-center py-12 text-gray-500">
        <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />        <p className="text-lg">No bowling data available yet</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Desktop Table (This part was correct) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Mat</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Wkts</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Avg</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Econ</th>

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
                <td className="px-6 py-4 text-center">
                  {player.average !== null ? player.average : 'N/A'}
                </td>
                <td className="px-6 py-4 text-center">{player.economy}</td>

              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 2. FIX: Correct Mobile Card View --- */}
      {/* This now iterates over 'player' and shows correct bowling stats */}
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
              {/* Rank */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                      'bg-gray-100 text-gray-700'
                }`}>
                {index + 1}
              </div>
              {/* Player Info */}
              <div>
                <div className="font-bold text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-500">{player.matches} matches</div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Wickets</div>
                <div className="font-bold text-green-600">{player.wickets}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Average</div>
                <div className="font-semibold">{player.average !== null ? player.average : 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Economy</div>
                <div className="font-semibold">{player.economy}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* --- END OF FIX 2 --- */}

    </div>
  );
}