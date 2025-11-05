import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import debounce from 'lodash/debounce'
import { Match, ScoringState, ScoringAction, Ball } from '@/types/match'
import {
  validateBallUpdate,
  calculateBallOutcome,
} from '@/utils/scoringValidations'

const initialScoringState: ScoringState = {
  selectedBatsman1: '',
  selectedBatsman2: '',
  selectedBowler: '',
  previousBowler: '', // ✅ NEW
  currentStriker: 'batsman1',
  currentOver: [],
  outBatsmen: [],
  currentInnings: 1,
  extraRuns: 0,
}

const scoringReducer = (
  state: ScoringState,
  action: ScoringAction
): ScoringState => {
  switch (action.type) {
    case 'SET_BATSMAN_1':
      return { ...state, selectedBatsman1: action.payload }
    case 'SET_BATSMAN_2':
      return { ...state, selectedBatsman2: action.payload }
    case 'SET_BOWLER':
      return { ...state, selectedBowler: action.payload }
    case 'SET_STRIKER':
      return { ...state, currentStriker: action.payload }
    case 'ROTATE_STRIKE':
      return {
        ...state,
        currentStriker:
          state.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1',
      }
    case 'ADD_TO_CURRENT_OVER':
      return { ...state, currentOver: [...state.currentOver, action.payload] }
    case 'COMPLETE_OVER':
      // ✅ Save current bowler as previous, clear current bowler
      return {
        ...state,
        currentOver: [],
        previousBowler: state.selectedBowler, // ✅ NEW: Save current bowler
        selectedBowler: '', // Clear for new selection
        currentStriker:
          state.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1',
      }
    case 'WICKET':
      return {
        ...state,
        outBatsmen: [...state.outBatsmen, action.payload],
      }
    case 'RESET_FOR_INNINGS':
      return {
        ...initialScoringState,
        currentInnings: state.currentInnings + 1,
        outBatsmen: [],
      }
    case 'SET_EXTRA_RUNS':
      return { ...state, extraRuns: action.payload }
    case 'RESTORE_STATE':
      console.log('🔄 REDUCER: Restoring state to:', action.payload)
      return action.payload
    default:
      return state
  }
}


