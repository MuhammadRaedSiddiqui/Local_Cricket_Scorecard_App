'use client'

import { Card } from '@/components/ui/card'

interface CurrentPlayersProps {
  batsman1: string
  batsman2: string
  bowler: string
  striker: 'batsman1' | 'batsman2'
}

export const CurrentPlayers = ({
  batsman1,
  batsman2,
  bowler,
  striker,
}: CurrentPlayersProps) => {
  return (
    <Card className="p-4 mb-4 bg-gray-50">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">STRIKER</p>
          <p className="font-bold text-green-700">
            {striker === 'batsman1' ? batsman1 : batsman2} *
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">NON-STRIKER</p>
          <p className="font-bold">
            {striker === 'batsman2' ? batsman1 : batsman2}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">BOWLER</p>
          <p className="font-bold text-blue-700">{bowler}</p>
        </div>
      </div>
    </Card>
  )
}