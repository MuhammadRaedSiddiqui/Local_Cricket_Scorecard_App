'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Circle, Download } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiCall, wait } from '@/utils/apiHelpers'
import { logger } from '@/utils/debugLogger'
import { TossForm } from './components/TossForm'
import { PlayerSelectionForm } from './components/PlayerSelectionForm'
import { ScoringInterface } from './components/ScoringInterface'
import { BatsmanChangeForm } from './components/BatsmanSelectionForm'
import { Match, Team, Player } from '@/types/match'

type MatchState = 'LOADING' | 'TOSS' | 'PLAYER_SELECTION' | 'SCORING' | 'ERROR'

export default function SimplifiedScoringPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string
  const hasLoaded = useRef(false)

  // Core state
  const [state, setState] = useState<MatchState>('LOADING')
  const [match, setMatch] = useState<Match | null>(null)
  const [error, setError] = useState<string>('')

  // Scoring state
  const [batsman1, setBatsman1] = useState('') // ✅ Changed from striker
  const [batsman2, setBatsman2] = useState('') // ✅ Changed from nonStriker
  const [bowler, setBowler] = useState('')
  const [currentStriker, setCurrentStriker] = useState<'batsman1' | 'batsman2'>('batsman1') // ✅ New
  const [currentOver, setCurrentOver] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [wickets, setWickets] = useState(0)
  const [balls, setBalls] = useState(0)
  const [outBatsmen, setOutBatsmen] = useState<string[]>([]) // ✅ New

  // UI control states
  const [needsBowlerChange, setNeedsBowlerChange] = useState(false)
  const [needsBatsmanChange, setNeedsBatsmanChange] = useState(false) // ✅ New
  const [previousBowler, setPreviousBowler] = useState('')
  const [outBatsman, setOutBatsman] = useState('') // ✅ New - which batsman is out


    const [currentInnings, setCurrentInnings] = useState(1) // ✅ Add this

  // Derived values
  const battingTeam = getBattingTeam()
  const bowlingTeam = getBowlingTeam()

  function getBattingTeam(): Team | null {
    if (!match || !match.batting_team) return null
    return match.batting_team === match.teamOne.name
      ? match.teamOne
      : match.teamTwo
  }

  function getBowlingTeam(): Team | null {
    if (!match || !match.bowling_team) return null
    return match.bowling_team === match.teamOne.name
      ? match.teamOne
      : match.teamTwo
  }

  // ✅ Get available batsmen (not out)
  // ✅ FIXED VERSION - Filter out both out players AND current batsmen
  function getAvailableBatsmen(): Player[] {
    if (!battingTeam) return []

    return battingTeam.players.filter((p: Player) => {
      // Exclude players who are out
      if (outBatsmen.includes(p.name)) return false

      // Exclude current batsmen (the one still batting)
      if (p.name === batsman1 || p.name === batsman2) return false

      return true
    })
  }

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      loadMatch()
    }
  }, [])

  async function loadMatch() {
    logger.info('PAGE', 'Loading match', { matchId })
    setState('LOADING')

    try {
      await wait(500)

      const response = await apiCall<{ success: boolean; data: Match }>(
        `/api/matches/${matchId}`,
        { timeout: 5000 }
      )

      const matchData = response.data
      logger.info('PAGE', 'Match loaded', matchData)
      setMatch(matchData)

      if (!matchData.toss_winner) {
        logger.info('PAGE', 'No toss found, showing toss form')
        setState('TOSS')
      } else if (!matchData.batting_team) {
        logger.warning('PAGE', 'Toss found but no batting team - data corruption')
        setState('TOSS')
      } else {
        const hasPlayers =
          matchData.scoringState?.selectedBatsman1 &&
          matchData.scoringState?.selectedBatsman2 &&
          matchData.scoringState?.selectedBowler

        if (!hasPlayers) {
          logger.info('PAGE', 'Toss complete, no players, showing player selection')
          setState('PLAYER_SELECTION')
        } else {
          logger.info('PAGE', 'Players found, restoring scoring state')

          // ✅ Restore ALL state
          setBatsman1(matchData.scoringState.selectedBatsman1)
          setBatsman2(matchData.scoringState.selectedBatsman2)
          setBowler(matchData.scoringState.selectedBowler)
          setCurrentStriker(matchData.scoringState.currentStriker || 'batsman1') // ✅ Restore striker
          setCurrentOver(matchData.scoringState.currentOver || [])
          setOutBatsmen(matchData.scoringState.outBatsmen || []) // ✅ Restore out batsmen
          setPreviousBowler(matchData.scoringState.previousBowler || '')
          setCurrentInnings(matchData.scoringState.currentInnings || 1)

          const team = getBattingTeamFromMatch(matchData)
          if (team) {
            setScore(team.total_score || 0)
            setWickets(team.total_wickets || 0)
            setBalls(team.total_balls || 0)
          }

          logger.debug('PAGE', 'State restored', {
            batsman1: matchData.scoringState.selectedBatsman1,
            batsman2: matchData.scoringState.selectedBatsman2,
            bowler: matchData.scoringState.selectedBowler,
            currentStriker: matchData.scoringState.currentStriker,
            currentOver: matchData.scoringState.currentOver,
            outBatsmen: matchData.scoringState.outBatsmen,
            score: team?.total_score,
          })

          setState('SCORING')
          toast.success('Match resumed!')
        }
      }
    } catch (err: any) {
      logger.error('PAGE', 'Failed to load match', err)
      setError(err.message || 'Failed to load match')
      setState('ERROR')
      toast.error(err.message || 'Failed to load match')
    }
  }

  function getBattingTeamFromMatch(matchData: Match): Team | null {
    if (!matchData.batting_team) return null
    return matchData.batting_team === matchData.teamOne.name
      ? matchData.teamOne
      : matchData.teamTwo
  }

  async function handleTossComplete(winner: string, decision: 'bat' | 'bowl') {
    logger.info('TOSS', 'Processing toss', { winner, decision })

    try {
      if (!match) throw new Error('Match not loaded')

      const battingTeam =
        decision === 'bat'
          ? winner
          : winner === match.teamOne.name
            ? match.teamTwo.name
            : match.teamOne.name

      const bowlingTeam =
        decision === 'bowl'
          ? winner
          : winner === match.teamOne.name
            ? match.teamTwo.name
            : match.teamOne.name

      logger.debug('TOSS', 'Calculated teams', { battingTeam, bowlingTeam })

      await wait(1000)

      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          toss_winner: winner,
          toss_decision: decision,
          batting_team: battingTeam,
          bowling_team: bowlingTeam,
          status: 'live',
        },
        timeout: 5000,
      })

      logger.success('TOSS', 'Toss saved to database')

      setMatch({
        ...match,
        toss_winner: winner,
        toss_decision: decision,
        batting_team: battingTeam,
        bowling_team: bowlingTeam,
        status: 'live',
      })

      await wait(1000)

      toast.success(`${winner} won the toss and chose to ${decision}`)

      setState('PLAYER_SELECTION')
    } catch (err: any) {
      logger.error('TOSS', 'Failed to save toss', err)
      toast.error(err.message || 'Failed to save toss')
      throw err
    }
  }

  async function handlePlayersSelected(
  selectedBatsman1: string,
  selectedBatsman2: string,
  selectedBowler: string
) {
  logger.info('PLAYERS', 'Processing player selection', {
    selectedBatsman1,
    selectedBatsman2,
    selectedBowler,
  })

  try {
    if (!match) throw new Error('Match not loaded')

    await wait(1000)

    await apiCall(`/api/matches/${matchId}/score`, {
      method: 'POST',
      body: {
        scoringState: {
          selectedBatsman1: selectedBatsman1,
          selectedBatsman2: selectedBatsman2,
          selectedBowler: selectedBowler,
          currentStriker: 'batsman1',
          currentOver: [],
          outBatsmen: [],
          currentInnings: currentInnings, // ✅ Use current innings
          previousBowler: '',
        },
      },
      timeout: 5000,
    })

    logger.success('PLAYERS', 'Players saved to database')

    setBatsman1(selectedBatsman1)
    setBatsman2(selectedBatsman2)
    setBowler(selectedBowler)
    setCurrentStriker('batsman1')
    setCurrentOver([])
    setOutBatsmen([])

    await wait(1000)

    toast.success('Players selected! Start scoring')

    setState('SCORING')
  } catch (err: any) {
    logger.error('PLAYERS', 'Failed to save players', err)
    toast.error(err.message || 'Failed to save players')
    throw err
  }
}

  async function handleBallRecorded(outcome: string) {
    logger.info('BALL', `Recording ball: ${outcome}`)

    try {
      if (!match) throw new Error('Match not loaded')

      let runs = 0
      let isWicket = false
      let isExtra = false
      let ballCounts = true
      let shouldRotateStrike = false // ✅ New

      switch (outcome) {
        case '0':
          runs = 0
          shouldRotateStrike = false
          break
        case '1':
        case '3':
        case '5':
          runs = parseInt(outcome)
          shouldRotateStrike = true // ✅ Odd runs rotate strike
          break
        case '2':
        case '4':
        case '6':
          runs = parseInt(outcome)
          shouldRotateStrike = false // ✅ Even runs don't rotate
          break
        case 'W':
          isWicket = true
          shouldRotateStrike = false
          break
        case 'WD':
        case 'NB':
        case 'B':
        case 'LB':
          runs = 1
          isExtra = true
          ballCounts = outcome !== 'WD' && outcome !== 'NB'
          shouldRotateStrike = false // ✅ Simplified: no rotation on extras
          break
      }

      const newScore = score + runs
      const newWickets = isWicket ? wickets + 1 : wickets
      const newBalls = ballCounts ? balls + 1 : balls
      const newCurrentOver = [...currentOver, outcome]

      setScore(newScore)
      setWickets(newWickets)
      setBalls(newBalls)
      setCurrentOver(newCurrentOver)

      // ✅ Handle wicket
      // ✅ Handle wicket
      if (isWicket) {
        logger.info('BALL', 'Wicket fallen', {
          striker: currentStriker,
          outPlayer: currentStriker === 'batsman1' ? batsman1 : batsman2,
        })

        const dismissedBatsman =
          currentStriker === 'batsman1' ? batsman1 : batsman2
        const newOutBatsmen = [...outBatsmen, dismissedBatsman]
        setOutBatsmen(newOutBatsmen)
        setOutBatsman(dismissedBatsman)

        const newScore = score + runs
        const newWickets = wickets + 1
        const newBalls = balls + 1
        const newCurrentOver = [...currentOver, outcome]

        setScore(newScore)
        setWickets(newWickets)
        setBalls(newBalls)
        setCurrentOver(newCurrentOver)

        // ✅ SAVE WICKET TO DATABASE FIRST
        await wait(500)

        const teamToUpdate =
          match.batting_team === match.teamOne.name ? 'teamOne' : 'teamTwo'

        await apiCall(`/api/matches/${matchId}/score`, {
          method: 'POST',
          body: {
            [`${teamToUpdate}.total_score`]: newScore,
            [`${teamToUpdate}.total_wickets`]: newWickets,
            [`${teamToUpdate}.total_balls`]: newBalls,
            scoringState: {
              selectedBatsman1: batsman1,
              selectedBatsman2: batsman2,
              selectedBowler: bowler,
              previousBowler: previousBowler,
              currentStriker: currentStriker,
              currentOver: newCurrentOver,
              outBatsmen: newOutBatsmen,
              currentInnings: 1,
            },
          },
          timeout: 5000,
        })

        logger.success('BALL', 'Wicket saved to database')
        toast.error(`Wicket! ${dismissedBatsman} is out`)

        // ✅ NOW CHECK FOR ALL OUT (after saving)
        const battingTeamPlayers = battingTeam?.players || []
        const totalPlayers = battingTeamPlayers.length
        const availableBatsmenCount = battingTeamPlayers.filter(
          (p: Player) => !newOutBatsmen.includes(p.name)
        ).length

        logger.debug('BALL', 'All out check', {
          totalPlayers,
          wickets: newWickets,
          outBatsmen: newOutBatsmen.length,
          availableBatsmen: availableBatsmenCount,
        })

        // ✅ All out conditions
        const isAllOut =
          availableBatsmenCount === 0 || // No batsmen left
          newWickets >= totalPlayers - 1 || // All wickets down
          (totalPlayers === 2 && newWickets >= 1) // Special case: 2 players, 1 wicket

        if (isAllOut) {
          logger.info('BALL', 'All Out! Innings complete')
          toast.error('All Out! Innings complete')

          // ✅ Handle innings end properly
          await handleInningsComplete(newScore, newWickets)
          return
        }

        // ✅ Not all out - show batsman selection
        setNeedsBatsmanChange(true)
        return
      }

      // ✅ Rotate strike if needed
      let newStriker = currentStriker
      if (shouldRotateStrike) {
        newStriker = currentStriker === 'batsman1' ? 'batsman2' : 'batsman1'
        setCurrentStriker(newStriker)
        logger.debug('BALL', 'Strike rotated', {
          from: currentStriker,
          to: newStriker,
        })
      }

      const legalBalls = newCurrentOver.filter(
        (b) => !['WD', 'NB'].includes(b)
      ).length

      // ✅ Handle over completion
      if (legalBalls === 6) {
        logger.info('BALL', 'Over completed, need bowler change')
        toast.success('Over completed! Select new bowler')

        // ✅ Rotate strike at end of over
        const strikerAfterOver =
          newStriker === 'batsman1' ? 'batsman2' : 'batsman1'
        setCurrentStriker(strikerAfterOver)

        setPreviousBowler(bowler)
        setCurrentOver([])
        setNeedsBowlerChange(true)

        logger.debug('BALL', 'Strike rotated after over', {
          newStriker: strikerAfterOver,
        })

        return
      }

      // ✅ Save normal ball
      await wait(500)

      const teamToUpdate =
        match.batting_team === match.teamOne.name ? 'teamOne' : 'teamTwo'

      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          [`${teamToUpdate}.total_score`]: newScore,
          [`${teamToUpdate}.total_wickets`]: newWickets,
          [`${teamToUpdate}.total_balls`]: newBalls,
          scoringState: {
            selectedBatsman1: batsman1,
            selectedBatsman2: batsman2,
            selectedBowler: bowler,
            previousBowler: previousBowler,
            currentStriker: newStriker, // ✅ Save new striker
            currentOver: newCurrentOver,
            outBatsmen: outBatsmen,
            currentInnings: 1,
          },
        },
        timeout: 5000,
      })

      logger.success('BALL', 'Ball saved to database')
    } catch (err: any) {
      logger.error('BALL', 'Failed to save ball', err)
      toast.error(err.message || 'Failed to save ball')
      throw err
    }
  }


  async function handleInningsComplete(finalScore: number, finalWickets: number) {
  logger.info('INNINGS', 'Innings completed', {
    score: finalScore,
    wickets: finalWickets,
    currentInnings,
  })

  try {
    if (!match) throw new Error('Match not loaded')

    const teamToUpdate =
      match.batting_team === match.teamOne.name ? 'teamOne' : 'teamTwo'

    // ✅ Check if this is first or second innings
    if (currentInnings === 1) {
      // ✅ First innings complete - start second innings
      const target = finalScore + 1

      logger.info('INNINGS', 'First innings complete, setting target', {
        target,
      })

      // Swap teams
      const newBattingTeam = match.bowling_team!
      const newBowlingTeam = match.batting_team!

      await wait(1000)

      // Update match with target and reset for second innings
      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          target: target,
          scoringState: {
            selectedBatsman1: '',
            selectedBatsman2: '',
            selectedBowler: '',
            previousBowler: '',
            currentStriker: 'batsman1',
            currentOver: [],
            outBatsmen: [],
            currentInnings: 2,
          },
        },
        timeout: 5000,
      })

      logger.success('INNINGS', 'Target set, second innings ready')

      toast.success(`First innings complete! Target: ${target}`, {
        duration: 4000,
      })

      // Update local state
      setMatch({
        ...match,
        target: target,
        batting_team: newBattingTeam,
        bowling_team: newBowlingTeam,
      })

      // Reset for second innings
      setBatsman1('')
      setBatsman2('')
      setBowler('')
      setCurrentStriker('batsman1')
      setCurrentOver([])
      setOutBatsmen([])
      setPreviousBowler('')
      setScore(0)
      setWickets(0)
      setBalls(0)

      await wait(2000)

      // Show player selection for second innings
      setState('PLAYER_SELECTION')
      toast('Select opening batsmen and bowler for second innings')
    } else {
      // ✅ Second innings complete - match over
      logger.info('INNINGS', 'Second innings complete - match over')

      await wait(1000)

      // Determine winner
      const target = match.target || 0
      let winMessage = ''

      if (finalScore >= target) {
        const wicketsLeft = (battingTeam?.players.length || 10) - finalWickets
        winMessage = `${match.batting_team} won by ${wicketsLeft} wickets!`
      } else {
        const runDiff = target - 1 - finalScore
        winMessage = `${match.bowling_team} won by ${runDiff} runs!`
      }

      // Mark match as completed
      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          status: 'completed',
          scoringState: null, // Clear scoring state
        },
        timeout: 5000,
      })

      logger.success('MATCH', 'Match completed', { winner: winMessage })

      toast.success(winMessage, { duration: 5000 })

      await wait(3000)

      // Redirect to match details
      router.push(`/matches/${matchId}`)
    }
  } catch (err: any) {
    logger.error('INNINGS', 'Failed to handle innings end', err)
    toast.error(err.message || 'Failed to end innings')
  }
}


  async function handleBowlerChange(newBowler: string) {
    logger.info('BOWLER', 'Changing bowler', { from: bowler, to: newBowler })

    if (newBowler === previousBowler) {
      toast.error('Bowler cannot bowl consecutive overs!')
      return
    }

    try {
      setBowler(newBowler)
      setNeedsBowlerChange(false)

      await wait(500)

      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          scoringState: {
            selectedBatsman1: batsman1,
            selectedBatsman2: batsman2,
            selectedBowler: newBowler,
            previousBowler: bowler,
            currentStriker: currentStriker, // ✅ Preserve striker
            currentOver: [],
            outBatsmen: outBatsmen,
            currentInnings: 1,
          },
        },
        timeout: 5000,
      })

      logger.success('BOWLER', 'Bowler changed successfully')
      toast.success(`${newBowler} to bowl next over`)
    } catch (err: any) {
      logger.error('BOWLER', 'Failed to change bowler', err)
      toast.error(err.message || 'Failed to change bowler')
    }
  }

  async function handleBatsmanChange(newBatsman: string) {
    logger.info('BATSMAN', 'Changing batsman', {
      out: outBatsman,
      new: newBatsman,
      currentStriker,
      batsman1,
      batsman2,
    })

    try {
      // ✅ Calculate new values BEFORE setting state
      const newBatsman1 = currentStriker === 'batsman1' ? newBatsman : batsman1
      const newBatsman2 = currentStriker === 'batsman2' ? newBatsman : batsman2

      // ✅ Validation: Prevent duplicate
      if (newBatsman1 === newBatsman2) {
        logger.error('BATSMAN', 'Duplicate batsman detected!', {
          newBatsman1,
          newBatsman2,
        })
        toast.error('Error: Same player cannot bat in both positions!')
        return
      }

      logger.debug('BATSMAN', 'New lineup', {
        newBatsman1,
        newBatsman2,
      })

      // ✅ Update state
      setBatsman1(newBatsman1)
      setBatsman2(newBatsman2)
      setNeedsBatsmanChange(false)

      await wait(500)

      // ✅ Save with calculated values (not state variables)
      await apiCall(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: {
          scoringState: {
            selectedBatsman1: newBatsman1, // ✅ Use calculated value
            selectedBatsman2: newBatsman2, // ✅ Use calculated value
            selectedBowler: bowler,
            previousBowler: previousBowler,
            currentStriker: currentStriker,
            currentOver: currentOver,
            outBatsmen: outBatsmen,
            currentInnings: 1,
          },
        },
        timeout: 5000,
      })

      logger.success('BATSMAN', 'New batsman saved successfully', {
        savedBatsman1: newBatsman1,
        savedBatsman2: newBatsman2,
      })

      toast.success(`${newBatsman} is in to bat`)
    } catch (err: any) {
      logger.error('BATSMAN', 'Failed to change batsman', err)
      toast.error(err.message || 'Failed to change batsman')
    }
  }

  // Render states
  if (state === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match...</p>
        </div>
      </div>
    )
  }

  if (state === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={loadMatch} className="w-full">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  if (!match) return null

  const strikerName = currentStriker === 'batsman1' ? batsman1 : batsman2
  const nonStrikerName = currentStriker === 'batsman1' ? batsman2 : batsman1

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
                <span className="font-mono font-bold text-lg">
                  {match.matchCode}
                </span>
                {match.status === 'live' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <Circle className="h-3 w-3 fill-current animate-pulse" />
                    LIVE
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logger.downloadLogs()}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="p-4 mb-4 bg-gray-50">
              <div className="text-xs font-mono space-y-1">
                <div>
                  <strong>State:</strong> {state}
                </div>
                <div className={batsman1 === batsman2 ? 'text-red-600 font-bold' : ''}>
                  <strong>Batsman1:</strong> {batsman1 || 'none'}{' '}
                  {currentStriker === 'batsman1' && '(ON STRIKE)'}
                  {batsman1 === batsman2 && ' ⚠️ DUPLICATE!'}
                </div>
                <div className={batsman1 === batsman2 ? 'text-red-600 font-bold' : ''}>
                  <strong>Batsman2:</strong> {batsman2 || 'none'}{' '}
                  {currentStriker === 'batsman2' && '(ON STRIKE)'}
                  {batsman1 === batsman2 && ' ⚠️ DUPLICATE!'}
                </div>
                <div>
                  <strong>Bowler:</strong> {bowler || 'none'}
                </div>
                <div>
                  <strong>Score:</strong> {score}/{wickets} ({balls} balls)
                </div>
                <div>
                  <strong>Out:</strong> [{outBatsmen.join(', ')}]
                </div>
                <div>
                  <strong>Available:</strong> {getAvailableBatsmen().map(p => p.name).join(', ')}
                </div>
              </div>
            </Card>
          )}

          {/* Score Display */}
          {state === 'SCORING' && battingTeam && bowlingTeam && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">BATTING</h3>
                <h2 className="text-2xl font-bold mb-2">{battingTeam.name}</h2>
                <div className="text-4xl font-bold">
                  {score}/{wickets}
                </div>
                <p className="text-sm opacity-90 mt-2">
                  Overs: {Math.floor(balls / 6)}.{balls % 6}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">BOWLING</h3>
                <h2 className="text-2xl font-bold">{bowlingTeam.name}</h2>
              </Card>
            </div>
          )}

          {/* Render current state */}
          {state === 'TOSS' && (
            <TossForm
              teamOneName={match.teamOne.name}
              teamTwoName={match.teamTwo.name}
              onTossComplete={handleTossComplete}
            />
          )}

          {state === 'PLAYER_SELECTION' && battingTeam && bowlingTeam && (
            <PlayerSelectionForm
              battingTeamName={match.batting_team!}
              bowlingTeamName={match.bowling_team!}
              battingPlayers={battingTeam.players}
              bowlingPlayers={bowlingTeam.players}
              onPlayersSelected={handlePlayersSelected}
            />
          )}

          {/* ✅ Batsman Change (After Wicket) */}
          {state === 'SCORING' && needsBatsmanChange && battingTeam && (
            <BatsmanChangeForm
              availableBatsmen={getAvailableBatsmen()}
              outBatsman={outBatsman}
              onBatsmanSelected={handleBatsmanChange}
            />
          )}

          {/* ✅ Bowler Change (After Over) */}
          {state === 'SCORING' && needsBowlerChange && bowlingTeam && (
            <Card className="p-6 mb-6 border-2 border-blue-500">
              <h3 className="text-lg font-bold mb-2">🎯 Select New Bowler</h3>
              <p className="text-sm text-gray-600 mb-4">
                Over completed! Select the bowler for the next over.
              </p>

              {previousBowler && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ {previousBowler} cannot bowl consecutive overs
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {bowlingTeam.players
                  .filter((p) => p.name !== previousBowler)
                  .map((player, i) => (
                    <button
                      key={i}
                      onClick={() => handleBowlerChange(player.name)}
                      className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition text-left"
                    >
                      <span className="font-medium">{player.name}</span>
                      {player.is_captain && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          C
                        </span>
                      )}
                      {player.is_keeper && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          WK
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </Card>
          )}

          {/* ✅ Scoring Interface (Only when not changing players) */}
          {state === 'SCORING' &&
            !needsBowlerChange &&
            !needsBatsmanChange &&
            batsman1 &&
            batsman2 &&
            bowler && (
              <ScoringInterface
                striker={batsman1}
                nonStriker={batsman2}
                bowler={bowler}
                currentOver={currentOver}
                currentStriker={currentStriker}
                onBallRecorded={handleBallRecorded}
              />
            )}
        </div>
      </div>
    </>
  )
}