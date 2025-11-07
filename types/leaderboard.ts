// FILE: types/index.ts

// ... (your existing User, Player, Team, Match interfaces) ...

// --- ADD THESE NEW INTERFACES ---

export interface BattingStats {
  name: string;
  matches: number;
  innings: number;
  runs: number;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  highScore: number;
}

export interface BowlingStats {
  name: string;
  matches: number;
  wickets: number;
  bestBowling: number; // This is a simplified field from your API
  overs: string;
  economy: number;
  average: number;
}

export interface TeamStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalRuns: number;
  averageScore: number;
  highestScore: number;
  totalWickets: number;
}