import type {
  TitleDetails,
  TitleSearchResult,
  WatchlistKind,
  WidgetContext,
} from '@astrometrics/widget-sdk';
import { z } from 'zod';

const API = 'https://api.themoviedb.org/3';

export interface TmdbTitle {
  title: string;
  year: number | null;
  posterPath: string | null;
  imdbId: string | null;
}

export class TmdbNotFoundError extends Error {}

const shared = {
  poster_path: z.string().nullish(),
  overview: z.string().nullish(),
  tagline: z.string().nullish(),
  genres: z.array(z.object({ name: z.string() })).nullish(),
  status: z.string().nullish(),
};

const movieSchema = z.object({
  ...shared,
  title: z.string(),
  release_date: z.string().nullish(),
  imdb_id: z.string().nullish(),
  runtime: z.number().nullish(),
});

const tvSchema = z.object({
  ...shared,
  name: z.string(),
  first_air_date: z.string().nullish(),
  external_ids: z.object({ imdb_id: z.string().nullish() }).nullish(),
  episode_run_time: z.array(z.number()).nullish(),
  number_of_seasons: z.number().nullish(),
  number_of_episodes: z.number().nullish(),
});

const searchSchema = z.object({
  results: z.array(
    z.looseObject({
      id: z.number(),
      media_type: z.string(),
      title: z.string().nullish(),
      name: z.string().nullish(),
      release_date: z.string().nullish(),
      first_air_date: z.string().nullish(),
      poster_path: z.string().nullish(),
      overview: z.string().nullish(),
    }),
  ),
});

function yearOf(date: string | null | undefined): number | null {
  const year = Number(date?.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

export type TmdbSearchResult = Omit<TitleSearchResult, 'onWatchlist'>;

/** Movies and shows matching `query`. TMDB's multi search also returns people, which are dropped. */
export async function searchTmdb(
  ctx: Pick<WidgetContext, 'request'>,
  query: string,
): Promise<TmdbSearchResult[]> {
  const url = new URL(`${API}/search/multi`);
  url.searchParams.set('query', query);
  url.searchParams.set('include_adult', 'false');
  const res = await ctx.request('tmdb', url.toString());
  if (!res.ok) throw new Error(`TMDB responded with ${res.status}.`);
  const { results } = searchSchema.parse(await res.json());

  return results.flatMap((r): TmdbSearchResult[] => {
    if (r.media_type !== 'movie' && r.media_type !== 'tv') return [];
    const title = r.media_type === 'movie' ? r.title : r.name;
    if (!title) return [];
    return [
      {
        kind: r.media_type,
        tmdbId: r.id,
        title,
        year: yearOf(r.media_type === 'movie' ? r.release_date : r.first_air_date),
        posterPath: r.poster_path ?? null,
        overview: r.overview || null,
      },
    ];
  });
}

/** A title's TMDB record: what the watchlist stores, plus what the details view shows. */
export async function fetchTmdbRecord(
  ctx: Pick<WidgetContext, 'request'>,
  kind: WatchlistKind,
  tmdbId: number,
): Promise<{ title: TmdbTitle; details: TitleDetails }> {
  const url =
    kind === 'movie'
      ? `${API}/movie/${tmdbId}`
      : `${API}/tv/${tmdbId}?append_to_response=external_ids`;
  const res = await ctx.request('tmdb', url);
  if (res.status === 404) throw new TmdbNotFoundError(`TMDB has no ${kind} ${tmdbId}.`);
  if (!res.ok) throw new Error(`TMDB responded with ${res.status}.`);
  const body: unknown = await res.json();

  const common = (r: z.infer<typeof movieSchema> | z.infer<typeof tvSchema>) => ({
    overview: r.overview || null,
    tagline: r.tagline || null,
    genres: r.genres?.map((g) => g.name) ?? [],
    status: r.status || null,
  });

  if (kind === 'movie') {
    const movie = movieSchema.parse(body);
    return {
      title: {
        title: movie.title,
        year: yearOf(movie.release_date),
        posterPath: movie.poster_path ?? null,
        imdbId: movie.imdb_id || null,
      },
      details: {
        ...common(movie),
        date: movie.release_date || null,
        runtimeMinutes: movie.runtime || null,
        seasons: null,
        episodes: null,
      },
    };
  }
  const show = tvSchema.parse(body);
  return {
    title: {
      title: show.name,
      year: yearOf(show.first_air_date),
      posterPath: show.poster_path ?? null,
      imdbId: show.external_ids?.imdb_id || null,
    },
    details: {
      ...common(show),
      date: show.first_air_date || null,
      runtimeMinutes: show.episode_run_time?.[0] ?? null,
      seasons: show.number_of_seasons ?? null,
      episodes: show.number_of_episodes ?? null,
    },
  };
}
