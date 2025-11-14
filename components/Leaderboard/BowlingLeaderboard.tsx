'use client'

import { motion } from 'framer-motion';
import { BowlingStats } from '@/types/leaderboard';
import { Zap, Trophy } from 'lucide-react';
import { useState } from 'react';

interface BowlingLeaderboardProps {
  stats: BowlingStats[];
}

// Rank Badge Component
const RankBadge = ({ rank }: { rank: number }) => {
  const getBadgeStyle = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600';
      case 2:
        return 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500';
      case 3:
        return 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`flex items-center justify-center w-12 h-12 rounded-xl font-black ${rank > 3 ? 'text-gray-700' : 'text-white'
        } ${getBadgeStyle()}`}
    >
      {rank <= 3 && rank === 1 ? <Trophy className="w-5 h-5" /> : rank}
    </motion.div>
  );
};

export default function BowlingLeaderboard({ stats }: BowlingLeaderboardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (stats.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Zap className="w-20 h-20 mb-4 opacity-20" />
        <p className="text-lg font-medium">No bowling statistics available</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="grid grid-cols-6 gap-4 px-6 py-4 text-gray-500 text-xs font-semibold uppercase border-b border-gray-200">
            <div className="col-span-2">Player</div>
            <div className="text-center">Matches</div>
            <div className="text-center">Wickets</div>
            <div className="text-center">Average</div>
            <div className="text-center">Economy</div>
          </div>
          {stats.map((player, index) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative"
            >
              <div
                className={`grid grid-cols-6 gap-4 px-6 py-5 items-center border-b border-gray-200/50 transition-all duration-300 ${hoveredIndex === index ? 'bg-green-50' : ''
                  }`}
              >
                <div className="col-span-2 flex items-center gap-4">
                  <RankBadge rank={index + 1} />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.matches} matches</div>
                  </div>
                </div>
                <div className="text-center text-gray-700">{player.matches}</div>
                <div className="text-center">
                  <div className="text-gray-900 font-bold">{player.wickets}</div>
                </div>
                <div className="text-center text-gray-700 font-semibold">
                  {player.average || 'N/A'}
                </div>
                <div className="text-center">
                  <span className="text-gray-900 font-bold">{player.economy}</span>
                </div>
              </div>
              {hoveredIndex === index && (
                <motion.div
                  layoutId="activeRowBowling"
                  className="absolute inset-0 border-l-4 border-green-500 pointer-events-none"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet View */}
      <div className="lg:hidden space-y-4">
        {stats.map((player, index) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-xl"
          >
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <RankBadge rank={index + 1} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                    <p className="text-sm text-gray-500">{player.matches} matches played</p>
                  </div>
                </div>
                <Zap className="w-6 h-6 text-green-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Wickets</div>
                  <div className="text-2xl font-bold text-gray-900">{player.wickets}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Average</div>
                  <div className="text-xl font-bold text-gray-900">{player.average || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Economy</div>
                  <div className="text-xl font-bold text-gray-900">{player.economy}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}