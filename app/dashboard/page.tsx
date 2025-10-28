import Navbar from '@/components/dashboard/Navbar'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import MyMatches from '@/components/dashboard/MyMatches'
import InvitedMatches from '@/components/dashboard/InvitedMatches'
import QuickActions from '@/components/dashboard/QuickActions'
import Footer from '@/components/dashboard/Footer'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <WelcomeBanner />
        <QuickActions />
        <MyMatches />
        <InvitedMatches />
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}