'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ExtrasModalProps {
  extraType: 'WD' | 'NB' | 'B' | 'LB'
  onConfirm: (extraRuns: number) => void // ✅ Changed: return only extra runs, not total
  onCancel: () => void
}

export const ExtrasModal = ({ extraType, onConfirm, onCancel }: ExtrasModalProps) => {
  const extraNames = {
    WD: 'Wide Ball',
    NB: 'No Ball',
    B: 'Bye',
    LB: 'Leg Bye',
  }

  const extraDescriptions = {
    WD: '1 run penalty + runs taken by batsmen',
    NB: '1 run penalty + runs taken/hit by batsmen',
    B: 'Runs taken by batsmen (no penalty)',
    LB: 'Runs taken by batsmen (no penalty)',
  }

  const hasPenalty = extraType === 'WD' || extraType === 'NB'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">{extraNames[extraType]}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {extraDescriptions[extraType]}
        </p>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">
            How many runs did the batsmen take?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((runs) => (
              <Button
                key={runs}
                onClick={() => onConfirm(runs)} // ✅ Pass only extra runs
                className="h-14 text-lg font-bold"
                variant="secondary"
              >
                {runs}
              </Button>
            ))}
          </div>
        </div>

        {hasPenalty && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> 1 run penalty will be added automatically
            </p>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </Card>
    </div>
  )
}