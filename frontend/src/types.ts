export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: 'scheduled' | 'live' | 'finished';
  startTime: string;
  endTime: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute: number;
  sequence: number;
  period: string | null;
  eventType: string | null;
  actor: string | null;
  team: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  tags: string[] | null;
  createdAt: string;
}

export type WsMessage =
  | { type: 'welcome' }
  | { type: 'match_created'; data: Match }
  | { type: 'commentary'; data: Commentary }
  | { type: 'subscribed'; matchId: number }
  | { type: 'unsubscribed'; matchId: number }
  | { type: 'error'; error: string };
