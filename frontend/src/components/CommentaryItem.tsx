import type { Commentary } from '../types';

const eventColors: Record<string, string> = {
  goal: 'border-green-500 bg-green-50',
  yellow_card: 'border-yellow-400 bg-yellow-50',
  red_card: 'border-red-500 bg-red-50',
  substitution: 'border-blue-400 bg-blue-50',
};

export function CommentaryItem({ item }: { item: Commentary }) {
  const colorClass =
    (item.eventType && eventColors[item.eventType]) ??
    'border-gray-200 bg-white';

  return (
    <div
      className={`rounded-lg border-l-4 px-4 py-3 ${colorClass} transition-all`}
    >
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        {item.minute != null && (
          <span className="font-bold text-gray-700">{item.minute}&apos;</span>
        )}
        {item.eventType && (
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
            {item.eventType.replace('_', ' ')}
          </span>
        )}
        {item.period && <span>· {item.period}</span>}
      </div>

      <p className="text-sm text-gray-800">{item.message}</p>

      {item.actor && (
        <p className="mt-1 text-xs text-gray-500">
          {item.actor}
          {item.team ? ` (${item.team})` : ''}
        </p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
