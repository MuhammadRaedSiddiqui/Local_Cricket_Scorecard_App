'use client'

import { Card } from '@/components/ui/card'

interface CurrentOverProps {
  balls: string[]
}

const getBallClass = (ball: string) => {
  if (ball === 'W') return 'bg-red-500'
  if (ball === '4') return 'bg-blue-500'
  if (ball === '6') return 'bg-orange-500'
  if (ball === 'WD' || ball === 'NB') return 'bg-yellow-500'
  return 'bg-gray-400'
}

export const CurrentOver = ({ balls }: CurrentOverProps) => {
  if (balls.length === 0) return null

  return (
    <Card className="p-4 mb-6">
      <p className="text-sm font-medium mb-2">This Over:</p>
      <div className="flex gap-2 flex-wrap">
        {balls.map((ball, i) => (
          <span
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getBallClass(
              ball
            )}`}
          >
            {ball}
          </span>
        ))}
      </div>
    </Card>
  )
}