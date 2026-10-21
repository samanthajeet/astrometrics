import type {
  WatchlistItem,
  WatchlistKind,
  WatchlistStatus,
  WidgetManifest,
} from '@astrometrics/widget-sdk';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Db } from './db/client';
import { dashboards, fetchCache, watchlistItems, widgetInstances } from './db/schema';
import type { TmdbTitle } from './tmdb';

type Row = typeof watchlistItems.$inferSelect;

function toItem(row: Row): WatchlistItem {
  return {
    id: row.id,
    kind: row.kind,
    tmdbId: row.tmdbId,
    imdbId: row.imdbId,
    title: row.title,
    year: row.year,
    posterPath: row.posterPath,
    status: row.status,
    addedAt: row.addedAt.toISOString(),
  };
}

export function listWatchlist(db: Db, userId: string): WatchlistItem[] {
  return db
    .select()
    .from(watchlistItems)
    .where(eq(watchlistItems.userId, userId))
    .orderBy(desc(watchlistItems.addedAt))
    .all()
    .map(toItem);
}

export function findWatchlistItem(db: Db, userId: string, kind: WatchlistKind, tmdbId: number) {
  const row = db
    .select()
    .from(watchlistItems)
    .where(
      and(
        eq(watchlistItems.userId, userId),
        eq(watchlistItems.kind, kind),
        eq(watchlistItems.tmdbId, tmdbId),
      ),
    )
    .get();
  return row && toItem(row);
}

export function addWatchlistItem(
  db: Db,
  userId: string,
  item: { kind: WatchlistKind; tmdbId: number; status: WatchlistStatus } & TmdbTitle,
): WatchlistItem {
  const row = db
    .insert(watchlistItems)
    .values({ id: randomUUID(), userId, ...item })
    .returning()
    .get();
  return toItem(row);
}

export function setWatchlistStatus(
  db: Db,
  userId: string,
  id: string,
  status: WatchlistStatus,
): WatchlistItem | undefined {
  const row = db
    .update(watchlistItems)
    .set({ status })
    .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)))
    .returning()
    .get();
  return row && toItem(row);
}

export function removeWatchlistItem(db: Db, userId: string, id: string): boolean {
  const result = db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)))
    .run();
  return result.changes > 0;
}

/** Drops cached data for this user's widgets that read the watchlist, so they refetch. */
export function clearWatchlistCaches(
  db: Db,
  userId: string,
  manifests: Record<string, WidgetManifest>,
) {
  const types = Object.values(manifests)
    .filter((m) => m.reads?.includes('watchlist'))
    .map((m) => m.type);
  if (types.length === 0) return;

  const instanceIds = db
    .select({ id: widgetInstances.id })
    .from(widgetInstances)
    .innerJoin(dashboards, eq(widgetInstances.dashboardId, dashboards.id))
    .where(and(eq(dashboards.userId, userId), inArray(widgetInstances.type, types)));
  db.delete(fetchCache).where(inArray(fetchCache.widgetInstanceId, instanceIds)).run();
}
