import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const generateMatchCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

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
  
  // Toss and match state fields
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
  matchCode: { type: String, unique: true, default: () => generateMatchCode() },
}, {
  timestamps: true,
  strict: false
});

export default mongoose.models.Match || mongoose.model('Match', matchSchema);