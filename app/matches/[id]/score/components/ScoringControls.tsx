'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { ExtrasModal } from './ExtrasModal'

interface ScoringControlsProps {
  onBallRecorded: (outcome: string, extraRuns?: number) => void
  onUndo: () => Promise<void> // ✅ Changed to async
  canUndo: boolean
  disabled?: boolean
}

export const ScoringControls = ({
  onBallRecorded,
  onUndo,
  canUndo,
  disabled,
}: ScoringControlsProps) => {
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [pendingExtra, setPendingExtra] = useState<'WD' | 'NB' | 'B' | 'LB' | null>(null)
  const [isUndoing, setIsUndoing] = useState(false) // ✅ Local undo state

  const handleExtraClick = (extraType: 'WD' | 'NB' | 'B' | 'LB') => {
    setPendingExtra(extraType)
    setShowExtrasModal(true)
  }

  const handleExtraConfirm = (extraRunsTaken: number) => {
    if (!pendingExtra) return

    console.log(`${pendingExtra}: Batsmen took ${extraRunsTaken} runs`)
    onBallRecorded(pendingExtra, extraRunsTaken)

    setShowExtrasModal(false)
    setPendingExtra(null)
  }

  // ✅ Handle undo with loading state
  const handleUndo = async () => {
    setIsUndoing(true)
    try {
      await onUndo()
    } catch (error) {
      console.error('Undo failed:', error)
    } finally {
      setIsUndoing(false)
    }
  }

  // ✅ Combined disabled state
  const isDisabled = disabled || isUndoing

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Record Ball</h3>
          <Button
            onClick={handleUndo}
            disabled={!canUndo || isDisabled}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`h-4 w-4 ${isUndoing ? 'animate-spin' : ''}`} />
            {isUndoing ? 'Undoing...' : 'Undo'}
          </Button>
        </div>

        {/* Runs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['0', '1', '2', '3', '4', '5', '6'].map((run) => (
            <Button
              key={run}
              onClick={() => onBallRecorded(run, 0)}
              disabled={isDisabled}
              variant="secondary"
              className={`
                h-14 text-lg font-bold
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  run === '4'
                    ? '!bg-blue-500 hover:!bg-blue-600 !text-white disabled:!bg-blue-300'
                    : run === '6'
                    ? '!bg-orange-400 hover:!bg-orange-600 !text-white disabled:!bg-orange-300'
                    : ''
                }
              `}
            >
              {run}
            </Button>
          ))}

          {/* Wicket button */}
          <Button
            onClick={() => onBallRecorded('W', 0)}
            disabled={isDisabled}
            variant="destructive"
            className="h-14 text-lg font-bold !bg-red-600 hover:!bg-red-700 !text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-red-300"
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
              disabled={isDisabled}
              variant="secondary"
              className="h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Wide
            </Button>
            <Button
              onClick={() => handleExtraClick('NB')}
              disabled={isDisabled}
              variant="secondary"
              className="h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No Ball
            </Button>
            <Button
              onClick={() => handleExtraClick('B')}
              disabled={isDisabled}
              variant="secondary"
              className="h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bye
            </Button>
            <Button
              onClick={() => handleExtraClick('LB')}
              disabled={isDisabled}
              variant="secondary"
              className="h-12 disabled:opacity-50 disabled:cursor-not-allowed"
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