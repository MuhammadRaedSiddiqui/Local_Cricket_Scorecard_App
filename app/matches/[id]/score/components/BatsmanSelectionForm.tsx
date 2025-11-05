'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/utils/debugLogger'
import { Player } from '@/types/match'

interface BatsmanChangeFormProps {
  availableBatsmen: Player[]
  outBatsman: string
  onBatsmanSelected: (newBatsman: string) => Promise<void>
}

export function BatsmanChangeForm({
  availableBatsmen,
  outBatsman,
  onBatsmanSelected,
}: BatsmanChangeFormProps) {
  const [selectedBatsman, setSelectedBatsman] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (batsmanName: string) => {
    logger.info('BATSMAN_CHANGE', 'Selecting new batsman', { batsmanName })

    setLoading(true)
    try {
      await onBatsmanSelected(batsmanName)
      logger.success('BATSMAN_CHANGE', 'New batsman selected')
    } catch (error: any) {
      logger.error('BATSMAN_CHANGE', 'Failed to select batsman', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 mb-6 border-2 border-red-500">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <h3 className="text-lg font-bold text-red-600">Wicket!</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        <strong>{outBatsman}</strong> is out. Select the next batsman.
      </p>

      {availableBatsmen.length === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
          <p className="text-red-800 font-medium">All Out!</p>
          <p className="text-sm text-red-600 mt-1">No more batsmen available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {availableBatsmen.map((player, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(player.name)}
              disabled={loading}
              className="w-full p-3 border rounded-lg hover:bg-red-50 hover:border-red-500 transition text-left disabled:opacity-50"
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
      )}
    </Card>
  )
}