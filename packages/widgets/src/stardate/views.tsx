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

const eyebrow = 'font-mono text-[11px] font-semibold tracking-[0.14em] uppercase';

export function StardateMain() {
  const now = useNow(1000);
  return (
    <div className="@container">
      <div className="grid gap-5 @2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="chamfer flex min-h-48 flex-col justify-between gap-4 rounded-[calc(var(--am-radius-card)-6px)] bg-accent px-6 py-5 text-on-accent [--am-notch:28px]">
          <p className={eyebrow}>Local time</p>
          <p className="font-mono text-5xl leading-none font-semibold tracking-tight whitespace-nowrap tabular-nums @md:text-6xl">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="font-semibold">
            {now.toLocaleDateString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-1">
          <p className={`${eyebrow} text-muted`}>Stardate</p>
          <p className="font-mono text-3xl font-semibold tracking-tight text-fg tabular-nums">
            {formatStardate(now)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StardateCompact() {
  const now = useNow(1000 * 30);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-mono text-[44px] leading-none font-semibold tracking-tight text-fg tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-sm text-muted">
        {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
      <span className="inline-flex h-[26px] w-fit items-center rounded-[calc(var(--am-radius-chip)-2px)] bg-accent px-2 font-mono text-xs font-bold text-on-accent tabular-nums">
        SD {formatStardate(now)}
      </span>
    </div>
  );
}
