'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, TrendingUp } from 'lucide-react'

interface Player {
  name: string
  runs_scored?: number
  balls_played?: number
  fours?: number
  sixes?: number
  wickets?: number
  balls_bowled?: number
  dots?: number
  runs_conceded?: number
  maidens?: number
  is_captain?: boolean
  is_keeper?: boolean
  is_out?: boolean
  dismissal?: string
  strike_rate?: number
  economy?: number
}

interface Team {
  name: string
  players: Player[]
  total_score?: number
  total_wickets?: number
  total_balls?: number
  extras?: number
}

interface ScoreCardProps {
  match?: {
    _id?: string
    matchCode?: string
    status?: string
    venue?: string
    overs?: number
    startTime?: string
    teamOne?: Team
    teamTwo?: Team
    currentInnings?: number
    batting_team?: string
    bowling_team?: string
    target?: number
    toss_winner?: string
    toss_decision?: string
  }
  isLive?: boolean
  viewersCount?: number
}

export default function ScoreCard({ match, isLive = false, viewersCount = 2300 }: ScoreCardProps) {
  const [activeTeam, setActiveTeam] = useState<'teamOne' | 'teamTwo'>('teamOne')
  

  // Default static data for preview/demo
  const defaultTeams = {
    teamOne: {
      name: 'Riverside Rangers',
      displayName: 'Riverside Rangers',
      batting: [
        { name: 'S. Kumar', runs: 45, balls: 32, fours: 5, sixes: 2, strikeRate: 140.6, status: 'not out', current: true },
        { name: 'R. Patel', runs: 28, balls: 19, fours: 3, sixes: 1, strikeRate: 147.4, status: 'not out', current: true },
        { name: 'A. Singh', runs: 67, balls: 45, fours: 8, sixes: 3, strikeRate: 148.9, status: 'c Johnson b Williams' },
        { name: 'V. Sharma', runs: 42, balls: 28, fours: 4, sixes: 2, strikeRate: 150.0, status: 'b Anderson' },
        { name: 'K. Reddy', runs: 35, balls: 21, fours: 3, sixes: 2, strikeRate: 166.7, status: 'run out' },
        { name: 'M. Khan', runs: 18, balls: 12, fours: 2, sixes: 0, strikeRate: 150.0, status: 'c Smith b Johnson' },
        { name: 'P. Das', runs: 8, balls: 6, fours: 1, sixes: 0, strikeRate: 133.3, status: 'lbw b Williams' },
      ],
      yetToBat: ['D. Gupta', 'S. Ahmed', 'R. Singh', 'T. Patel'],
      bowling: [
        { name: 'M. Johnson', overs: 4.0, maidens: 0, runs: 42, wickets: 2, economy: 10.5 },
        { name: 'J. Anderson', overs: 4.0, maidens: 0, runs: 38, wickets: 1, economy: 9.5 },
        { name: 'K. Williams', overs: 4.0, maidens: 0, runs: 45, wickets: 2, economy: 11.25 },
        { name: 'S. Smith', overs: 3.4, maidens: 0, runs: 35, wickets: 0, economy: 9.54 },
      ],
      totalScore: 248,
      totalWickets: 7,
      totalOvers: '20'
    },
    teamTwo: {
      name: 'Valley Vikings',
      displayName: 'Valley Vikings',
      batting: [
        { name: 'M. Johnson', runs: 32, balls: 24, fours: 4, sixes: 1, strikeRate: 133.3, status: 'c Kumar b Khan' },
        { name: 'J. Anderson', runs: 28, balls: 20, fours: 3, sixes: 1, strikeRate: 140.0, status: 'b Singh' },
        { name: 'K. Williams', runs: 45, balls: 30, fours: 5, sixes: 2, strikeRate: 150.0, status: 'not out' },
        { name: 'S. Smith', runs: 38, balls: 26, fours: 4, sixes: 1, strikeRate: 146.2, status: 'c Patel b Sharma' },
        { name: 'D. Brown', runs: 22, balls: 15, fours: 2, sixes: 1, strikeRate: 146.7, status: 'run out' },
        { name: 'T. Wilson', runs: 15, balls: 10, fours: 1, sixes: 1, strikeRate: 150.0, status: 'not out' },
      ],
      yetToBat: ['L. Taylor', 'R. Clark', 'P. White', 'N. Davis', 'B. Harris'],
      bowling: [
        { name: 'A. Singh', overs: 4.0, maidens: 0, runs: 46, wickets: 1, economy: 11.5 },
        { name: 'V. Sharma', overs: 4.0, maidens: 0, runs: 42, wickets: 1, economy: 10.5 },
        { name: 'M. Khan', overs: 4.0, maidens: 1, runs: 38, wickets: 1, economy: 9.5 },
        { name: 'P. Das', overs: 4.0, maidens: 0, runs: 48, wickets: 0, economy: 12.0 },
      ],
      totalScore: 186,
      totalWickets: 5,
      totalOvers: '16.4'
    }
  }

  // Use real match data if provided, otherwise use default data
  const hasRealData = match && match.teamOne && match.teamTwo
  
  // Transform real match data to display format
  const getTeamData = (team: Team | undefined, teamName: string) => {
    if (!team) return defaultTeams[activeTeam === 'teamOne' ? 'teamOne' : 'teamTwo']
    
    const batting = team.players.map(player => ({
      name: player.name + (player.is_captain ? ' (C)' : '') + (player.is_keeper ? ' (WK)' : ''),
      runs: player.runs_scored || 0,
      balls: player.balls_played || 0,
      fours: player.fours || 0,
      sixes: player.sixes || 0,
      strikeRate: player.balls_played ? ((player.runs_scored || 0) / player.balls_played * 100) : 0,
      status: player.dismissal || (player.is_out ? 'out' : player.balls_played && player.balls_played > 0 ? 'not out' : 'yet to bat')
    }))

    const bowling = team.players
      .filter(p => p.balls_bowled && p.balls_bowled > 0)
      .map(player => ({
        name: player.name,
        overs: player.balls_bowled ? `${Math.floor(player.balls_bowled / 6)}.${player.balls_bowled % 6}` : '0.0',
        maidens: player.maidens || 0,
        runs: player.runs_conceded || 0,
        wickets: player.wickets || 0,
        economy: player.balls_bowled ? (player.runs_conceded || 0) / player.balls_bowled : 0
      }))

    const yetToBat = team.players
      .filter(p => !p.balls_played || p.balls_played === 0)
      .map(p => p.name)

    return {
      name: team.name,
      displayName: team.name,
      batting: batting.filter(p => p.balls > 0 || p.status === 'not out'),
      yetToBat,
      bowling,
      totalScore: team.total_score || 0,
      totalWickets: team.total_wickets || 0,
      totalOvers: team.total_balls ? `${Math.floor(team.total_balls / 6)}.${team.total_balls % 6}` : '0.0'
    }
  }

  // Get display data
  const team1Data = hasRealData ? getTeamData(match.teamOne, 'teamOne') : defaultTeams.teamOne
  const team2Data = hasRealData ? getTeamData(match.teamTwo, 'teamTwo') : defaultTeams.teamTwo
  const activeTeamData = activeTeam === 'teamOne' ? team1Data : team2Data
  const opponentTeamData = activeTeam === 'teamOne' ? team2Data : team1Data

  // Calculate match status
  const getMatchStatus = () => {
    if (!hasRealData) {
      return "Valley Vikings need 63 runs in 20 balls"
    }
    
    if (match.status === 'live' && match.currentInnings === 2 && match.target) {
      const battingTeam = match.batting_team === match.teamOne?.name ? match.teamOne : match.teamTwo
      const runsNeeded = match.target - (battingTeam?.total_score || 0)
      const ballsRemaining = (match.overs! * 6) - (battingTeam?.total_balls || 0)
      
      if (runsNeeded > 0 && ballsRemaining > 0) {
        return `${match.batting_team} need ${runsNeeded} runs in ${ballsRemaining} balls`
      }
    }
    
    return null
  }

  const getRequiredRunRate = () => {
    if (!hasRealData) return '18.90'
    
    if (match.status === 'live' && match.currentInnings === 2 && match.target) {
      const battingTeam = match.batting_team === match.teamOne?.name ? match.teamOne : match.teamTwo
      const runsNeeded = match.target - (battingTeam?.total_score || 0)
      const ballsRemaining = (match.overs! * 6) - (battingTeam?.total_balls || 0)
      
      if (ballsRemaining > 0 && runsNeeded > 0) {
        return ((runsNeeded * 6) / ballsRemaining).toFixed(2)
      }
    }
    
    return '0.00'
  }

  const matchStatus = getMatchStatus()
  const rrr = getRequiredRunRate()

  // Current batsmen (for live display)
  const currentBatsmen = activeTeamData.batting.filter(b => b.status === 'not out').slice(0, 2)

  const hasBatted = activeTeamData.batting && activeTeamData.batting.length > 0
  const hasBowled = opponentTeamData.bowling && opponentTeamData.bowling.length > 0

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden" id="preview">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            See it in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
              action
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Experience the live scoreboard interface that thousands of local teams love
          </p>
        </div>

        {/* Live Scorecard Preview */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-200/30 via-accent-200/30 to-primary-200/30 blur-3xl"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {hasRealData ? `Match ${match.matchCode}` : 'Summer League Final'}
                  </h3>
                  <p className="text-primary-100">
                    {hasRealData ? match.venue : 'Match 42 • Green Park Stadium'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{isLive || match?.status === 'live' ? 'LIVE' : match?.status?.toUpperCase() || 'LIVE'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{viewersCount > 0 ? `${(viewersCount / 1000).toFixed(1)}K` : '2.3K'} watching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams and Scores */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{team1Data.displayName}</h4>
                      <p className="text-sm text-gray-600">Innings 1 of 1</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary-600">
                        {team1Data.totalScore}/{team1Data.totalWickets}
                      </div>
                      <div className="text-sm text-gray-600">{team1Data.totalOvers} overs</div>
                    </div>
                  </div>
                  {match?.batting_team === team1Data.name && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Batting</p>
                      <div className="space-y-2">
                        {currentBatsmen.map((batsman, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="font-medium">{batsman.name}{idx === 0 ? '*' : ''}</span>
                            <span className="text-sm text-gray-600">{batsman.runs} ({batsman.balls})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{team2Data.displayName}</h4>
                      <p className="text-sm text-gray-600">Innings 1 of 1</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-900">
                        {team2Data.totalScore}/{team2Data.totalWickets}
                      </div>
                      <div className="text-sm text-gray-600">{team2Data.totalOvers} overs</div>
                    </div>
                  </div>
                  {match?.bowling_team === team2Data.name && opponentTeamData.bowling[0] && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Bowling</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{opponentTeamData.bowling[0].name}</span>
                          <span className="text-sm text-gray-600">
                            {opponentTeamData.bowling[0].overs}-{opponentTeamData.bowling[0].maidens}-{opponentTeamData.bowling[0].runs}-{opponentTeamData.bowling[0].wickets}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Economy</span>
                          <span className="text-sm font-medium">{opponentTeamData.bowling[0].economy.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Status */}
              {matchStatus && (
                <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {matchStatus}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">RRR: {rrr}</span>
                  </div>
                </div>
              )}

              {/* Recent Balls / Current Over (TC015) */}
              <div className="mt-6">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">
                  {match?.scoringState?.currentOver && match.scoringState.currentOver.length > 0 
                    ? 'This Over' 
                    : hasRealData && match?.ballHistory && match.ballHistory.length > 0
                    ? 'Ball-by-Ball History'
                    : 'This Over'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {hasRealData && match?.scoringState?.currentOver && match.scoringState.currentOver.length > 0 
                    ? match.scoringState.currentOver.map((ball: string, index: number) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            ball === 'W'
                              ? 'bg-red-100 text-red-600'
                              : ball === '4'
                              ? 'bg-blue-100 text-blue-600'
                              : ball === '6'
                              ? 'bg-green-100 text-green-600'
                              : ['WD', 'NB'].includes(ball)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          title={`Ball ${index + 1}: ${ball}`}
                        >
                          {ball}
                        </div>
                      ))
                    : hasRealData && match?.ballHistory && match.ballHistory.length > 0
                    ? match.ballHistory.slice(-6).map((ball: any, index: number) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            ball.outcome === 'W'
                              ? 'bg-red-100 text-red-600'
                              : ball.outcome === '4'
                              ? 'bg-blue-100 text-blue-600'
                              : ball.outcome === '6'
                              ? 'bg-green-100 text-green-600'
                              : ['WD', 'NB'].includes(ball.outcome)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          title={`Over ${ball.overNumber}, Ball ${ball.ballNumber}: ${ball.outcome} (${ball.runs} runs)`}
                        >
                          {ball.outcome}
                        </div>
                      ))
                    : ['1', '4', 'W', '2', '0', '6'].map((ball, index) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            ball === 'W'
                              ? 'bg-red-100 text-red-600'
                              : ball === '4'
                              ? 'bg-blue-100 text-blue-600'
                              : ball === '6'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ball}
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scorecard Tabs */}
        <div className="mt-16">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex space-x-1 max-w-xs w-full mx-4">
              <button
                onClick={() => setActiveTeam('teamOne')}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTeam === 'teamOne'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {team1Data.name}
              </button>
              <button
                onClick={() => setActiveTeam('teamTwo')}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTeam === 'teamTwo'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {team2Data.name}
              </button>
            </div>
          </div>

          {/* Batting Section */}
          {hasBatted ? (
            <>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 border-b">
                      <th className="text-left px-4 py-2">Batting</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-center px-4 py-2">R</th>
                      <th className="text-center px-4 py-2">B</th>
                      <th className="text-center px-4 py-2">4s</th>
                      <th className="text-center px-4 py-2">6s</th>
                      <th className="text-center px-4 py-2">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTeamData.batting.map((b, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-medium text-gray-800">{b.name}</td>
                        <td className="py-3 px-4 text-gray-600">{b.status}</td>
                        <td className="py-3 text-center">{b.runs}</td>
                        <td className="py-3 text-center">{b.balls}</td>
                        <td className="py-3 text-center">{b.fours}</td>
                        <td className="py-3 text-center">{b.sixes}</td>
                        <td className="py-3 text-center">{b.strikeRate.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Yet to Bat Section */}
              {activeTeamData.yetToBat && activeTeamData.yetToBat.length > 0 && (
                <div className="mb-12 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Yet to Bat</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                    {activeTeamData.yetToBat.slice(0, 4).map((player) => (
                      <span
                        key={player}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mb-8 text-center text-gray-600">No batting data yet.</div>
          )}

          {/* Bowling Section */}
          {hasBowled ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b">
                    <th className="text-left px-4 py-2">Bowling</th>
                    <th className="text-center px-4 py-2">O</th>
                    <th className="text-center px-4 py-2">M</th>
                    <th className="text-center px-4 py-2">R</th>
                    <th className="text-center px-4 py-2">W</th>
                    <th className="text-center px-4 py-2">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {opponentTeamData.bowling.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 text-center">{p.overs}</td>
                      <td className="py-3 text-center">{p.maidens}</td>
                      <td className="py-3 text-center">{p.runs}</td>
                      <td className="py-3 text-center">{p.wickets}</td>
                      <td className="py-3 text-center">{p.economy.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-600">No bowling data yet.</div>
          )}

          {/* Ball-by-Ball History Section (TC015) */}
          {hasRealData && match?.ballHistory && match.ballHistory.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ball-by-Ball History</h3>
              <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {match.ballHistory.map((ball: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-500">
                          {ball.overNumber}.{ball.ballNumber}
                        </span>
                        <span className="font-medium text-gray-700">{ball.batsman}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-gray-700">{ball.bowler}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded font-bold ${
                            ball.outcome === 'W'
                              ? 'bg-red-100 text-red-600'
                              : ball.outcome === '4'
                              ? 'bg-blue-100 text-blue-600'
                              : ball.outcome === '6'
                              ? 'bg-green-100 text-green-600'
                              : ['WD', 'NB'].includes(ball.outcome)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ball.outcome}
                        </span>
                        <span className="text-gray-700 font-medium">{ball.runs} runs</span>
                        {ball.isExtra && (
                          <span className="text-xs text-orange-600">(extra)</span>
                        )}
                        {ball.isWicket && (
                          <span className="text-xs text-red-600">(wicket)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}