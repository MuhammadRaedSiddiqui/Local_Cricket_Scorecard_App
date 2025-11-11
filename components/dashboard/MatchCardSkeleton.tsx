// FILE: components/dashboard/MatchCardSkeleton.tsx

import { Card } from "@/components/ui/card"

// A simple, reusable skeleton component
const SkeletonBlock = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  )
}

/**
 * This is a high-fidelity skeleton designed to
 * perfectly match the layout of your 'MyMatches' card.
 */
export const MatchCardSkeleton = () => {
  return (
    <Card className="p-5 relative">
      {/* Status Badge */}
      <SkeletonBlock className="h-6 w-24 rounded-full mb-4" />

      {/* Menu Button */}
      <SkeletonBlock className="h-6 w-6 rounded-lg absolute top-3 right-3" />

      {/* Match Code */}
      <SkeletonBlock className="h-4 w-20 mb-4" />

      {/* Teams */}
      <div className="space-y-3 mb-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-5 w-16" />
        </div>
        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-5 w-16" />
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-2 mb-4">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-4 w-36" />
      </div>

      {/* Action Button */}
      <SkeletonBlock className="h-10 w-full rounded-lg" />
    </Card>
  )
}