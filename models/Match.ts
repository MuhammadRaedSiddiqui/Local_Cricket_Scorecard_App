import mongoose, { Schema, Document, Model } from 'mongoose';
import { customAlphabet } from 'nanoid';

const generateMatchCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export interface IPlayer {
  name: string;
  runs_scored: number;
  balls_played: number;
  fours: number;
  sixes: number;
  wickets: number;
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
  isPrivate: boolean;
  admins: mongoose.Types.ObjectId[];
  scorers: mongoose.Types.ObjectId[];
  viewers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  runs_scored: { type: Number, default: 0 },
  balls_played: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  is_captain: { type: Boolean, default: false },
  is_keeper: { type: Boolean, default: false },
  is_out: { type: Boolean, default: false }
});

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  players: [playerSchema],
  total_score: { type: Number, default: 0 },
  total_wickets: { type: Number, default: 0 },
  total_overs: { type: Number, default: 0 },
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
  isPrivate: {
    type: Boolean,
    default: false
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  scorers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Match = (mongoose.models.Match as Model<IMatch>) || mongoose.model<IMatch>('Match', matchSchema);

export default Match;