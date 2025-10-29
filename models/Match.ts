import mongoose, { Document, Schema } from 'mongoose';
import { customAlphabet } from 'nanoid';

// Generate 6 character match codes
const generateMatchCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export interface IPlayer {
  userId?: mongoose.Types.ObjectId;
  name: string;
  runs_scored: number;
  balls_played: number;
  fours: number;
  sixes: number;
  dots: number;
  singles: number;
  doubles: number;
  triples: number;
  balls_bowled: number;
  wickets: number;
  runs_conceded: number;
  maidens: number;
  is_captain: boolean;
  is_keeper: boolean;
  is_out: boolean;
  dismissal_type?: string;
  dismissed_by?: string;
}

export interface ITeam {
  name: string;
  players: IPlayer[];
  captain?: string;
  keeper?: string;
  total_score: number;
  total_wickets: number;
  total_overs: number;
  total_balls: number;
  extras: number;
}

export interface IMatch extends Document {
  matchCode: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'upcoming' | 'live' | 'completed';
  startTime: Date;
  endTime?: Date;
  venue: string;
  overs: number;
  teamOne: ITeam;
  teamTwo: ITeam;
  toss: {
    winner?: string;
    decision?: 'bat' | 'bowl';
  };
  currentInnings: number;
  batting_team: string;
  bowling_team: string;
  striker?: IPlayer;
  non_striker?: IPlayer;
  current_bowler?: IPlayer;
  last_bowler?: IPlayer;
  over_timeline: string[];
  current_over: string[];
  target: number;
  result?: string;
  viewers: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  scorers: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<IPlayer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  runs_scored: { type: Number, default: 0 },
  balls_played: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  dots: { type: Number, default: 0 },
  singles: { type: Number, default: 0 },
  doubles: { type: Number, default: 0 },
  triples: { type: Number, default: 0 },
  balls_bowled: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  runs_conceded: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  is_captain: { type: Boolean, default: false },
  is_keeper: { type: Boolean, default: false },
  is_out: { type: Boolean, default: false },
  dismissal_type: String,
  dismissed_by: String
});

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  players: [playerSchema],
  captain: String,
  keeper: String,
  total_score: { type: Number, default: 0 },
  total_wickets: { type: Number, default: 0 },
  total_overs: { type: Number, default: 0 },
  total_balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 }
});

const matchSchema = new Schema<IMatch>({
  matchCode: {
    type: String,
    unique: true,
    default: () => generateMatchCode()
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  venue: {
    type: String,
    required: true
  },
  overs: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  teamOne: teamSchema,
  teamTwo: teamSchema,
  toss: {
    winner: String,
    decision: {
      type: String,
      enum: ['bat', 'bowl']
    }
  },
  currentInnings: {
    type: Number,
    default: 1
  },
  batting_team: String,
  bowling_team: String,
  striker: playerSchema,
  non_striker: playerSchema,
  current_bowler: playerSchema,
  last_bowler: playerSchema,
  over_timeline: [String],
  current_over: [String],
  target: {
    type: Number,
    default: 0
  },
  result: String,
  viewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  scorers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
matchSchema.index({ matchCode: 1 });
matchSchema.index({ createdBy: 1, status: 1 });
matchSchema.index({ status: 1, startTime: -1 });

export default mongoose.model<IMatch>('Match', matchSchema);