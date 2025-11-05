'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Player } from '@/types/match'

interface BatsmanSelectionProps {
  availableBatsmen: Player[]
  currentStriker: 'batsman1' | 'batsman2'
  whichBatsman: 'batsman1' | 'batsman2' // Which batsman slot is empty
  onSelect: (name: string) => void
  reason: 'wicket' | 'start'
}

export const BatsmanSelection = ({
  availableBatsmen,
  currentStriker,
  whichBatsman,
  onSelect,
  reason,
}: BatsmanSelectionProps) => {
  return (
    <Card className="p-6 mb-6 border-2 border-orange-500">
      <h3 className="text-lg font-bold mb-2">
        {reason === 'wicket' ? '⚠️ Select New Batsman' : 'Select Batsman'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {reason === 'wicket'
          ? 'A wicket has fallen. Select the next batsman.'
          : `Select ${whichBatsman === 'batsman1' ? 'striker' : 'non-striker'}`}
      </p>

      <div className="space-y-2">
        {availableBatsmen.map((player, i) => (
          <button
            key={i}
            onClick={() => onSelect(player.name)}
            className="w-full p-3 border rounded-lg hover:bg-green-50 hover:border-green-500 transition text-left"
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