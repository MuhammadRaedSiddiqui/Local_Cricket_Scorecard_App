'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Team, Player } from '@/types/match'

interface PlayerSelectionProps {
  battingTeam: Team | null
  bowlingTeam: Team | null
  selectedBatsman1: string
  selectedBatsman2: string
  selectedBowler: string
  currentStriker: 'batsman1' | 'batsman2'
  outBatsmen: string[]
  onBatsman1Change: (name: string) => void
  onBatsman2Change: (name: string) => void
  onBowlerChange: (name: string) => void
  onStart: () => void
}

export const PlayerSelection = ({
  battingTeam,
  bowlingTeam,
  selectedBatsman1,
  selectedBatsman2,
  selectedBowler,
  currentStriker,
  outBatsmen,
  onBatsman1Change,
  onBatsman2Change,
  onBowlerChange,
  onStart,
}: PlayerSelectionProps) => {
  if (!battingTeam || !bowlingTeam) return null

  const availableBatsmen = battingTeam.players.filter(
    (p: Player) => !outBatsmen.includes(p.name)
  )

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Select Players</h3>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Striker Batsman {currentStriker === 'batsman1' && '*'}
          </label>
          <select
            value={selectedBatsman1}
            onChange={(e) => onBatsman1Change(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Batsman</option>
            {availableBatsmen.map((player: Player, i: number) => (
              <option key={i} value={player.name}>
                {player.name}{' '}
                {player.is_captain && '(C)'}{' '}
                {player.is_keeper && '(WK)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Non-Striker {currentStriker === 'batsman2' && '*'}
          </label>
          <select
            value={selectedBatsman2}
            onChange={(e) => onBatsman2Change(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Batsman</option>
            {availableBatsmen
              .filter((p: Player) => p.name !== selectedBatsman1)
              .map((player: Player, i: number) => (
                <option key={i} value={player.name}>
                  {player.name}{' '}
                  {player.is_captain && '(C)'}{' '}
                  {player.is_keeper && '(WK)'}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bowler</label>
          <select
            value={selectedBowler}
            onChange={(e) => onBowlerChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Bowler</option>
            {bowlingTeam.players.map((player: Player, i: number) => (
              <option key={i} value={player.name}>
                {player.name}{' '}
                {player.is_captain && '(C)'}{' '}
                {player.is_keeper && '(WK)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={onStart}
        disabled={!selectedBatsman1 || !selectedBatsman2 || !selectedBowler}
        className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:opacity-50"
      >
        Continue Scoring
      </Button>
    </Card>
  )
}