// --- Interfaces for Dashboard Data ---

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MatchData {
  _id: string;
  matchCode: string;
  status: 'upcoming' | 'live' | 'completed'; // Made status more specific
  venue: string;
  startTime: string;
  overs: number;
  teamOne: {
    name: string;
    total_score: number;
    total_wickets: number;
    total_balls: number;
    overs: string;
  };
  teamTwo: {
    name: string;
    total_score: number;
    total_wickets: number;
    total_balls: number;
    overs: string;
  };
  isPrivate: boolean;
  createdAt: string;
  target?: number;
}

export interface DashboardData {
  user: User | null;
  myMatches: MatchData[];
  invitedMatches: MatchData[];
  totalMatches: number;
  liveMatches: number;
}