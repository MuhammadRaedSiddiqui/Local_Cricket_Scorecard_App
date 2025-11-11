'use client'

import { motion } from 'framer-motion';
import { BattingStats } from '@/types/leaderboard'; // Use centralized types
import { BarChartHorizontalBig } from 'lucide-react';

interface BattingLeaderboardProps {
    stats: BattingStats[];
}

export default function BattingLeaderboard({ stats }: BattingLeaderboardProps) {
    if (stats.length === 0)
        return (
            <div className="text-center py-12 text-gray-500">
                <BarChartHorizontalBig className="h-16 w-16 text-gray-400 mx-auto mb-4" />                <p className="text-lg">No batting data available yet</p>
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
                        {stats.map((player, index) => (
                            <motion.tr
                                key={player.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-blue-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 text-center">{index + 1}</td>
                                <td className="px-6 py-4 font-semibold">{player.name}</td>
                                <td className="px-6 py-4 text-center">{player.matches}</td>
                                <td className="px-6 py-4 text-center text-blue-600 font-bold">{player.runs}</td>
                                <td className="px-6 py-4 text-center">{player.average}</td>
                                <td className="px-6 py-4 text-center">{player.strikeRate}</td>
                                <td className="px-6 py-4 text-center">{player.fours}</td>
                                <td className="px-6 py-4 text-center">{player.sixes}</td>
                                <td className="px-6 py-4 text-center">{player.highScore}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* TODO: Add mobile card view here, similar to TeamsLeaderboard.tsx */}
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
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
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
                                <div className="text-xs text-gray-500">Win Rate</div>
                                <div className="font-semibold">{team.winRate}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-500">Avg Score</div>
                                <div className="font-semibold">{team.averageScore}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}