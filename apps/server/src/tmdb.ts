import type { WatchlistKind, WidgetContext } from '@astrometrics/widget-sdk';
import { z } from 'zod';

const API = 'https://api.themoviedb.org/3';

export interface TmdbTitle {
  title: string;
  year: number | null;
  posterPath: string | null;
  imdbId: string | null;
}

export class TmdbNotFoundError extends Error {}

const movieSchema = z.object({
  title: z.string(),
  release_date: z.string().nullish(),
  poster_path: z.string().nullish(),
  imdb_id: z.string().nullish(),
});

const tvSchema = z.object({
  name: z.string(),
  first_air_date: z.string().nullish(),
  poster_path: z.string().nullish(),
  external_ids: z.object({ imdb_id: z.string().nullish() }).nullish(),
});

function yearOf(date: string | null | undefined): number | null {
  const year = Number(date?.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

/** Looks a title up on TMDB, so the watchlist stores TMDB's details rather than the client's. */
export async function fetchTmdbTitle(
  ctx: Pick<WidgetContext, 'request'>,
  kind: WatchlistKind,
  tmdbId: number,
): Promise<TmdbTitle> {
  const url =
    kind === 'movie'
      ? `${API}/movie/${tmdbId}`
      : `${API}/tv/${tmdbId}?append_to_response=external_ids`;
  const res = await ctx.request('tmdb', url);
  if (res.status === 404) throw new TmdbNotFoundError(`TMDB has no ${kind} ${tmdbId}.`);
  if (!res.ok) throw new Error(`TMDB responded with ${res.status}.`);
  const body: unknown = await res.json();

  if (kind === 'movie') {
    const movie = movieSchema.parse(body);
    return {
      title: movie.title,
      year: yearOf(movie.release_date),
      posterPath: movie.poster_path ?? null,
      imdbId: movie.imdb_id || null,
    };
  }
  const show = tvSchema.parse(body);
  return {
    title: show.name,
    year: yearOf(show.first_air_date),
    posterPath: show.poster_path ?? null,
    imdbId: show.external_ids?.imdb_id || null,
  };
}
