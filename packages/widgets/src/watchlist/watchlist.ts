import type { WatchlistItem, WatchlistStatus } from '@astrometrics/widget-sdk';

const statusOrder: Record<WatchlistStatus, number> = { watching: 0, want: 1, done: 2 };

/** Watching first, then want, then done; newest first within each. */
export function byStatus(items: readonly WatchlistItem[]): WatchlistItem[] {
  return [...items].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status] || b.addedAt.localeCompare(a.addedAt),
  );
}

/** What the compact view lists: everything not yet watched, in status order. */
export function upNext(items: readonly WatchlistItem[]): WatchlistItem[] {
  return byStatus(items).filter((item) => item.status !== 'done');
}
