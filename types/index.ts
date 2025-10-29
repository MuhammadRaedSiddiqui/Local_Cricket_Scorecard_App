export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdMatches: string[];
  joinedMatches: string[];
}

export interface Player {
  id?: string;
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

export interface Team {
  name: string;
  players: Player[];
  total_score: number;
  total_wickets: number;
  total_overs: number;
  extras: number;
}

export interface Match {
  id: string;
  matchCode: string;
  createdBy: string;
  status: 'upcoming' | 'live' | 'completed';
  teamOne: Team;
  teamTwo: Team;
  venue: string;
  startTime: Date;
  overs: number;
  currentInnings: number;
  batting_team: string;
  bowling_team: string;
  viewers: string[];
}

export interface ScoreUpdate {
  action: 'runs' | 'wicket' | 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  runs?: number;
  extras?: number;
  wicketType?: string;
}