// FILE: components/dashboard/DashboardSkeleton.tsx

import { MatchCardSkeleton } from "./MatchCardSkeleton"

// A simple, reusable skeleton component
const SkeletonBlock = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  )
}

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      {/* Skeleton Navbar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex justify-between items-center">
          <SkeletonBlock className="h-8 w-24" />
          <SkeletonBlock className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Skeleton Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Welcome Banner Skeleton */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <SkeletonBlock className="h-8 w-1/2 mb-3" />
          <SkeletonBlock className="h-5 w-1/3" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SkeletonBlock className="h-24 rounded-lg" />
          <SkeletonBlock className="h-24 rounded-lg" />
          <SkeletonBlock className="h-24 rounded-lg" />
          <SkeletonBlock className="h-24 rounded-lg" />
        </div>

        {/* My Matches Skeleton */}
        <div className="mb-6">
          <SkeletonBlock className="h-7 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        </div>
        
        {/* Invited Matches Skeleton */}
        <div className="mb-6">
          <SkeletonBlock className="h-7 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MatchCardSkeleton />
          </div>
        </div>

      </main>
    </div>
  )
}