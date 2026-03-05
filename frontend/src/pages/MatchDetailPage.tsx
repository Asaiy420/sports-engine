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
        setComments((prev) => [msg.data, ...prev]);
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
        const found = matches.find((m) => m.id === matchId);
        if (found) setMatch(found);
        setComments(commentary);
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-gray-500">Match not found.</p>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to matches
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ← All Matches
      </Link>

      {/* Scoreboard */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {match.sport}
          </span>
          <div className="flex items-center gap-3">
            <ConnectionDot connected={connected} />
            <StatusBadge status={match.status} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="min-w-0 flex-1 text-right">
            <p className="text-lg font-bold text-gray-900">{match.homeTeam}</p>
          </div>
          <div className="flex items-center gap-3 text-4xl font-extrabold tabular-nums text-gray-900">
            <span>{match.homeScore}</span>
            <span className="text-gray-300">–</span>
            <span>{match.awayScore}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-lg font-bold text-gray-900">{match.awayTeam}</p>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-gray-400">
          {new Date(match.startTime).toLocaleString()}
        </p>
      </div>

      {/* Commentary feed */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Commentary</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">No commentary yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <CommentaryItem key={c.id} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}
