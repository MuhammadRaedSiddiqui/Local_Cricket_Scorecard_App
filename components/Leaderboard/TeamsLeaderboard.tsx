'use client';

import { motion } from 'framer-motion';
// 1. RECOMMEND: Import from a central types file if you created one
// import { TeamStats } from '@/types/index'; 

// 2. FIX: Add the 'draws' property to the local interface
interface TeamStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number; // <-- ADD THIS LINE
  winRate: number;
  totalRuns: number;
  averageScore: number;
  highestScore: number;
  totalWickets: number;
}

interface TeamsLeaderboardProps {
  stats: TeamStats[];
}

export default function TeamsLeaderboard({ stats }: TeamsLeaderboardProps) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-lg">No team data available yet</p>
      </div>
    );
  }

  // The rest of your component's JSX is already correct
  // and will now display the 'team.draws' value.

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Team</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Mat</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Wins</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Losses</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Draws</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Win %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((team, index) => (
              <motion.tr
                key={team.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-purple-50 transition-colors duration-150"
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
                  <div className="font-semibold text-gray-900">{team.name}</div>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{team.matches}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-purple-600 text-lg">{team.wins}</span>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{team.losses}</td>
                <td className="px-6 py-4 text-center text-gray-700">{team.draws}</td>
                <td className="px-6 py-4 text-center text-gray-700">{team.winRate}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {stats.map((team, index) => (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-purple-50 transition-colors"
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
                <div className="font-bold text-gray-900">{team.name}</div>
                <div className="text-sm text-gray-500">{team.matches} matches</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500">Wins</div>
                <div className="font-bold text-purple-600">{team.wins}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Losses</div>
                <div className="font-semibold">{team.losses}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Draws</div>
                <div className="font-semibold">{team.draws}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}