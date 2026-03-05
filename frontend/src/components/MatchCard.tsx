import { Link } from 'react-router-dom';
import type { Match } from '../types';
import { StatusBadge } from './StatusBadge';

export function MatchCard({ match }: { match: Match }) {
  const startDate = new Date(match.startTime).toLocaleString();

  return (
    <Link
      to={`/matches/${match.id}`}
      className='group block rounded-2xl border border-(--line) bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--accent) hover:shadow-lg'
    >
      <div className='mb-4 flex items-center justify-between'>
        <span className='rounded-full border border-(--line) bg-(--chip) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-(--muted)'>
          {match.sport}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
        <div className='min-w-0 text-right'>
          <p className='truncate text-sm font-semibold text-(--ink)'>
            {match.homeTeam}
          </p>
        </div>

        <div className='flex items-center gap-2 text-3xl font-semibold tabular-nums text-(--ink)'>
          <span>{match.homeScore}</span>
          <span className='text-(--line)'>–</span>
          <span>{match.awayScore}</span>
        </div>

        <div className='min-w-0 text-left'>
          <p className='truncate text-sm font-semibold text-(--ink)'>
            {match.awayTeam}
          </p>
        </div>
      </div>

      <div className='mt-4 flex items-center justify-between text-xs text-(--muted)'>
        <span>{startDate}</span>
        <span className='font-semibold text-(--accent) group-hover:text-(--accent-strong)'>
          View details →
        </span>
      </div>
    </Link>
  );
}
