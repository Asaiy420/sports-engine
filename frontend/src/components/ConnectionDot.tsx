export function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span className='inline-flex items-center gap-2 rounded-full border border-(--line) bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-(--muted)'>
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          connected ? 'bg-(--accent)' : 'bg-[#d64545]'
        }`}
      />
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}
