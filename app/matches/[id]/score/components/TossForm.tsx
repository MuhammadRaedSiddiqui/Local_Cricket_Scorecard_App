'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import { logger } from '@/utils/debugLogger'

interface TossFormProps {
  teamOneName: string
  teamTwoName: string
  onTossComplete: (winner: string, decision: 'bat' | 'bowl') => Promise<void>
}

export function TossForm({
  teamOneName,
  teamTwoName,
  onTossComplete,
}: TossFormProps) {
  const [tossWinner, setTossWinner] = useState('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | ''>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tossWinner || !tossDecision) {
      logger.warning('TOSS_FORM', 'Incomplete toss selection')
      return
    }

    logger.info('TOSS_FORM', 'Submitting toss', { tossWinner, tossDecision })

    setLoading(true)
    try {
      await onTossComplete(tossWinner, tossDecision)
      logger.success('TOSS_FORM', 'Toss completed successfully')
    } catch (error: any) {
      logger.error('TOSS_FORM', 'Failed to complete toss', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold">Toss</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Toss Winner */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Who won the toss?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toss_winner"
                  value={teamOneName}
                  checked={tossWinner === teamOneName}
                  onChange={(e) => setTossWinner(e.target.value)}
                  className="text-green-600"
                  disabled={loading}
                  data-testid={`toss-winner-${teamOneName?.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <span className="font-medium">{teamOneName}</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toss_winner"
                  value={teamTwoName}
                  checked={tossWinner === teamTwoName}
                  onChange={(e) => setTossWinner(e.target.value)}
                  className="text-green-600"
                  disabled={loading}
                  data-testid={`toss-winner-${teamTwoName?.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <span className="font-medium">{teamTwoName}</span>
              </label>
            </div>
          </div>

          {/* Toss Decision */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What did they choose?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toss_decision"
                  value="bat"
                  checked={tossDecision === 'bat'}
                  onChange={() => setTossDecision('bat')}
                  className="text-green-600"
                  disabled={loading}
                  data-testid="toss-decision-bat"
                />
                <span className="font-medium">Bat First</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toss_decision"
                  value="bowl"
                  checked={tossDecision === 'bowl'}
                  onChange={() => setTossDecision('bowl')}
                  className="text-green-600"
                  disabled={loading}
                  data-testid="toss-decision-bowl"
                />
                <span className="font-medium">Bowl First</span>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!tossWinner || !tossDecision || loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
          data-testid="complete-toss-button"
        >
          {loading ? 'Saving...' : 'Complete Toss & Continue'}
        </Button>
      </form>
    </Card>
  )
}