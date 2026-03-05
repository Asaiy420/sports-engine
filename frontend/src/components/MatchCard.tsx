import { Link } from 'react-router-dom';
import type { Match } from '../types';
import { StatusBadge } from './StatusBadge';

export function MatchCard({ match }: { match: Match }) {
  const startDate = new Date(match.startTime).toLocaleString();

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {match.sport}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-semibold text-gray-900">
            {match.homeTeam}
          </p>
        </div>

        <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-gray-900">
          <span>{match.homeScore}</span>
          <span className="text-gray-300">–</span>
          <span>{match.awayScore}</span>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-gray-900">
            {match.awayTeam}
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">{startDate}</p>
    </Link>
  );
}
