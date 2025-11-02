'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Circle,
  Plus,
  Minus,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Coins
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ScoringPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Toss state
  const [showToss, setShowToss] = useState(false)
  const [tossWinner, setTossWinner] = useState('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | ''>('')

  // Player selection
  const [selectedBatsman1, setSelectedBatsman1] = useState<string>('')
  const [selectedBatsman2, setSelectedBatsman2] = useState<string>('')
  const [selectedBowler, setSelectedBowler] = useState<string>('')
  const [currentStriker, setCurrentStriker] = useState<'batsman1' | 'batsman2'>('batsman1')
  const [showPlayerSelection, setShowPlayerSelection] = useState(false)

  // Scoring state
  const [extraRuns, setExtraRuns] = useState(0)
  const [currentOver, setCurrentOver] = useState<string[]>([])
  const [outBatsmen, setOutBatsmen] = useState<string[]>([])

  // Innings state
  const [currentInnings, setCurrentInnings] = useState(1)
  const [battingTeamName, setBattingTeamName] = useState('')
  const [bowlingTeamName, setBowlingTeamName] = useState('')

  // Previous bowler tracking
  const [previousBowler, setPreviousBowler] = useState<string>('')
  const [replacingBatsman, setReplacingBatsman] = useState<'batsman1' | 'batsman2' | null>(null)
  const [outBatsmanName, setOutBatsmanName] = useState<string>('')
  const [onlySelectingBowler, setOnlySelectingBowler] = useState(false)

  // Match end states
  const [isInningsEnded, setIsInningsEnded] = useState(false)
  const [isMatchEnded, setIsMatchEnded] = useState(false)

  useEffect(() => {
    fetchMatch()
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        toast.error('Failed to load match')
        router.push(`/matches/${matchId}`)
        return
      }

      const data = await response.json()
      const matchData = data.data

      console.log('📥 Loading match:', {
        status: matchData.status,
        toss_winner: matchData.toss_winner,
        batting_team: matchData.batting_team,
        bowling_team: matchData.bowling_team,
        teamOne_balls: matchData.teamOne.total_balls,
        teamTwo_balls: matchData.teamTwo.total_balls
      })

      // Initialize team scores
      if (!matchData.teamOne.total_score) matchData.teamOne.total_score = 0
      if (!matchData.teamOne.total_wickets) matchData.teamOne.total_wickets = 0
      if (!matchData.teamOne.total_balls) matchData.teamOne.total_balls = 0
      if (!matchData.teamOne.extras) matchData.teamOne.extras = 0

      if (!matchData.teamTwo.total_score) matchData.teamTwo.total_score = 0
      if (!matchData.teamTwo.total_wickets) matchData.teamTwo.total_wickets = 0
      if (!matchData.teamTwo.total_balls) matchData.teamTwo.total_balls = 0
      if (!matchData.teamTwo.extras) matchData.teamTwo.extras = 0

      setMatch(matchData)

      // Check if match is completed
      if (matchData.status === 'completed') {
        setIsMatchEnded(true)
        toast('Match already completed')
        setTimeout(() => router.push(`/matches/${matchId}`), 2000)
        setLoading(false)
        return
      }

      // Check if toss is done
      const tossIsDone = !!(matchData.toss_winner && matchData.batting_team && matchData.bowling_team)

      if (!tossIsDone) {
        setShowToss(true)
        setShowPlayerSelection(false)
        setLoading(false)
        return
      }

      // Toss is done, resume match
      setShowToss(false)
      setBattingTeamName(matchData.batting_team)
      setBowlingTeamName(matchData.bowling_team)

      // Determine which team is batting
      const battingTeam = matchData.batting_team === matchData.teamOne.name
        ? matchData.teamOne
        : matchData.teamTwo

      // Determine current innings
      const teamOneBalls = matchData.teamOne.total_balls || 0
      const teamTwoBalls = matchData.teamTwo.total_balls || 0

      let innings = 1
      let currentBattingTeam = matchData.batting_team
      let currentBowlingTeam = matchData.bowling_team

      if (matchData.batting_team === matchData.teamOne.name && teamOneBalls > 0 && teamTwoBalls > 0) {
        innings = 2
        currentBattingTeam = matchData.teamTwo.name
        currentBowlingTeam = matchData.teamOne.name
      } else if (matchData.batting_team === matchData.teamTwo.name && teamTwoBalls > 0 && teamOneBalls > 0) {
        innings = 2
        currentBattingTeam = matchData.teamOne.name
        currentBowlingTeam = matchData.teamTwo.name
      }

      setCurrentInnings(innings)
      setBattingTeamName(currentBattingTeam)
      setBowlingTeamName(currentBowlingTeam)

      // Get correct teams for current innings
      const currentBattingTeamData = currentBattingTeam === matchData.teamOne.name
        ? matchData.teamOne
        : matchData.teamTwo

      const currentBowlingTeamData = currentBowlingTeam === matchData.teamOne.name
        ? matchData.teamOne
        : matchData.teamTwo

      // Find batsmen who are NOT out
      const notOutBatsmen = currentBattingTeamData.players.filter((p: any) => !p.is_out)

      const outPlayers = currentBattingTeamData.players
        .filter((p: any) => p.is_out)
        .map((p: any) => p.name)

      setOutBatsmen(outPlayers)

      // Find active bowlers
      const activeBowlers = currentBowlingTeamData.players
        .filter((p: any) => (p.balls_bowled || 0) > 0)
        .sort((a: any, b: any) => (b.balls_bowled || 0) - (a.balls_bowled || 0))

      // Resume logic based on match state
      const teamTotalBalls = currentBattingTeamData.total_balls || 0

      if (teamTotalBalls === 0) {
        // No balls bowled - fresh start after toss
        setShowPlayerSelection(true)
        setLoading(false)
      } else if (notOutBatsmen.length >= 2) {
        // At least 2 batsmen available - resume with them
        const sorted = [...notOutBatsmen].sort((a: any, b: any) => (b.balls_played || 0) - (a.balls_played || 0))

        setSelectedBatsman1(sorted[0].name)
        setSelectedBatsman2(sorted[1].name)

        // Determine striker
        if ((sorted[0].balls_played || 0) > (sorted[1].balls_played || 0)) {
          setCurrentStriker('batsman1')
        } else if ((sorted[1].balls_played || 0) > (sorted[0].balls_played || 0)) {
          setCurrentStriker('batsman2')
        } else {
          setCurrentStriker('batsman1')
        }

        if (activeBowlers.length > 0) {
          setSelectedBowler(activeBowlers[0].name)
        }

        setShowPlayerSelection(false)
        setLoading(false)
      } else if (notOutBatsmen.length === 1) {
        // Only one batsman - need new one
        setSelectedBatsman1(notOutBatsmen[0].name)
        setSelectedBatsman2('')
        setReplacingBatsman('batsman2')
        setShowPlayerSelection(true)

        if (activeBowlers.length > 0) {
          setSelectedBowler(activeBowlers[0].name)
        }

        setLoading(false)
      } else {
        // No batsmen available
        setShowPlayerSelection(true)
        setLoading(false)
      }

    } catch (err) {
      toast.error('Failed to load match')
      console.error('Fetch match error:', err)
      setLoading(false)
    }
  }

  const handleToss = async () => {
    if (!tossWinner || !tossDecision) {
      toast.error('Please select toss winner and decision')
      return
    }

    let battingTeam, bowlingTeam

    if (tossDecision === 'bat') {
      battingTeam = tossWinner
      bowlingTeam = tossWinner === match.teamOne.name ? match.teamTwo.name : match.teamOne.name
    } else {
      bowlingTeam = tossWinner
      battingTeam = tossWinner === match.teamOne.name ? match.teamTwo.name : match.teamOne.name
    }

    const updatedMatch = { ...match }
    updatedMatch.toss_winner = tossWinner
    updatedMatch.toss_decision = tossDecision
    updatedMatch.batting_team = battingTeam
    updatedMatch.bowling_team = bowlingTeam
    updatedMatch.status = 'live'
    updatedMatch.currentInnings = 1

    setBattingTeamName(battingTeam)
    setBowlingTeamName(bowlingTeam)
    setMatch(updatedMatch)

    const saved = await saveMatchToServer(updatedMatch)

    if (saved) {
      setShowToss(false)
      setShowPlayerSelection(true)
      toast.success(`${tossWinner} won the toss and chose to ${tossDecision}`)
    } else {
      toast.error('Failed to save toss - please try again')
    }
  }

  const getBattingTeam = () => {
    if (!match || !battingTeamName) return null
    return battingTeamName === match.teamOne.name ? match.teamOne : match.teamTwo
  }

  const getBowlingTeam = () => {
    if (!match || !bowlingTeamName) return null
    return bowlingTeamName === match.teamOne.name ? match.teamOne : match.teamTwo
  }

  const getAvailableBatsmen = () => {
    const battingTeam = getBattingTeam()
    if (!battingTeam) return []
    return battingTeam.players.filter((p: any) => !outBatsmen.includes(p.name))
  }

  const startScoring = () => {
    if (onlySelectingBowler) {
      if (!selectedBowler) {
        toast.error('Please select a bowler')
        return
      }

      if (selectedBowler === previousBowler) {
        toast.error('Bowler cannot bowl consecutive overs')
        return
      }

      setOnlySelectingBowler(false)
      setShowPlayerSelection(false)
      toast.success('New bowler selected!')
      return
    }

    if (replacingBatsman) {
      const newBatsman = replacingBatsman === 'batsman1' ? selectedBatsman1 : selectedBatsman2
      const otherBatsman = replacingBatsman === 'batsman1' ? selectedBatsman2 : selectedBatsman1

      if (!newBatsman) {
        toast.error('Please select the new batsman')
        return
      }

      if (newBatsman === otherBatsman) {
        toast.error('Please select a different batsman')
        return
      }

      setReplacingBatsman(null)
      setOutBatsmanName('')
      setShowPlayerSelection(false)
      toast.success(`${newBatsman} is now batting!`)
      return
    }

    if (!selectedBatsman1 || !selectedBatsman2 || !selectedBowler) {
      toast.error('Please select both batsmen and bowler')
      return
    }

    if (selectedBatsman1 === selectedBatsman2) {
      toast.error('Please select different batsmen')
      return
    }

    if (selectedBowler === previousBowler) {
      toast.error('Bowler cannot bowl consecutive overs')
      return
    }

    setShowPlayerSelection(false)
    toast.success('Scoring started!')
  }

  const saveMatchToServer = async (updatedMatch: any) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ match: updatedMatch })
      })

      return response.ok
    } catch (err) {
      console.error('Save error:', err)
      return false
    }
  }

  const recordBall = async (outcome: string) => {
    if (!match) return

    if (isMatchEnded || isInningsEnded) {
      toast.error('Cannot update score - match/innings has ended')
      return
    }

    const battingTeam = getBattingTeam()
    const bowlingTeam = getBowlingTeam()
    if (!battingTeam || !bowlingTeam) return

    let runs = 0
    let isWicket = false
    let isExtra = false
    let ballCounts = true
    let shouldRotateStrike = false

    switch (outcome) {
      case '0':
        runs = 0
        break
      case '1':
      case '3':
      case '5':
        runs = parseInt(outcome)
        shouldRotateStrike = true
        break
      case '2':
      case '4':
      case '6':
        runs = parseInt(outcome)
        shouldRotateStrike = false
        break
      case 'W':
        isWicket = true
        break
      case 'WD':
        runs = 1 + extraRuns
        isExtra = true
        ballCounts = false
        shouldRotateStrike = false
        break
      case 'NB':
        runs = 1 + extraRuns
        isExtra = true
        ballCounts = false
        shouldRotateStrike = false
        break
      case 'B':
      case 'LB':
        runs = extraRuns
        isExtra = true
        shouldRotateStrike = (runs % 2 === 1)
        break
    }

    const updatedMatch = { ...match }
    const teamToUpdate = battingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'
    const bowlingTeamKey = bowlingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'

    const totalPlayers = updatedMatch[teamToUpdate].players.length

    // Update batsman stats
    const currentBatsmanName = currentStriker === 'batsman1' ? selectedBatsman1 : selectedBatsman2
    const batsmanIndex = updatedMatch[teamToUpdate].players.findIndex(
      (p: any) => p.name === currentBatsmanName
    )

    if (batsmanIndex !== -1) {
      if (ballCounts) {
        updatedMatch[teamToUpdate].players[batsmanIndex].balls_played += 1
      }

      if (!['WD', 'NB', 'B', 'LB'].includes(outcome)) {
        updatedMatch[teamToUpdate].players[batsmanIndex].runs_scored += runs

        if (outcome === '4') {
          updatedMatch[teamToUpdate].players[batsmanIndex].fours += 1
        }
        if (outcome === '6') {
          updatedMatch[teamToUpdate].players[batsmanIndex].sixes += 1
        }
      }

      if (isWicket) {
        updatedMatch[teamToUpdate].players[batsmanIndex].is_out = true
      }
    }

    // Update bowler stats
    const bowlerIndex = updatedMatch[bowlingTeamKey].players.findIndex(
      (p: any) => p.name === selectedBowler
    )

    if (bowlerIndex !== -1) {
      const bowler = updatedMatch[bowlingTeamKey].players[bowlerIndex]

      if (ballCounts) {
        bowler.balls_bowled = (bowler.balls_bowled || 0) + 1

        if (runs === 0 && !isWicket) {
          bowler.dot_balls = (bowler.dot_balls || 0) + 1
        }
      }

      if (!['B', 'LB'].includes(outcome)) {
        bowler.runs_conceded = (bowler.runs_conceded || 0) + runs
      }

      if (isWicket) {
        bowler.wickets = (bowler.wickets || 0) + 1
      }
    }

    // Update team totals
    updatedMatch[teamToUpdate].total_score += runs

    if (isExtra) {
      updatedMatch[teamToUpdate].extras += runs
    }

    if (ballCounts) {
      updatedMatch[teamToUpdate].total_balls = (updatedMatch[teamToUpdate].total_balls || 0) + 1
    }

    if (isWicket) {
      updatedMatch[teamToUpdate].total_wickets += 1

      const outBatsman = currentStriker === 'batsman1' ? selectedBatsman1 : selectedBatsman2
      setOutBatsmen([...outBatsmen, outBatsman])

      const wicketsDown = updatedMatch[teamToUpdate].total_wickets

      if (wicketsDown >= totalPlayers - 1 || (totalPlayers === 2 && wicketsDown >= 1)) {
        toast(`All out! ${battingTeam.name} innings complete`)
        setIsInningsEnded(true)
        setMatch(updatedMatch)
        await saveMatchToServer(updatedMatch)
        handleInningsEnd(updatedMatch)
        return
      }

      setOutBatsmanName(outBatsman)
      setReplacingBatsman(currentStriker)

      if (currentStriker === 'batsman1') {
        setSelectedBatsman1('')
      } else {
        setSelectedBatsman2('')
      }

      toast(`${outBatsman} is out! Select next batsman`)
      setShowPlayerSelection(true)

      setMatch(updatedMatch)
      setExtraRuns(0)
      await saveMatchToServer(updatedMatch)
      return
    }

    // Check for target in second innings
    if (currentInnings === 2 && updatedMatch.target) {
      if (updatedMatch[teamToUpdate].total_score >= updatedMatch.target) {
        const wicketsLeft = totalPlayers - updatedMatch[teamToUpdate].total_wickets
        toast.success(`${battingTeamName} won by ${wicketsLeft} wickets!`)
        updatedMatch.status = 'completed'
        setIsMatchEnded(true)
        setMatch(updatedMatch)
        await saveMatchToServer(updatedMatch)

        setTimeout(() => {
          router.push(`/matches/${matchId}`)
        }, 3000)
        return
      }
    }

    const newCurrentOver = [...currentOver, outcome]
    setCurrentOver(newCurrentOver)

    const legalBallsInOver = newCurrentOver.filter(b => !['WD', 'NB'].includes(b)).length

    if (legalBallsInOver === 6) {
      // Check for maiden over
      if (bowlerIndex !== -1) {
        const overRuns = newCurrentOver.reduce((total, ball) => {
          if (ball === 'W' || ball === '0') return total
          if (ball === 'WD' || ball === 'NB') return total + 1
          return total + parseInt(ball)
        }, 0)

        if (overRuns === 0) {
          updatedMatch[bowlingTeamKey].players[bowlerIndex].maidens =
            (updatedMatch[bowlingTeamKey].players[bowlerIndex].maidens || 0) + 1
          toast.success(`Maiden over by ${selectedBowler}! 🎯`)
        }
      }

      toast.success('Over completed!')

      const newStriker = currentStriker === 'batsman1' ? 'batsman2' : 'batsman1'
      setCurrentStriker(newStriker)
      setCurrentOver([])

      setPreviousBowler(selectedBowler)
      setSelectedBowler('')
      setOnlySelectingBowler(true)

      toast(`Strike changed to ${newStriker === 'batsman1' ? selectedBatsman1 : selectedBatsman2}`)
      setShowPlayerSelection(true)

      setMatch(updatedMatch)
      await saveMatchToServer(updatedMatch)
      return
    } else if (shouldRotateStrike && !isWicket) {
      setCurrentStriker(prev => prev === 'batsman1' ? 'batsman2' : 'batsman1')
    }

    const totalBalls = updatedMatch.overs * 6
    if (updatedMatch[teamToUpdate].total_balls >= totalBalls) {
      setIsInningsEnded(true)
      setMatch(updatedMatch)
      await saveMatchToServer(updatedMatch)
      handleInningsEnd(updatedMatch)
      return
    }

    setMatch(updatedMatch)
    setExtraRuns(0)

    await saveMatchToServer(updatedMatch)
  }

  const handleInningsEnd = (updatedMatch: any) => {
    if (currentInnings === 1) {
      const teamToUpdate = battingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'
      updatedMatch.target = updatedMatch[teamToUpdate].total_score + 1

      toast.success(`First innings complete! Target: ${updatedMatch.target}`)

      setCurrentInnings(2)
      updatedMatch.currentInnings = 2
      setBattingTeamName(bowlingTeamName)
      setBowlingTeamName(battingTeamName)

      setCurrentOver([])
      setOutBatsmen([])
      setShowPlayerSelection(true)
      setSelectedBatsman1('')
      setSelectedBatsman2('')
      setSelectedBowler('')
      setCurrentStriker('batsman1')

      setPreviousBowler('')
      setReplacingBatsman(null)
      setOnlySelectingBowler(false)
      setOutBatsmanName('')

      setIsInningsEnded(false)
    } else {
      updatedMatch.status = 'completed'
      setIsMatchEnded(true)

      const battingTeamData = battingTeamName === updatedMatch.teamOne.name
        ? updatedMatch.teamOne
        : updatedMatch.teamTwo

      const totalPlayers = battingTeamData.players.length

      if (battingTeamData.total_score < updatedMatch.target - 1) {
        const runDiff = updatedMatch.target - 1 - battingTeamData.total_score
        toast.success(`${bowlingTeamName} won by ${runDiff} runs!`)
      } else if (battingTeamData.total_score === updatedMatch.target - 1) {
        toast.success('Match Tied!')
      }

      setTimeout(() => {
        router.push(`/matches/${matchId}`)
      }, 3000)
    }

    setMatch(updatedMatch)
    saveMatchToServer(updatedMatch)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match...</p>
        </div>
      </div>
    )
  }

  if (!match) return null

  const battingTeam = getBattingTeam()
  const bowlingTeam = getBowlingTeam()

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.push(`/matches/${matchId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg">{match.matchCode}</span>
                {match.status === 'live' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <Circle className="h-3 w-3 fill-current animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Toss Section */}
          {showToss && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="h-6 w-6 text-yellow-600" />
                <h2 className="text-xl font-bold">Toss</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Who won the toss?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="toss"
                        value={match.teamOne.name}
                        onChange={(e) => setTossWinner(e.target.value)}
                        className="text-green-600"
                      />
                      <span className="font-medium">{match.teamOne.name}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="toss"
                        value={match.teamTwo.name}
                        onChange={(e) => setTossWinner(e.target.value)}
                        className="text-green-600"
                      />
                      <span className="font-medium">{match.teamTwo.name}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Decision?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="decision"
                        value="bat"
                        onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                        className="text-green-600"
                      />
                      <span className="font-medium">Bat First</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="decision"
                        value="bowl"
                        onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                        className="text-green-600"
                      />
                      <span className="font-medium">Bowl First</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleToss}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Start Match
              </Button>
            </Card>
          )}

          {/* Score Display - Better UI */}
          {!showToss && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Batting Team Card */}
              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5" />
                  <h3 className="text-sm font-medium opacity-90">BATTING</h3>
                </div>
                <h2 className="text-2xl font-bold mb-2">{battingTeam?.name}</h2>
                <div className="text-4xl font-bold mb-2">
                  {battingTeam?.total_score || 0}/{battingTeam?.total_wickets || 0}
                </div>
                <p className="text-sm opacity-90">
                  Overs: {Math.floor((battingTeam?.total_balls || 0) / 6)}.{(battingTeam?.total_balls || 0) % 6}
                  {battingTeam?.extras > 0 && ` • Extras: ${battingTeam.extras}`}
                </p>
                {currentInnings === 2 && match.target && (
                  <div className="mt-3 pt-3 border-t border-white/30">
                    <p className="text-sm">Target: {match.target}</p>
                    <p className="text-lg font-bold">
                      Need {Math.max(0, match.target - (battingTeam?.total_score || 0))} runs
                    </p>
                  </div>
                )}
              </Card>

              {/* Bowling Team Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5" />
                  <h3 className="text-sm font-medium opacity-90">BOWLING</h3>
                </div>
                <h2 className="text-2xl font-bold mb-4">{bowlingTeam?.name}</h2>
                {currentInnings === 1 && (
                  <p className="text-sm opacity-90">First Innings</p>
                )}
                {currentInnings === 2 && (
                  <div>
                    <p className="text-sm opacity-90">Second Innings</p>
                    <p className="text-lg font-bold mt-2">
                      Defending {match.target} runs
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Current Over */}
          {currentOver.length > 0 && (
            <Card className="p-4 mb-6">
              <p className="text-sm font-medium mb-2">This Over:</p>
              <div className="flex gap-2">
                {currentOver.map((ball, i) => (
                  <span
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                      ${ball === 'W' ? 'bg-red-500' :
                        ball === '4' ? 'bg-blue-500' :
                          ball === '6' ? 'bg-purple-500' :
                            ball === 'WD' || ball === 'NB' ? 'bg-yellow-500' :
                              'bg-gray-400'}`}
                  >
                    {ball}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Player Selection */}
          {!showToss && showPlayerSelection && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Select Players</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Striker Batsman {currentStriker === 'batsman1' && '*'}
                  </label>
                  <select
                    value={selectedBatsman1}
                    onChange={(e) => setSelectedBatsman1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Batsman</option>
                    {getAvailableBatsmen().map((player: any, i: number) => (
                      <option key={i} value={player.name}>
                        {player.name} {player.is_captain && '(C)'} {player.is_keeper && '(WK)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Non-Striker {currentStriker === 'batsman2' && '*'}
                  </label>
                  <select
                    value={selectedBatsman2}
                    onChange={(e) => setSelectedBatsman2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Batsman</option>
                    {getAvailableBatsmen()
                      .filter((p: any) => p.name !== selectedBatsman1)
                      .map((player: any, i: number) => (
                        <option key={i} value={player.name}>
                          {player.name} {player.is_captain && '(C)'} {player.is_keeper && '(WK)'}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bowler</label>
                  <select
                    value={selectedBowler}
                    onChange={(e) => setSelectedBowler(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Bowler</option>
                    {bowlingTeam?.players.map((player: any, i: number) => (
                      <option key={i} value={player.name}>
                        {player.name} {player.is_captain && '(C)'} {player.is_keeper && '(WK)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={startScoring}
                className="w-full mt-4 bg-green-500 hover:bg-green-600"
              >
                Continue Scoring
              </Button>
            </Card>
          )}

          {/* Current Players Display */}
          {!showToss && !showPlayerSelection && selectedBatsman1 && selectedBatsman2 && (
            <Card className="p-4 mb-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">STRIKER</p>
                  <p className="font-bold text-green-700">
                    {currentStriker === 'batsman1' ? selectedBatsman1 : selectedBatsman2} *
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">NON-STRIKER</p>
                  <p className="font-bold">
                    {currentStriker === 'batsman2' ? selectedBatsman1 : selectedBatsman2}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">BOWLER</p>
                  <p className="font-bold text-blue-700">{selectedBowler}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Scoring Controls */}
          {!showToss && !showPlayerSelection && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Record Ball</h3>

              {/* Runs */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['0', '1', '2', '3', '4', '5', '6'].map(run => (
                  <Button
                    key={run}
                    onClick={() => recordBall(run)}
                    variant="secondary"
                    className={`h-14 text-lg font-bold
                      ${run === '4' ? '!bg-blue-500 hover:!bg-blue-600 !text-white' :
                        run === '6' ? '!bg-purple-500 hover:!bg-purple-600 !text-white' :
                          ''}`}
                  >
                    {run}
                  </Button>
                ))}
                <Button
                  onClick={() => recordBall('W')}
                  className="h-14 text-lg font-bold !bg-red-500 hover:!bg-red-600"
                >
                  W
                </Button>
              </div>

              {/* Extras */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Button onClick={() => recordBall('WD')} variant="outline" className="h-12">
                  Wide
                </Button>
                <Button onClick={() => recordBall('NB')} variant="outline" className="h-12">
                  No Ball
                </Button>
                <Button onClick={() => recordBall('B')} variant="outline" className="h-12">
                  Bye
                </Button>
                <Button onClick={() => recordBall('LB')} variant="outline" className="h-12">
                  Leg Bye
                </Button>
              </div>

              {/* Extra runs */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Extra runs (for wides/no-balls):</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExtraRuns(Math.max(0, extraRuns - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-bold">{extraRuns}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExtraRuns(extraRuns + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
