export interface Player {
  name: string
  runs_scored: number
  balls_played: number
  dots: number
  fours: number
  sixes: number
  wickets: number
  balls_bowled: number
  runs_conceded: number
  maidens: number
  dot_balls: number
  is_captain: boolean
  is_keeper: boolean
  is_out: boolean
}

export interface Team {
  name: string
  players: Player[]
  total_score: number
  total_wickets: number
  total_balls: number
  extras: number
}

export interface Ball {
  ballNumber: number
  overNumber: number
  batsman: string
  bowler: string
  runs: number
  outcome: string
  isExtra: boolean
  isWicket: boolean
  timestamp: Date
}

export interface ScoringState {
  selectedBatsman1: string
  selectedBatsman2: string
  selectedBowler: string
  previousBowler: string // ✅ NEW: Track last over's bowler
  currentStriker: 'batsman1' | 'batsman2'
  currentOver: string[]
  outBatsmen: string[]
  currentInnings: number
  extraRuns: number
}

export type ScoringAction =
  | { type: 'SET_BATSMAN_1'; payload: string }
  | { type: 'SET_BATSMAN_2'; payload: string }
  | { type: 'SET_BOWLER'; payload: string }
  | { type: 'SET_STRIKER'; payload: 'batsman1' | 'batsman2' }
  | { type: 'ROTATE_STRIKE' }
  | { type: 'ADD_TO_CURRENT_OVER'; payload: string }
  | { type: 'COMPLETE_OVER' } // ✅ This will now save previous bowler
  | { type: 'WICKET'; payload: string }
  | { type: 'RESET_FOR_INNINGS' }
  | { type: 'SET_EXTRA_RUNS'; payload: number }
  | { type: 'RESTORE_STATE'; payload: ScoringState }

export interface Match {
  _id: string
  matchCode: string
  teamOne: Team
  teamTwo: Team
  status: 'upcoming' | 'live' | 'completed'
  toss_winner?: string
  toss_decision?: 'bat' | 'bowl'
  batting_team?: string
  bowling_team?: string
  target?: number
  overs: number
  scoringState?: ScoringState
  ballHistory: Ball[]
  createdBy: string
  admins: string[]
  scorers: string[]
  viewers: string[]
  createdAt: Date
  updatedAt: Date
}


export interface BallOutcome {
  runs: number
  isWicket: boolean
  isExtra: boolean
  ballCounts: boolean
  shouldRotateStrike: boolean
}