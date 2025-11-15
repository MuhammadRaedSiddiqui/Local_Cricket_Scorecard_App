'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { ExtrasModal } from './ExtrasModal'

interface ScoringControlsProps {
  onBallRecorded: (outcome: string, extraRuns?: number) => void
  onUndo: () => void
  canUndo: boolean
  disabled?: boolean
}

export const ScoringControls = ({
  onBallRecorded,
  onUndo,
  canUndo,
}: ScoringControlsProps) => {
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [pendingExtra, setPendingExtra] = useState<'WD' | 'NB' | 'B' | 'LB' | null>(null)

  const handleExtraClick = (extraType: 'WD' | 'NB' | 'B' | 'LB') => {
    setPendingExtra(extraType)
    setShowExtrasModal(true)
  }

  const handleExtraConfirm = (extraRunsTaken: number) => {
    if (!pendingExtra) return
    
    console.log(`${pendingExtra}: Batsmen took ${extraRunsTaken} runs`) // ✅ Debug
    
    // ✅ Pass extra runs directly (penalty is added in calculateBallOutcome)
    onBallRecorded(pendingExtra, extraRunsTaken)
    
    setShowExtrasModal(false)
    setPendingExtra(null)
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Record Ball</h3>
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
        </div>

        {/* Runs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['0', '1', '2', '3', '4', '5', '6'].map((run) => (
            <Button
              key={run}
              onClick={() => onBallRecorded(run, 0)} // ✅ Pass 0 for regular runs
              variant="secondary"
              className={`h-14 text-lg font-bold
                ${
                  run === '4'
                    ? '!bg-blue-500 hover:!bg-blue-600 !text-white'
                    : run === '6'
                    ? '!bg-purple-500 hover:!bg-purple-600 !text-white'
                    : ''
                }`}
            >
              {run}
            </Button>
          ))}
          <Button
            onClick={() => onBallRecorded('W', 0)} // ✅ Pass 0 for wicket
            className="h-14 text-lg !bg-red-500 hover:!bg-red-600 font-bold"
          >
            W
          </Button>
        </div>

        {/* Extras */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Extras</p>
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => handleExtraClick('WD')}
              variant="secondary"
              className="h-12"
            >
              Wide
            </Button>
            <Button
              onClick={() => handleExtraClick('NB')}
              variant="secondary"
              className="h-12"
            >
              No Ball
            </Button>
            <Button
              onClick={() => handleExtraClick('B')}
              variant="secondary"
              className="h-12"
            >
              Bye
            </Button>
            <Button
              onClick={() => handleExtraClick('LB')}
              variant="secondary"
              className="h-12"
            >
              Leg Bye
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Click on extras to specify additional runs taken
        </div>
      </Card>

      {showExtrasModal && pendingExtra && (
        <ExtrasModal
          extraType={pendingExtra}
          onConfirm={handleExtraConfirm}
          onCancel={() => {
            setShowExtrasModal(false)
            setPendingExtra(null)
          }}
        />
      )}
    </>
  )
}