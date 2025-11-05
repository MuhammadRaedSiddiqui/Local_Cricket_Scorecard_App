'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/dashboard/Navbar'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import QuickActions from '@/components/dashboard/QuickActions'
import MyMatches from '@/components/dashboard/MyMatches'
import InvitedMatches from '@/components/dashboard/InvitedMatches'
import Footer from '@/components/dashboard/Footer'
import { Toaster } from 'react-hot-toast'

interface User {
  id: string;
  name: string;
  email: string;
}

interface MatchData {
  _id: string;
  matchCode: string;
  status: string;
  venue: string;
  startTime: string;
  overs: number;
  teamOne: {
    name: string;
    total_score: number;
    total_wickets: number;
    total_balls: number;
    overs: string;
  };
  teamTwo: {
    name: string;
    total_score: number;
    total_wickets: number;
    total_balls: number;
    overs: string;
  };
  isPrivate: boolean;
  createdAt: string;
  target?: number;
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [myMatches, setMyMatches] = useState<MatchData[]>([])
  const [invitedMatches, setInvitedMatches] = useState<MatchData[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          router.push('/login')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load user data:', error)
        localStorage.clear()
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Fetch matches when user is loaded
  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user])

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      
      if (data.success) {
        setMyMatches(data.data.created || [])
        setInvitedMatches(data.data.invited || [])
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setMatchesLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <WelcomeBanner userName={user.name} />
          <QuickActions />
          
          {/* Pass real data and loading state to components */}
          <MyMatches 
            matches={myMatches} 
            loading={matchesLoading}
            onRefresh={fetchMatches}
          />
          <InvitedMatches 
            // matches={invitedMatches} 
            // loading={matchesLoading}
            // onRefresh={fetchMatches}
          />
        </main>

        <Footer />
      </div>
    </>
  )
}