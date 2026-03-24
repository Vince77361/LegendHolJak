export interface User {
  id: string;
  clerk_id: string;
  username: string;
  coins: number;
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  bet_amount: number;
  guess: 'odd' | 'even';
  secret_number: number;
  result: 'win' | 'loss';
  created_at: string;
}

export interface BetResult {
  secret_number: number;
  result: 'win' | 'loss';
  remaining_coins: number;
}

export interface RankingEntry {
  username: string;
  coins: number;
  rank: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
