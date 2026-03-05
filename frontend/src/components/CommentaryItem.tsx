import type { Commentary } from '../types';

const eventColors: Record<string, string> = {
  goal: 'border-[color:var(--accent)] bg-[#eef6f2]',
  yellow_card: 'border-[#d8a400] bg-[#fff7e6]',
  red_card: 'border-[#d64545] bg-[#fff0f0]',
  substitution: 'border-[#2c7edb] bg-[#eef4ff]',
};

export function CommentaryItem({ item }: { item: Commentary }) {
  const colorClass =
    (item.eventType && eventColors[item.eventType]) ??
    'border-gray-200 bg-white';

  return (
    <div
      className={`rounded-xl border border-l-4 px-4 py-3 ${colorClass} transition-all`}
    >
      <div className='mb-2 flex flex-wrap items-center gap-2 text-xs text-(--muted)'>
        {item.minute != null && (
          <span className='rounded-full border border-(--line) bg-white px-2 py-0.5 font-semibold text-(--ink)'>
            {item.minute}&apos;
          </span>
        )}
        {item.eventType && (
          <span className='rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--muted)'>
            {item.eventType.replace('_', ' ')}
          </span>
        )}
        {item.period && <span>· {item.period}</span>}
      </div>

      <p className='text-sm leading-6 text-(--ink)'>
        {item.message}
      </p>

      {item.actor && (
        <p className='mt-2 text-xs text-(--muted)'>
          {item.actor}
          {item.team ? ` (${item.team})` : ''}
        </p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-1'>
          {item.tags.map(tag => (
            <span
              key={tag}
              className='rounded-full border border-(--line) bg-white px-2 py-0.5 text-[10px] text-(--muted)'
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
