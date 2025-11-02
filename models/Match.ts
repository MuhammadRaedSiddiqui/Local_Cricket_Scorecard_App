import mongoose, { Schema, Document, Model } from 'mongoose';
import { customAlphabet } from 'nanoid';

const generateMatchCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export interface IPlayer {
  name: string;
  runs_scored: number;
  balls_played: number;
  dots: number;
  fours: number;
  sixes: number;
  wickets: number;
  balls_bowled: number;
  runs_conceded: number;
  maidens: number;
  dot_balls: number;
  is_captain: boolean;
  is_keeper: boolean;
  is_out: boolean;
}

export interface ITeam {
  name: string;
  players: IPlayer[];
  total_score: number;
  total_wickets: number;
  total_overs: number;
  extras: number;
  total_balls: number;
}

export interface IMatch extends Document {
  matchCode: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'upcoming' | 'live' | 'completed';
  startTime: Date;
  venue: string;
  overs: number;
  teamOne: ITeam;
  teamTwo: ITeam;
  toss_decision: string;
  toss_winner: string;
  isPrivate: boolean;
  admins: mongoose.Types.ObjectId[];
  scorers: mongoose.Types.ObjectId[];
  viewers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  batting_team: string;
  bowling_team: string;
  target: Number;
  currentInnings: Number;
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
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: [playerSchema],
  total_score: { type: Number, default: 0 },
  total_wickets: { type: Number, default: 0 },
  total_overs: { type: Number, default: 0 },
  total_balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
});

const matchSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  startTime: { type: Date, required: true },
  venue: { type: String, required: true },
  overs: { type: Number, required: true },

  teamOne: teamSchema,
  teamTwo: teamSchema,

  // 🔥 ADD THESE FIELDS IF MISSING
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
  matchCode: { type: String, unique: true, required: true },
  scoringState: {
    type: {
      selectedBatsman1: String,
      selectedBatsman2: String,
      selectedBowler: String,
      currentStriker: {
        type: String,
        enum: ['batsman1', 'batsman2']
      },
      currentOver: [String],
      outBatsmen: [String],
      currentInnings: {
        type: Number,
        default: 1
      },
      extraRuns: {
        type: Number,
        default: 0
      }
    },
    default: null
  }

}, {
  timestamps: true,
  strict: false  // 🔥 ADD THIS to allow fields not in schema
});


const Match = (mongoose.models.Match as Model<IMatch>) || mongoose.model<IMatch>('Match', matchSchema);

export default Match;