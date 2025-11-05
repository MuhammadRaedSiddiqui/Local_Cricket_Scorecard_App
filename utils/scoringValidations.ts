import { Match, Team } from '@/types/match'

export interface ValidationError {
  message: string
  type: 'error' | 'warning'
}

export const validateBallUpdate = (
  match: Match,
  outcome: string,
  battingTeam: Team | null,
  currentInnings: number
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!battingTeam) {
    errors.push({ message: 'Batting team not found', type: 'error' })
    return errors
  }

  // Can't exceed total overs
  const maxBalls = match.overs * 6
  if (
    battingTeam.total_balls >= maxBalls &&
    !['WD', 'NB'].includes(outcome)
  ) {
    errors.push({ message: 'Innings already complete', type: 'error' })
  }

  // All out check
  const totalPlayers = battingTeam.players.length
  if (battingTeam.total_wickets >= totalPlayers - 1) {
    errors.push({ message: 'Team is already all out', type: 'error' })
  }

  // Target already achieved
  if (currentInnings === 2 && match.target) {
    if (battingTeam.total_score >= match.target) {
      errors.push({ message: 'Target already achieved', type: 'error' })
    }
  }

  return errors
}

export const validatePlayerSelection = (
  batsman1: string,
  batsman2: string,
  bowler: string
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!batsman1 || !batsman2 || !bowler) {
    errors.push({
      message: 'Please select both batsmen and bowler',
      type: 'error',
    })
  }

  if (batsman1 === batsman2 && batsman1 !== '') {
    errors.push({
      message: 'Please select different batsmen',
      type: 'error',
    })
  }

  return errors
}

export const calculateBallOutcome = (
  outcome: string,
  extraRuns: number
): {
  runs: number
  isWicket: boolean
  isExtra: boolean
  ballCounts: boolean
  shouldRotateStrike: boolean
} => {
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
      // ✅ FIX: 1 (penalty) + extraRuns (batsmen ran)
      runs = 1 + extraRuns
      isExtra = true
      ballCounts = false
      shouldRotateStrike = extraRuns % 2 === 1 // ✅ Rotate if odd runs taken
      break
    case 'NB':
      // ✅ FIX: 1 (penalty) + extraRuns (batsmen ran/hit)
      runs = 1 + extraRuns
      isExtra = true
      ballCounts = false
      shouldRotateStrike = extraRuns % 2 === 1 // ✅ Rotate if odd runs taken
      break
    case 'B':
    case 'LB':
      // ✅ FIX: Only the runs batsmen took
      runs = extraRuns
      isExtra = true
      shouldRotateStrike = runs % 2 === 1
      break
  }

  return { runs, isWicket, isExtra, ballCounts, shouldRotateStrike }
}