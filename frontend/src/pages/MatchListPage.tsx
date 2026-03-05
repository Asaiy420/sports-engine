import { useEffect, useState, useCallback } from 'react';
import type { Match, WsMessage } from '../types';
import { fetchMatches } from '../api/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { MatchCard } from '../components/MatchCard';
import { ConnectionDot } from '../components/ConnectionDot';

export function MatchListPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'match_created') {
      setMatches(prev => [msg.data, ...prev]);
    }
  }, []);

  const { connected } = useWebSocket(handleWsMessage);

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>Loading matches…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <section className='grid gap-6 rounded-2xl border border-(--line) bg-white/90 p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-(--muted)'>
            Live control room
          </p>
          <h1 className='text-3xl font-semibold text-(--ink)'>
            Track every match in real time.
          </h1>
          <p className='max-w-xl text-sm leading-6 text-(--muted)'>
            Stay locked on momentum swings, score changes, and breaking
            commentary across all active fixtures.
          </p>
        </div>
        <div className='flex flex-col justify-between gap-4 rounded-xl border border-(--line) bg-(--chip) p-5'>
          <div className='flex items-center justify-between text-sm font-semibold text-(--muted)'>
            <span>Connection</span>
            <ConnectionDot connected={connected} />
          </div>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-(--muted)'>
              Matches
            </p>
            <p className='text-3xl font-semibold text-(--ink)'>
              {matches.length}
            </p>
          </div>
          <div className='text-xs text-(--muted)'>
            Auto-refreshing as new fixtures land.
          </div>
        </div>
      </section>

      <section>
        <div className='mb-4 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-xl font-semibold text-(--ink)'>Matches</h2>
            <p className='text-sm text-(--muted)'>
              Monitor scores and status changes instantly.
            </p>
          </div>
          <span className='rounded-full border border-(--line) bg-white px-3 py-1 text-xs font-semibold text-(--muted)'>
            Showing {matches.length}
          </span>
        </div>

        {matches.length === 0 ? (
          <p className='text-center text-sm text-(--muted)'>No matches yet.</p>
        ) : (
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {matches.map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
