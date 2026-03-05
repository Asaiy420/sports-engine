import type { Match } from '../types';

const statusColors: Record<Match['status'], string> = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  live: 'bg-green-100 text-green-800',
  finished: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status }: { status: Match['status'] }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusColors[status]}`}
    >
      {status === 'live' ? '● LIVE' : status}
    </span>
  );
}
