// FILE: app/leaderboard/page.tsx

import { Suspense } from 'react'; 
import LeaderboardTabs from '@/components/Leaderboard/LeaderboardTabs'; 
import { Metadata } from 'next'; 

export const metadata: Metadata = { 
  title: 'Leaderboard - Local Cricket Scorecard', 
  description: 'View top cricket players batting and bowling statistics', 
}; 

async function getLeaderboardData() { 
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; 
  try { 
    const res = await fetch(`${baseUrl}/api/leaderboard`, { 
      // ✅ OPTIMIZATION:
      // Replaced 'no-store' with time-based revalidation.
      // Next.js will cache the result for 60 seconds, drastically
      // reducing database load and speeding up page loads.
      next: { revalidate: 60 }, 
    }); 
    if (!res.ok) { 
      throw new Error('Failed to fetch leaderboard data'); 
    } 

    return res.json(); 
  } catch (error) { 
    console.error('Error fetching leaderboard:', error); 
    return { 
      battingStats: [], 
      bowlingStats: [], 
      teamStats: [], 
      totalMatches: 0, 
    }; 
  } 
}

function LoadingSkeleton() { 
  return ( 
    <div className="animate-pulse"> 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> 
        {[1, 2, 3].map((i) => ( 
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div> 
        ))}
      </div>
      <div className="bg-gray-200 rounded-xl h-96"></div> 
    </div>
  ); 
} 

export default async function LeaderboardPage() { 
  const data = await getLeaderboardData(); 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"> 
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4"> 
        <div className="max-w-6xl mx-auto"> 
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3"> 
            🏆 Players Leaderboard 
          </h1>
          <p className="text-blue-100 text-lg"> 
            Top 10 Cricket Players Performance Statistics 
          </p> 
        </div> 
      </div> 

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 -mt-6"> 
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8"> 
          <Suspense fallback={<LoadingSkeleton />}> 
            <LeaderboardTabs 
              battingStats={data.battingStats} 
              bowlingStats={data.bowlingStats} 
              teamStats={data.teamStats} 
              totalMatches={data.totalMatches} 
            /> 
          </Suspense> 
        </div> 

        {/* Footer Info */}
        <div className="mt-8 text-center"> 
          <p className="text-gray-600 text-sm"> 
            📊 Stats updated every 60 seconds • 🔝 Top 10 players displayed 
          </p> 
        </div> 
      </div> 
    </div>
  ); 
} 