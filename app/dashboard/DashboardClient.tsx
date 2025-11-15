// FILE: app/dashboard/DashboardClient.tsx (NEW CLIENT COMPONENT)
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/dashboard/Navbar'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import QuickActions from '@/components/dashboard/QuickActions'
import MyMatches from '@/components/dashboard/MyMatches'
import InvitedMatches from '@/components/dashboard/InvitedMatches'
import Footer from '@/components/dashboard/Footer'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { pusherClient } from '@/lib/pusher-client'
import { DashboardData, MatchData } from './types'; // Import types

interface DashboardClientProps {
  initialData: DashboardData;
}

// All the client-side logic (state, Pusher) lives here.
export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter()
  
  // The state is *initialized* with server-fetched data.
  // No more loading skeletons!
  const [data, setData] = useState<DashboardData>(initialData);
  
  // This state is for *subsequent* refreshes, not initial load.
  const [matchesLoading, setMatchesLoading] = useState(false);
  
  const { user, myMatches, invitedMatches, totalMatches, liveMatches } = data;

  // This function is still useful for the "Refresh" button
  const fetchMatches = useCallback(async () => {
    if (!user) return;
    try {
      setMatchesLoading(true);
      const token = localStorage.getItem('auth_token'); // Still need this for client-side fetch
      const response = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const responseData = await response.json();
      if (responseData.success) {
        setData(prevData => ({
          ...prevData,
          myMatches: responseData.data.myMatches || [],
          invitedMatches: responseData.data.invitedMatches || [],
          totalMatches: responseData.data.totalMatches,
          liveMatches: responseData.data.liveMatches,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setMatchesLoading(false);
    }
  }, [user]);

  // The Pusher logic remains identical.
  const updateMatchInState = useCallback((updatedMatchData: any) => {
    // ... (This function is exactly the same as your original file) ...
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;
    const channelName = `private-user-${user.id}`;
    let channel: any;
    try {
      channel = pusherClient.subscribe(channelName);
      // ... (all your channel.bind logic is identical) ...
      channel.bind('match-updated', (data: any) => {
        console.log('[Pusher] Received match-updated event:', data);
        toast('Match scores updated!', { icon: '🏏', duration: 2000 });
        updateMatchInState(data); // This is correct
      });
    } catch (e) {
      console.error('Failed to subscribe to Pusher:', e);
    }
    return () => {
      if (channel) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [user, updateMatchInState]);

  const handleLogout = async () => {
    // ... (This logic is identical) ...
  };

  // No more `loading` or `!user` checks for the initial render.
  // The page loads instantly with data.

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <WelcomeBanner 
            userName={user?.name || 'Player'} // Handle null user
            totalMatches={totalMatches}
            liveMatches={liveMatches}
            friendsPlaying={0}
          />
          <QuickActions />
          <MyMatches
            matches={myMatches}
            loading={matchesLoading}
            onRefresh={fetchMatches}
          />
          <InvitedMatches
            matches={invitedMatches}
            loading={matchesLoading}
            onRefresh={fetchMatches}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}