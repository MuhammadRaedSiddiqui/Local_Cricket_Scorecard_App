'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { logger } from '@/utils/debugLogger'
import { Player } from '@/types/match'

interface PlayerSelectionFormProps {
  battingTeamName: string
  bowlingTeamName: string
  battingPlayers: Player[]
  bowlingPlayers: Player[]
  onPlayersSelected: (
    batsman1: string,
    batsman2: string,
    bowler: string
  ) => Promise<void>
}

export function PlayerSelectionForm({
  battingTeamName,
  bowlingTeamName,
  battingPlayers,
  bowlingPlayers,
  onPlayersSelected,
}: PlayerSelectionFormProps) {
  const [batsman1, setBatsman1] = useState('')
  const [batsman2, setBatsman2] = useState('')
  const [bowler, setBowler] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!batsman1 || !batsman2 || !bowler) {
      logger.warning('PLAYER_FORM', 'Incomplete player selection')
      return
    }

    if (batsman1 === batsman2) {
      logger.warning('PLAYER_FORM', 'Same batsman selected twice')
      return
    }

    logger.info('PLAYER_FORM', 'Submitting players', {
      batsman1,
      batsman2,
      bowler,
    })

    setLoading(true)
    try {
      await onPlayersSelected(batsman1, batsman2, bowler)
      logger.success('PLAYER_FORM', 'Players saved successfully')
    } catch (error: any) {
      logger.error('PLAYER_FORM', 'Failed to save players', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">Select Opening Players</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Batting:</strong> {battingTeamName} •{' '}
          <strong>Bowling:</strong> {bowlingTeamName}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Batsman 1 (Striker) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Opening Batsman 1 (Striker) *
            </label>
            <select
              id="striker-select"
              name="striker-select"
              value={batsman1}
              onChange={(e) => {
                const value = e.target.value
                setBatsman1(value)
                e.target.dispatchEvent(new Event('input', { bubbles: true }))
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={loading}
              required
              data-testid="striker-select"
              aria-label="Opening Batsman 1 (Striker)"
            >
              <option value="__none__">Select Batsman</option>
              {battingPlayers.map((player, i) => (
                <option key={i} value={player.name}>
                  {player.name}
                  {player.is_captain && ' (C)'}
                  {player.is_keeper && ' (WK)'}
                </option>
              ))}
            </select>

          </div>

          {/* Batsman 2 (Non-Striker) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Opening Batsman 2 (Non-Striker)
            </label>
            <select
              value={batsman2}
              onChange={(e) => setBatsman2(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={loading}
              required
              data-testid="non-striker-select"
              aria-label="Select opening batsman 2 (non-striker)"
            >
              <option value="">Select Batsman</option>
              {battingPlayers
                .filter((p) => p.name !== batsman1)
                .map((player, i) => (
                  <option key={i} value={player.name}>
                    {player.name}
                    {player.is_captain && ' (C)'}
                    {player.is_keeper && ' (WK)'}
                  </option>
                ))}
            </select>
          </div>

          {/* Bowler */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Opening Bowler
            </label>
            <select
              value={bowler}
              onChange={(e) => setBowler(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
              data-testid="bowler-select"
              aria-label="Select opening bowler"
            >
              <option value="">Select Bowler</option>
              {bowlingPlayers.map((player, i) => (
                <option key={i} value={player.name}>
                  {player.name}
                  {player.is_captain && ' (C)'}
                  {player.is_keeper && ' (WK)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {batsman1 === batsman2 && batsman1 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-800">
              ⚠️ Please select different batsmen
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={
            !batsman1 || !batsman2 || !bowler || batsman1 === batsman2 || loading
          }
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
          data-testid="start-scoring-button"
        >
          {loading ? 'Saving...' : 'Start Scoring'}
        </Button>
      </form>
    </Card>
  )
}