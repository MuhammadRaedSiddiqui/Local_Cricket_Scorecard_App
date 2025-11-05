'use client'

import { Card } from '@/components/ui/card'
import { Player } from '@/types/match'

interface BowlerSelectionProps {
  bowlers: Player[]
  previousBowler: string // ✅ NEW: Last over's bowler
  onSelect: (name: string) => void
  reason: 'over' | 'start'
}

export const BowlerSelection = ({
  bowlers,
  previousBowler,
  onSelect,
  reason,
}: BowlerSelectionProps) => {
  // ✅ Filter out previous bowler if this is after an over
  const availableBowlers = reason === 'over' 
    ? bowlers.filter(p => p.name !== previousBowler)
    : bowlers

  return (
    <Card className="p-6 mb-6 border-2 border-blue-500">
      <h3 className="text-lg font-bold mb-2">
        {reason === 'over' ? '🎯 Select New Bowler' : 'Select Bowler'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {reason === 'over'
          ? 'Over completed! Select the bowler for the next over.'
          : 'Select the opening bowler'}
      </p>

      {/* ✅ Show warning if previous bowler exists */}
      {reason === 'over' && previousBowler && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Note:</strong> {previousBowler} cannot bowl consecutive overs
          </p>
        </div>
      )}

      {availableBowlers.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
          <p className="text-red-800 font-medium">
            No other bowlers available!
          </p>
          <p className="text-xs text-red-600 mt-1">
            You need at least 2 players in the bowling team.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {availableBowlers.map((player, i) => (
          <button
            key={i}
            onClick={() => onSelect(player.name)}
            className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition text-left"
          >
            <span className="font-medium">{player.name}</span>
            {player.is_captain && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                C
              </span>
            )}
            {player.is_keeper && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                WK
              </span>
            )}
          </button>
        ))}
      </div>
    </Card>
  )
}