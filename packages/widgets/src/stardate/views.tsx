import { useEffect, useState } from 'react';
import { formatStardate } from './stardate';

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function StardateMain() {
  const now = useNow(1000);
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-5xl tracking-tight text-lcars-orange tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-lg text-slate-300">
        {now.toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <p className="font-mono text-sm text-lcars-lavender">Stardate {formatStardate(now)}</p>
    </div>
  );
}

export function StardateCompact() {
  const now = useNow(1000 * 30);
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="font-mono text-2xl text-lcars-orange tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="font-mono text-xs text-lcars-lavender">SD {formatStardate(now)}</p>
    </div>
  );
}
