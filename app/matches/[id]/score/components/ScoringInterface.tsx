'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/debugLogger'

interface ScoringInterfaceProps {
  striker: string
  nonStriker: string
  bowler: string
  currentOver: string[]
  currentStriker: 'batsman1' | 'batsman2' // ✅ Added
  onBallRecorded: (outcome: string) => Promise<void>
}

export function ScoringInterface({
  striker,
  nonStriker,
  bowler,
  currentOver,
  currentStriker, // ✅ Added
  onBallRecorded,
}: ScoringInterfaceProps) {
  const [recording, setRecording] = useState(false)

  const handleBall = async (outcome: string) => {
    logger.info('SCORING', `Recording ball: ${outcome}`)

    setRecording(true)
    try {
      await onBallRecorded(outcome)
      logger.success('SCORING', `Ball recorded: ${outcome}`)
    } catch (error: any) {
      logger.error('SCORING', `Failed to record ball: ${outcome}`, error)
    } finally {
      setRecording(false)
    }
  }

  const getBallColor = (ball: string) => {
    if (ball === 'W') return 'bg-red-500'
    if (ball === '4') return 'bg-blue-500'
    if (ball === '6') return 'bg-purple-500'
    if (ball === 'WD' || ball === 'NB') return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  // ✅ Determine who's on strike
  const onStrike = currentStriker === 'batsman1' ? striker : nonStriker
  const offStrike = currentStriker === 'batsman1' ? nonStriker : striker

  return (
    <div className="space-y-4">
      {/* Current Players */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">ON STRIKE</p>
            <p className="font-bold text-green-700 text-lg">{onStrike} *</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">NON-STRIKER</p>
            <p className="font-bold text-gray-700">{offStrike}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">BOWLER</p>
            <p className="font-bold text-blue-700">{bowler}</p>
          </div>
        </div>
      </Card>

      {/* Current Over */}
      {currentOver.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">This Over:</p>
          <div className="flex gap-2 flex-wrap">
            {currentOver.map((ball, i) => (
              <span
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getBallColor(
                  ball
                )}`}
              >
                {ball}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Scoring Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Record Ball</h3>

        {/* Runs (TC019 - Accessibility) */}
        <div className="grid grid-cols-4 gap-2 mb-4" role="group" aria-label="Record ball outcome">
          {['0', '1', '2', '3', '4', '5', '6'].map((run) => (
            <Button
              key={run}
              onClick={() => handleBall(run)}
              disabled={recording}
              variant="secondary"
              className={`h-14 text-lg font-bold ${
                run === '4'
                  ? '!bg-blue-500 hover:!bg-blue-600 !text-white'
                  : run === '6'
                  ? '!bg-purple-500 hover:!bg-purple-600 !text-white'
                  : ''
              }`}
              aria-label={`Record ${run} run${run === '1' ? '' : 's'}`}
              aria-required="false"
            >
              {run}
            </Button>
          ))}
          <Button
            onClick={() => handleBall('W')}
            disabled={recording}
            className="h-14 text-lg font-bold !bg-red-500 hover:!bg-red-600"
            aria-label="Record wicket"
            aria-required="false"
          >
            W
          </Button>
        </div>

        {/* Extras */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Extras (Simplified)</p>
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => handleBall('WD')}
              disabled={recording}
              variant="outline"
              className="h-12"
            >
              Wide (+1)
            </Button>
            <Button
              onClick={() => handleBall('NB')}
              disabled={recording}
              variant="outline"
              className="h-12"
            >
              No Ball (+1)
            </Button>
            <Button
              onClick={() => handleBall('B')}
              disabled={recording}
              variant="outline"
              className="h-12"
            >
              Bye (+1)
            </Button>
            <Button
              onClick={() => handleBall('LB')}
              disabled={recording}
              variant="outline"
              className="h-12"
            >
              Leg Bye (+1)
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            All extras add 1 run only (simplified)
          </p>
        </div>
      </Card>
    </div>
  )
}