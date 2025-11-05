'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import { Match } from '@/types/match'

interface TossSectionProps {
  match: Match
  onTossComplete: (tossWinner: string, tossDecision: 'bat' | 'bowl') => void
}

export const TossSection = ({ match, onTossComplete }: TossSectionProps) => {
  const [tossWinner, setTossWinner] = useState('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | ''>('')

  const handleToss = () => {
    if (!tossWinner || !tossDecision) {
      return
    }
    onTossComplete(tossWinner, tossDecision as 'bat' | 'bowl')
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold">Toss</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Who won the toss?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="toss"
                value={match.teamOne.name}
                onChange={(e) => setTossWinner(e.target.value)}
                className="text-green-600"
              />
              <span className="font-medium">{match.teamOne.name}</span>
            </label>
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="toss"
                value={match.teamTwo.name}
                onChange={(e) => setTossWinner(e.target.value)}
                className="text-green-600"
              />
              <span className="font-medium">{match.teamTwo.name}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Decision?</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="decision"
                value="bat"
                onChange={(e) =>
                  setTossDecision(e.target.value as 'bat' | 'bowl')
                }
                className="text-green-600"
              />
              <span className="font-medium">Bat First</span>
            </label>
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="decision"
                value="bowl"
                onChange={(e) =>
                  setTossDecision(e.target.value as 'bat' | 'bowl')
                }
                className="text-green-600"
              />
              <span className="font-medium">Bowl First</span>
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={handleToss}
        disabled={!tossWinner || !tossDecision}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
      >
        Start Match
      </Button>
    </Card>
  )
}