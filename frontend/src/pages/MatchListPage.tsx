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
      setMatches((prev) => [msg.data, ...prev]);
    }
  }, []);

  const { connected } = useWebSocket(handleWsMessage);

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading matches…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <ConnectionDot connected={connected} />
      </div>

      {matches.length === 0 ? (
        <p className="text-center text-gray-400">No matches yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
