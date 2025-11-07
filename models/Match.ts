import mongoose, { Schema, Document, Model } from 'mongoose'
import { customAlphabet } from 'nanoid'

const generateMatchCode = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6
)

export interface IPlayer {
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

export interface ITeam {
  name: string
  players: IPlayer[]
  total_score: number
  total_wickets: number
  total_overs: number
  extras: number
  total_balls: number
}

export interface IBall {
  ballNumber: number
  overNumber: number
  innings: number
  batsman: string
  bowler: string
  runs: number
  outcome: string
  isExtra: boolean
  isWicket: boolean
  timestamp: Date
}

export interface IScoringState {
  selectedBatsman1: string
  selectedBatsman2: string
  selectedBowler: string
  currentStriker: 'batsman1' | 'batsman2'
  currentOver: string[]
  outBatsmen: string[]
  currentInnings: number
  extraRuns: number
  previousBowler:string
}

export interface IMatch extends Document {
  matchCode: string
  createdBy: mongoose.Types.ObjectId
  status: 'upcoming' | 'live' | 'completed'
  startTime: Date
  venue: string
  overs: number
  teamOne: ITeam
  teamTwo: ITeam
  toss_decision: string
  toss_winner: string
  isPrivate: boolean
  admins: mongoose.Types.ObjectId[]
  scorers: mongoose.Types.ObjectId[]
  viewers: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  batting_team: string
  bowling_team: string
  target: number
  currentInnings: number
  scoringState: IScoringState | null
  ballHistory: IBall[]
}

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  runs_scored: { type: Number, default: 0 },
  balls_played: { type: Number, default: 0 },
  dots: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  balls_bowled: { type: Number, default: 0 },
  runs_conceded: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  dot_balls: { type: Number, default: 0 },
  is_captain: { type: Boolean, default: false },
  is_keeper: { type: Boolean, default: false },
  is_out: { type: Boolean, default: false },
})

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: [playerSchema],
  total_score: { type: Number, default: 0 },
  total_wickets: { type: Number, default: 0 },
  total_overs: { type: Number, default: 0 },
  total_balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
})

const ballSchema = new mongoose.Schema(
  {
    ballNumber: { type: Number, required: true },
    overNumber: { type: Number, required: true },
    innings: { type: Number, required: true },
    batsman: { type: String, required: true },
    bowler: { type: String, required: true },
    runs: { type: Number, required: true },
    outcome: { type: String, required: true },
    isExtra: { type: Boolean, default: false },
    isWicket: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
)

const scoringStateSchema = new mongoose.Schema(
  {
    selectedBatsman1: { type: String, default: '' },
    selectedBatsman2: { type: String, default: '' },
    selectedBowler: { type: String, default: '' },
    previousBowler: { type: String, default: '' }, // ✅ NEW
    currentStriker: {
      type: String,
      enum: ['batsman1', 'batsman2'],
      default: 'batsman1',
    },
    currentOver: { type: [String], default: [] },
    outBatsmen: { type: [String], default: [] },
    currentInnings: { type: Number, default: 1 },
    extraRuns: { type: Number, default: 0 },
  },
  { _id: false }
)

// Rest of schema remains the same...
const matchSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    startTime: { type: Date, required: true },
    venue: { type: String, required: true },
    overs: { type: Number, required: true },

    teamOne: teamSchema,
    teamTwo: teamSchema,

    // ✅ VERIFY THESE EXIST
    toss_winner: { type: String, default: null },
    toss_decision: { type: String, default: null },
    batting_team: { type: String, default: null },
    bowling_team: { type: String, default: null },
    currentInnings: { type: Number, default: 1 },
    target: { type: Number, default: null },

    isPrivate: { type: Boolean, default: false },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scorers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    matchCode: { 
      type: String, 
      unique: true,
      default: () => generateMatchCode(),
    },

    // ✅ VERIFY THESE EXIST
    scoringState: {
      type: scoringStateSchema,
      default: null,
    },

    ballHistory: {
      type: [ballSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// ✅ Clear cached model
if (mongoose.models.Match) {
  delete mongoose.models.Match
}

const Match = mongoose.model<IMatch>('Match', matchSchema)

export default Match