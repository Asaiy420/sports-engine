import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Match, Commentary, WsMessage } from '../types';
import { fetchMatches, fetchCommentary } from '../api/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { StatusBadge } from '../components/StatusBadge';
import { CommentaryItem } from '../components/CommentaryItem';
import { ConnectionDot } from '../components/ConnectionDot';

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);
  const [comments, setComments] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);

  const handleWsMessage = useCallback(
    (msg: WsMessage) => {
      if (msg.type === 'commentary' && msg.data.matchId === matchId) {
        setComments(prev => [msg.data, ...prev]);
      }
    },
    [matchId]
  );

  const { connected, subscribe, unsubscribe } = useWebSocket(handleWsMessage);

  // Subscribe to match commentary via WebSocket
  useEffect(() => {
    if (!connected || !matchId) return;
    subscribe(matchId);
    return () => unsubscribe(matchId);
  }, [connected, matchId, subscribe, unsubscribe]);

  // Fetch initial data
  useEffect(() => {
    if (!matchId) return;

    Promise.all([fetchMatches(), fetchCommentary(matchId)])
      .then(([matches, commentary]) => {
        const found = matches.find(m => m.id === matchId);
        if (found) setMatch(found);
        setComments(commentary);
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>Loading…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-2'>
        <p className='text-gray-500'>Match not found.</p>
        <Link to='/' className='text-sm text-blue-600 hover:underline'>
          ← Back to matches
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Link
        to='/'
        className='inline-flex items-center gap-2 rounded-full border border-(--line) bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-(--muted) transition hover:border-(--accent) hover:text-(--accent)'
      >
        ← All matches
      </Link>

      <div className='grid gap-6 lg:grid-cols-[1.2fr_1fr]'>
        <div className='space-y-6'>
          <div className='rounded-2xl border border-(--line) bg-white/90 p-6 shadow-sm'>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
              <span className='rounded-full border border-(--line) bg-(--chip) px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-(--muted)'>
                {match.sport}
              </span>
              <div className='flex items-center gap-3'>
                <ConnectionDot connected={connected} />
                <StatusBadge status={match.status} />
              </div>
            </div>

            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-4'>
              <div className='min-w-0 text-right'>
                <p className='text-sm uppercase tracking-[0.3em] text-(--muted)'>
                  Home
                </p>
                <p className='truncate text-2xl font-semibold text-(--ink)'>
                  {match.homeTeam}
                </p>
              </div>
              <div className='flex items-center gap-3 text-5xl font-semibold tabular-nums text-(--ink)'>
                <span>{match.homeScore}</span>
                <span className='text-(--line)'>–</span>
                <span>{match.awayScore}</span>
              </div>
              <div className='min-w-0 text-left'>
                <p className='text-sm uppercase tracking-[0.3em] text-(--muted)'>
                  Away
                </p>
                <p className='truncate text-2xl font-semibold text-(--ink)'>
                  {match.awayTeam}
                </p>
              </div>
            </div>

            <div className='mt-5 flex flex-wrap items-center gap-2 text-xs text-(--muted)'>
              <span className='rounded-full border border-(--line) bg-white px-3 py-1'>
                Kickoff {new Date(match.startTime).toLocaleString()}
              </span>
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl border border-(--line) bg-white/90 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-(--muted)'>
                Match status
              </p>
              <p className='mt-2 text-2xl font-semibold text-(--ink)'>
                {match.status === 'live' ? 'In play' : match.status}
              </p>
              <p className='mt-1 text-sm text-(--muted)'>
                Live stream powered commentary feed.
              </p>
            </div>
            <div className='rounded-2xl border border-(--line) bg-white/90 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-(--muted)'>
                Commentary
              </p>
              <p className='mt-2 text-2xl font-semibold text-(--ink)'>
                {comments.length}
              </p>
              <p className='mt-1 text-sm text-(--muted)'>
                Total updates captured.
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-(--line) bg-white/90 p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-(--ink)'>Commentary</h2>
            <span className='rounded-full border border-(--line) bg-(--chip) px-3 py-1 text-xs font-semibold text-(--muted)'>
              Live feed
            </span>
          </div>

          {comments.length === 0 ? (
            <p className='text-sm text-(--muted)'>No commentary yet.</p>
          ) : (
            <div className='flex flex-col gap-3'>
              {comments.map(c => (
                <CommentaryItem key={c.id} item={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
