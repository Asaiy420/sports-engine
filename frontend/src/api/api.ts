import type { Match, Commentary } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchMatches(limit = 50): Promise<Match[]> {
  const res = await fetch(`${BASE}/matches?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  const json = await res.json();
  return json.data;
}

export async function fetchCommentary(
  matchId: number,
  limit = 100
): Promise<Commentary[]> {
  const res = await fetch(
    `${BASE}/matches/${matchId}/commentary?limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch commentary');
  const json = await res.json();
  return json.results;
}
