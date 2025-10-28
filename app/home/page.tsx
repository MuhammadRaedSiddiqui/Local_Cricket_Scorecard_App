import Header from '@/components/home/Header'
import QuickActions from '@/components/home/QuickActions'
import LiveMatches from '@/components/home/LiveMatches'
import StatsOverview from '@/components/home/StatsOverview'
import RecentActivity from '@/components/home/RecentActivity'
import UpcomingMatches from '@/components/home/UpcomingMatches'
import TeamPerformance from '@/components/home/TeamPerformance'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, Rajesh! 👋
          </h1>
          <p className="text-primary-100">
            You have 3 live matches and 2 upcoming games today
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Matches (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMatches />
            <UpcomingMatches />
          </div>

          {/* Right Column - Activity & Performance */}
          <div className="space-y-6">
            <TeamPerformance />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}