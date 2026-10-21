import {
  watchlistKindLabels,
  watchlistStatusLabels,
  watchlistStatuses,
  type WatchlistKind,
} from '@astrometrics/widget-sdk';

export const statusOptions = watchlistStatuses.map((value) => ({
  value,
  label: watchlistStatusLabels[value],
}));

/** "Movie · 1994", or just "Show" when TMDB has no date. */
export function describeTitle(kind: WatchlistKind, year: number | null) {
  return year ? `${watchlistKindLabels[kind]} · ${year}` : watchlistKindLabels[kind];
}
