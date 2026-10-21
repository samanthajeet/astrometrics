export const watchlistKinds = ['movie', 'tv'] as const;
export type WatchlistKind = (typeof watchlistKinds)[number];

export const watchlistKindLabels: Record<WatchlistKind, string> = { movie: 'Movie', tv: 'Show' };

export const watchlistStatuses = ['want', 'watching', 'done'] as const;
export type WatchlistStatus = (typeof watchlistStatuses)[number];

/** What people see. The stored value stays `want`; only the label reads "To watch". */
export const watchlistStatusLabels: Record<WatchlistStatus, string> = {
  want: 'To watch',
  watching: 'Watching',
  done: 'Done',
};

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

export interface TitleSearchResult {
  kind: WatchlistKind;
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  overview: string | null;
  /** The matching watchlist item, when the title is already on it. */
  onWatchlist: Pick<WatchlistItem, 'id' | 'status'> | null;
}

/** TMDB's details for a title, fetched when its details are opened rather than stored. */
export interface TitleDetails {
  overview: string | null;
  tagline: string | null;
  genres: string[];
  /** Release date for a movie, first air date for a show (YYYY-MM-DD). */
  date: string | null;
  /** A movie's runtime, or a show's typical episode length. */
  runtimeMinutes: number | null;
  seasons: number | null;
  episodes: number | null;
  /** TMDB's status, e.g. "Released" or "Returning Series". */
  status: string | null;
}

/** A TMDB image URL. `posterPath` comes from TMDB and starts with a slash. */
export function tmdbImageUrl(posterPath: string, width: 'w92' | 'w185' | 'w342' = 'w185') {
  return `https://image.tmdb.org/t/p/${width}${posterPath}`;
}