export const useMatchScoring = (matchId: string) => {
  const router = useRouter()
  const [scoringState, dispatch] = useReducer(
    scoringReducer,
    initialScoringState
  )

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [battingTeamName, setBattingTeamName] = useState('')
  const [bowlingTeamName, setBowlingTeamName] = useState('')
  const [ballHistory, setBallHistory] = useState<Ball[]>([])
  const [isStateRestored, setIsStateRestored] = useState(false)

  // ✅ Track if we should auto-save (prevent saving during restoration)
  const [shouldAutoSave, setShouldAutoSave] = useState(false)

  const saveToServer = useCallback(async (matchData: Match, currentScoringState: ScoringState, currentBallHistory: Ball[]) => {
    try {
      const token = localStorage.getItem('auth_token')

      const matchToSave = {
        ...matchData,
        scoringState: currentScoringState,
        ballHistory: currentBallHistory,
      }

      console.log('💾 Saving to server:', {
        striker: currentScoringState.currentStriker,
        batsman1: currentScoringState.selectedBatsman1,
        batsman2: currentScoringState.selectedBatsman2,
        bowler: currentScoringState.selectedBowler,
        currentOver: currentScoringState.currentOver,
      })

      // ✅ NEW: Log toss data
      console.log('🎲 Toss data being saved:', {
        toss_winner: matchToSave.toss_winner,
        toss_decision: matchToSave.toss_decision,
        batting_team: matchToSave.batting_team,
        bowling_team: matchToSave.bowling_team,
        status: matchToSave.status,
      })

      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ match: matchToSave }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      console.log('✅ Match saved successfully')
    } catch (err) {
      console.error('❌ Error saving match:', err)
      toast.error('Failed to save match state')
    }
  }, [matchId])

  // ✅ Debounced save
  const debouncedSave = useRef(
    debounce((matchData: Match, state: ScoringState, history: Ball[]) => {
      saveToServer(matchData, state, history)
    }, 1000)
  ).current

  // ✅ AUTO-SAVE: Save whenever scoringState or ballHistory changes (after restoration)
  useEffect(() => {
    if (match && shouldAutoSave && isStateRestored) {
      // ✅ ONLY auto-save if toss is completed
      if (match.toss_winner && match.batting_team) {
        console.log('🔄 Auto-saving due to state change...')
        debouncedSave(match, scoringState, ballHistory)
      } else {
        console.log('⏸️ Skipping auto-save - toss not completed yet')
      }
    }
  }, [scoringState, ballHistory, match, shouldAutoSave, isStateRestored, debouncedSave])

  const fetchMatch = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('🔍 Fetching match:', matchId)

      const response = await fetch(`/api/matches/${matchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        toast.error('Failed to load match')
        router.push(`/matches/${matchId}`)
        return
      }

      const data = await response.json()
      const matchData = data.data

      console.log('📦 Raw match data from API:', {
        toss_winner: matchData.toss_winner,
        batting_team: matchData.batting_team,
        bowling_team: matchData.bowling_team,
        scoringState: matchData.scoringState,
        status: matchData.status,
      })

      // Initialize team scores
      matchData.teamOne.total_score = matchData.teamOne.total_score || 0
      matchData.teamOne.total_wickets = matchData.teamOne.total_wickets || 0
      matchData.teamOne.total_balls = matchData.teamOne.total_balls || 0
      matchData.teamOne.extras = matchData.teamOne.extras || 0

      matchData.teamTwo.total_score = matchData.teamTwo.total_score || 0
      matchData.teamTwo.total_wickets = matchData.teamTwo.total_wickets || 0
      matchData.teamTwo.total_balls = matchData.teamTwo.total_balls || 0
      matchData.teamTwo.extras = matchData.teamTwo.extras || 0

      matchData.ballHistory = matchData.ballHistory || []

      setMatch(matchData)
      setBallHistory(matchData.ballHistory)

      // Restore state if match is in progress
      if (matchData.toss_winner && matchData.batting_team) {
        console.log('✅ Toss completed, restoring state...')

        setBattingTeamName(matchData.batting_team)
        setBowlingTeamName(matchData.bowling_team)

        if (matchData.scoringState) {
          console.log('📦 Found scoring state in DB:', matchData.scoringState)

          // Dispatch restoration
          dispatch({ type: 'RESTORE_STATE', payload: matchData.scoringState })

          setTimeout(() => {
            setIsStateRestored(true)
            setShouldAutoSave(true)

            if (
              matchData.scoringState.selectedBatsman1 &&
              matchData.scoringState.selectedBatsman2 &&
              matchData.scoringState.selectedBowler
            ) {
              toast.success('Resumed from where you left off!')
            }
          }, 0)
        } else {
          console.log('⚠️ No scoring state found in DB')
          setIsStateRestored(true)
          setShouldAutoSave(true)
        }
      } else {
        console.log('⚠️ Toss not completed yet')
        setIsStateRestored(true)
        setShouldAutoSave(true)
      }
    } catch (err) {
      toast.error('Failed to load match')
      console.error('❌ Fetch match error:', err)
      setIsStateRestored(true)
      setShouldAutoSave(true)
    } finally {
      setLoading(false)
    }
  }, [matchId, router])

  const getBattingTeam = useCallback(() => {
    if (!match || !battingTeamName) return null
    return battingTeamName === match.teamOne.name
      ? match.teamOne
      : match.teamTwo
  }, [match, battingTeamName])

  const getBowlingTeam = useCallback(() => {
    if (!match || !bowlingTeamName) return null
    return bowlingTeamName === match.teamOne.name
      ? match.teamOne
      : match.teamTwo
  }, [match, bowlingTeamName])

  // ✅ Immediate save function (for critical events like toss, innings end, match end)
  const saveImmediately = useCallback(
    async (updatedMatch: Match, currentState: ScoringState, currentHistory: Ball[]) => {
      await saveToServer(updatedMatch, currentState, currentHistory)
    },
    [saveToServer]
  )

  const recordBall = useCallback(
    async (outcome: string, providedExtraRuns?: number) => {
      if (!match) return

      const battingTeam = getBattingTeam()
      const bowlingTeam = getBowlingTeam()

      if (!battingTeam || !bowlingTeam) return

      const errors = validateBallUpdate(
        match,
        outcome,
        battingTeam,
        scoringState.currentInnings
      )

      if (errors.some((e) => e.type === 'error')) {
        toast.error(errors[0].message)
        return
      }

      const extraRunsToUse =
        providedExtraRuns !== undefined
          ? providedExtraRuns
          : scoringState.extraRuns

      const {
        runs,
        isWicket,
        isExtra,
        ballCounts,
        shouldRotateStrike,
      } = calculateBallOutcome(outcome, extraRunsToUse)

      const updatedMatch = { ...match }
      const teamToUpdate =
        battingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'

      updatedMatch[teamToUpdate].total_score += runs

      if (isExtra) {
        updatedMatch[teamToUpdate].extras += runs
      }

      if (ballCounts) {
        updatedMatch[teamToUpdate].total_balls += 1
      }

      const currentBatsman =
        scoringState.currentStriker === 'batsman1'
          ? scoringState.selectedBatsman1
          : scoringState.selectedBatsman2

      const ball: Ball = {
        ballNumber: updatedMatch[teamToUpdate].total_balls,
        overNumber:
          Math.floor(updatedMatch[teamToUpdate].total_balls / 6) + 1,
        batsman: currentBatsman,
        bowler: scoringState.selectedBowler,
        runs,
        outcome,
        isExtra,
        isWicket,
        timestamp: new Date(),
      }

      const newBallHistory = [...ballHistory, ball]
      setBallHistory(newBallHistory)

      if (isWicket) {
        updatedMatch[teamToUpdate].total_wickets += 1

        const newOutBatsmen = [...scoringState.outBatsmen, currentBatsman]
        const newCurrentOver = [...scoringState.currentOver, outcome]

        dispatch({ type: 'WICKET', payload: currentBatsman })
        dispatch({ type: 'ADD_TO_CURRENT_OVER', payload: outcome })

        const totalPlayers = battingTeam.players.length
        const wicketsDown = updatedMatch[teamToUpdate].total_wickets

        if (
          wicketsDown >= totalPlayers - 1 ||
          (totalPlayers === 2 && wicketsDown >= 1)
        ) {
          toast(`All out! ${battingTeam.name} innings complete`)
          handleInningsEnd(updatedMatch, newBallHistory)
          return
        }

        if (scoringState.currentStriker === 'batsman1') {
          dispatch({ type: 'SET_BATSMAN_1', payload: '' })
        } else {
          dispatch({ type: 'SET_BATSMAN_2', payload: '' })
        }

        toast('Select next batsman')
        setMatch(updatedMatch)
        // State will auto-save via useEffect
        return
      }

      // ✅ Add to current over FIRST
      dispatch({ type: 'ADD_TO_CURRENT_OVER', payload: outcome })

      const legalBallsInOver = [...scoringState.currentOver, outcome].filter(
        (b) => !['WD', 'NB'].includes(b)
      ).length

      if (legalBallsInOver === 6) {
        toast.success('Over completed!')
        dispatch({ type: 'COMPLETE_OVER' }) // ✅ This now handles previousBowler
        toast('Please select new bowler')
      } else if (shouldRotateStrike && !isWicket) {
        dispatch({ type: 'ROTATE_STRIKE' })
      }

      dispatch({ type: 'SET_EXTRA_RUNS', payload: 0 })

      const totalBalls = updatedMatch.overs * 6
      if (updatedMatch[teamToUpdate].total_balls >= totalBalls) {
        handleInningsEnd(updatedMatch, newBallHistory)
        return
      }

      if (scoringState.currentInnings === 2 && updatedMatch.target) {
        if (updatedMatch[teamToUpdate].total_score >= updatedMatch.target) {
          const wicketsLeft = 10 - updatedMatch[teamToUpdate].total_wickets
          toast.success(`${battingTeamName} won by ${wicketsLeft} wickets!`)
          updatedMatch.status = 'completed'

          setMatch(updatedMatch)

          await saveImmediately(updatedMatch, scoringState, newBallHistory)

          setTimeout(() => {
            router.push(`/matches/${matchId}`)
          }, 3000)
          return
        }
      }

      setMatch(updatedMatch)
      // Auto-save will trigger via useEffect
    },
    [
      match,
      scoringState,
      battingTeamName,
      bowlingTeamName,
      ballHistory,
      getBattingTeam,
      getBowlingTeam,
      matchId,
      router,
      saveImmediately,
    ]
  )

  const handleInningsEnd = async (
    updatedMatch: Match,
    newBallHistory: Ball[]
  ) => {
    if (scoringState.currentInnings === 1) {
      const teamToUpdate =
        battingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'
      updatedMatch.target = updatedMatch[teamToUpdate].total_score + 1

      toast.success(`First innings complete! Target: ${updatedMatch.target}`)

      setBattingTeamName(bowlingTeamName)
      setBowlingTeamName(battingTeamName)

      dispatch({ type: 'RESET_FOR_INNINGS' })

      setMatch(updatedMatch)

      // ✅ Immediate save for innings change
      const newState: ScoringState = {
        ...initialScoringState,
        currentInnings: 2,
      }

      await saveImmediately(updatedMatch, newState, newBallHistory)
    } else {
      updatedMatch.status = 'completed'

      const battingTeamData =
        battingTeamName === updatedMatch.teamOne.name
          ? updatedMatch.teamOne
          : updatedMatch.teamTwo

      if (battingTeamData.total_score < updatedMatch.target! - 1) {
        const runDiff = updatedMatch.target! - 1 - battingTeamData.total_score
        toast.success(`${bowlingTeamName} won by ${runDiff} runs!`)
      } else if (battingTeamData.total_score === updatedMatch.target! - 1) {
        toast.success('Match Tied!')
      }

      setMatch(updatedMatch)

      // ✅ Immediate save for match end
      await saveImmediately(updatedMatch, { ...scoringState, currentInnings: 2 }, newBallHistory)

      setTimeout(() => {
        router.push(`/matches/${matchId}`)
      }, 3000)
    }
  }

  const undoLastBall = useCallback(async () => {
    if (ballHistory.length === 0) {
      toast.error('Nothing to undo')
      return
    }

    const lastBall = ballHistory[ballHistory.length - 1]
    const updatedMatch = { ...match! }

    const teamToUpdate =
      battingTeamName === updatedMatch.teamOne.name ? 'teamOne' : 'teamTwo'

    updatedMatch[teamToUpdate].total_score -= lastBall.runs

    if (lastBall.isExtra) {
      updatedMatch[teamToUpdate].extras -= lastBall.runs
    }

    if (!['WD', 'NB'].includes(lastBall.outcome)) {
      updatedMatch[teamToUpdate].total_balls -= 1
    }

    if (lastBall.isWicket) {
      updatedMatch[teamToUpdate].total_wickets -= 1

      const newOutBatsmen = scoringState.outBatsmen.filter(
        (b) => b !== lastBall.batsman
      )

      if (scoringState.selectedBatsman1 === '') {
        dispatch({ type: 'SET_BATSMAN_1', payload: lastBall.batsman })
      } else if (scoringState.selectedBatsman2 === '') {
        dispatch({ type: 'SET_BATSMAN_2', payload: lastBall.batsman })
      }

      dispatch({
        type: 'RESTORE_STATE',
        payload: {
          ...scoringState,
          outBatsmen: newOutBatsmen,
        },
      })
    }

    const newBallHistory = ballHistory.slice(0, -1)
    setBallHistory(newBallHistory)

    const newCurrentOver = [...scoringState.currentOver]
    if (newCurrentOver.length > 0) {
      newCurrentOver.pop()
      dispatch({
        type: 'RESTORE_STATE',
        payload: { ...scoringState, currentOver: newCurrentOver },
      })
    }

    setMatch(updatedMatch)

    // ✅ Immediate save for undo
    await saveImmediately(updatedMatch, scoringState, newBallHistory)

    toast.success('Last ball undone')
  }, [ballHistory, match, battingTeamName, scoringState, saveImmediately])

  const updateMatch = useCallback((updates: Partial<Match>) => {
  if (!match) return null
  
  const updatedMatch = { ...match, ...updates }
  setMatch(updatedMatch)
  return updatedMatch
}, [match])


  return {
    match,
    loading,
    scoringState,
    dispatch,
    battingTeamName,
    setBattingTeamName,
    bowlingTeamName,
    setBowlingTeamName,
    getBattingTeam,
    getBowlingTeam,
    recordBall,
    undoLastBall,
    fetchMatch,
    ballHistory,
    isStateRestored,
    saveImmediately,
    updateMatch
  }
}