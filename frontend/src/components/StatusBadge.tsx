import type { Match } from '../types';

const statusColors: Record<Match['status'], string> = {
  scheduled: 'border-[#e2b34b] bg-[#fff7e6] text-[#8a5b00]',
  live: 'border-[color:var(--accent)] bg-[#ecf6f2] text-[color:var(--accent-strong)]',
  finished: 'border-[color:var(--line)] bg-white text-[color:var(--muted)]',
};

export function StatusBadge({ status }: { status: Match['status'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${statusColors[status]}`}
    >
      <span className='h-1.5 w-1.5 rounded-full bg-current' />
      {status === 'live' ? 'Live' : status}
    </span>
  );
}
