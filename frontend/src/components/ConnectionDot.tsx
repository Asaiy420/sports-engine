export function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span className='flex items-center gap-1.5 text-xs'>
      <span
        className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
      />
      {connected ? 'Live' : 'Disconnected'}
    </span>
  );
}
