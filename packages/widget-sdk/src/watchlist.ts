export const watchlistKinds = ['movie', 'tv'] as const;
export type WatchlistKind = (typeof watchlistKinds)[number];

export const watchlistStatuses = ['want', 'watching', 'done'] as const;
export type WatchlistStatus = (typeof watchlistStatuses)[number];

export interface WatchlistItem {
  id: string;
  kind: WatchlistKind;
  /** Movie and TV ids are separate sequences on TMDB, so an item is identified by both. */
  tmdbId: number;
  imdbId: string | null;
  title: string;
  year: number | null;
  posterPath: string | null;
  status: WatchlistStatus;
  addedAt: string;
}
