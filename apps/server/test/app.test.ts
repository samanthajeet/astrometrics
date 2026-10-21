import { defineManifest, defineServerWidget } from '@astrometrics/widget-sdk';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createApp } from '../src/app';
import { MemoryCredentialStore } from '../src/credentials/store';
import { openDatabase } from '../src/db/client';

const HOST = '127.0.0.1:4317';

interface WidgetRow {
  id: string;
  type: string;
  column: string;
  position: number;
}

const json = <T>(res: Response) => res.json() as Promise<T>;

const echoManifest = defineManifest({
  type: 'echo',
  name: 'Echo',
  description: 'Test widget',
  credentials: ['tmdb'],
  settingsSchema: z.object({ path: z.string() }),
  defaultSettings: { path: '/3/configuration' },
  refreshMs: 60_000,
  platforms: ['web'],
});

const echoWidget = defineServerWidget({
  manifest: echoManifest,
  async fetch(ctx, settings) {
    const res = await ctx.request('tmdb', `https://api.themoviedb.org${settings.path}`);
    return { status: res.status };
  },
});

const readerManifest = defineManifest({
  type: 'reader',
  name: 'Reader',
  description: 'Test widget that reads the watchlist',
  credentials: [],
  reads: ['watchlist'],
  settingsSchema: z.object({}),
  defaultSettings: {},
  refreshMs: 60_000,
  platforms: ['web'],
});

const readerWidget = defineServerWidget({
  manifest: readerManifest,
  async fetch(ctx) {
    return (await ctx.watchlist()).map((item) => item.title);
  },
});

function setup() {
  const credentials = new MemoryCredentialStore();
  const upstream = vi.fn<typeof fetch>(async () => new Response('{}', { status: 200 }));
  let clock = new Date('2026-10-20T12:00:00Z');
  const app = createApp({
    db: openDatabase(':memory:'),
    credentials,
    manifests: { echo: echoManifest, reader: readerManifest },
    serverWidgets: { echo: echoWidget, reader: readerWidget },
    fetch: upstream,
    allowedHosts: [HOST],
    allowedOrigins: ['http://localhost:5173'],
    now: () => clock,
  });

  const call = (path: string, init: RequestInit = {}) =>
    app.request(path, {
      ...init,
      headers: {
        host: HOST,
        'x-astrometrics': '1',
        'content-type': 'application/json',
        ...init.headers,
      },
    });

  return {
    app,
    call,
    credentials,
    upstream,
    advance: (ms: number) => (clock = new Date(clock.getTime() + ms)),
  };
}

describe('local-only guard', () => {
  it('rejects a foreign Host header', async () => {
    const { call } = setup();
    const res = await call('/api/health', { headers: { host: 'evil.example:4317' } });
    expect(res.status).toBe(403);
  });

  it('rejects a foreign Origin', async () => {
    const { call } = setup();
    const res = await call('/api/health', { headers: { origin: 'https://evil.example' } });
    expect(res.status).toBe(403);
  });

  it('rejects API calls without the custom header', async () => {
    const { app } = setup();
    const res = await app.request('/api/health', { headers: { host: HOST } });
    expect(res.status).toBe(403);
  });

  it('allows the web app origin', async () => {
    const { call } = setup();
    const res = await call('/api/health', { headers: { origin: 'http://localhost:5173' } });
    expect(res.status).toBe(200);
  });
});

describe('credentials', () => {
  it('reports configured status without returning secrets', async () => {
    const { call } = setup();
    await call('/api/credentials/tmdb', { method: 'PUT', body: JSON.stringify({ value: 'abc' }) });

    const body = await json<{ provider: string; configured: boolean }[]>(
      await call('/api/credentials'),
    );
    expect(body).toContainEqual({ provider: 'tmdb', configured: true });
    expect(body).toContainEqual({ provider: 'github', configured: false });
    expect(JSON.stringify(body)).not.toContain('abc');
  });

  it('requires an https URL for the calendar feed', async () => {
    const { call } = setup();
    const res = await call('/api/credentials/calendar', {
      method: 'PUT',
      body: JSON.stringify({ value: 'http://calendar.example/feed.ics' }),
    });
    expect(res.status).toBe(422);
  });

  it('rejects unknown providers', async () => {
    const { call } = setup();
    const res = await call('/api/credentials/nope', {
      method: 'PUT',
      body: JSON.stringify({ value: 'x' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('dashboard', () => {
  it('creates a default dashboard with a stardate widget', async () => {
    const { call } = setup();
    const body = await json<{ widgets: WidgetRow[] }>(await call('/api/dashboard'));
    expect(body.widgets).toEqual([
      expect.objectContaining({ type: 'stardate', column: 'side', position: 0 }),
    ]);
  });

  it('moves widgets between columns', async () => {
    const { call } = setup();
    const added = await json<WidgetRow>(
      await call('/api/dashboard/widgets', {
        method: 'POST',
        body: JSON.stringify({ type: 'echo', column: 'side' }),
      }),
    );
    const before = await json<{ widgets: WidgetRow[] }>(await call('/api/dashboard'));
    const stardate = before.widgets.find((w) => w.type === 'stardate')!;

    const res = await call('/api/dashboard/layout', {
      method: 'PUT',
      body: JSON.stringify({ main: [added.id], side: [stardate.id] }),
    });
    expect(res.status).toBe(204);

    const after = await json<{ widgets: WidgetRow[] }>(await call('/api/dashboard'));
    expect(after.widgets).toContainEqual(
      expect.objectContaining({ id: added.id, column: 'main', position: 0 }),
    );
  });

  it('rejects a layout that drops a widget', async () => {
    const { call } = setup();
    await call('/api/dashboard');
    const res = await call('/api/dashboard/layout', {
      method: 'PUT',
      body: JSON.stringify({ main: [], side: [] }),
    });
    expect(res.status).toBe(409);
  });
});

describe('widget data', () => {
  async function addEcho(call: ReturnType<typeof setup>['call']) {
    const res = await call('/api/dashboard/widgets', {
      method: 'POST',
      body: JSON.stringify({ type: 'echo', column: 'main' }),
    });
    return (await json<WidgetRow>(res)).id;
  }

  it('reports a missing credential', async () => {
    const { call } = setup();
    const id = await addEcho(call);
    const res = await call(`/api/widgets/${id}/data`);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'missing_credential', provider: 'tmdb' });
  });

  it('attaches the token and serves from cache until refreshMs passes', async () => {
    const { call, credentials, upstream, advance } = setup();
    await credentials.set('tmdb', 'secret-token');
    const id = await addEcho(call);

    await call(`/api/widgets/${id}/data`);
    await call(`/api/widgets/${id}/data`);
    expect(upstream).toHaveBeenCalledTimes(1);
    const init = upstream.mock.calls[0]![1]!;
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer secret-token');

    advance(60_001);
    await call(`/api/widgets/${id}/data`);
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it('serves stale data when a refresh fails', async () => {
    const { call, credentials, upstream, advance } = setup();
    await credentials.set('tmdb', 'secret-token');
    const id = await addEcho(call);
    await call(`/api/widgets/${id}/data`);

    upstream.mockRejectedValueOnce(new Error('offline'));
    advance(60_001);
    const body = await json<unknown>(await call(`/api/widgets/${id}/data`));
    expect(body).toMatchObject({ data: { status: 200 }, stale: true, error: 'offline' });
  });
});

describe('watchlist', () => {
  interface Item {
    id: string;
    kind: string;
    tmdbId: number;
    imdbId: string | null;
    title: string;
    year: number | null;
    status: string;
  }

  const tmdb = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const movie = {
    title: 'Paper Moons',
    release_date: '2026-11-14',
    poster_path: '/moons.jpg',
    imdb_id: 'tt0000001',
  };

  async function withToken() {
    const ctx = setup();
    await ctx.credentials.set('tmdb', 'secret-token');
    ctx.upstream.mockImplementation(async (url) =>
      String(url).includes('/movie/') ? tmdb(movie) : tmdb({ status_message: 'nope' }, 404),
    );
    return ctx;
  }

  const add = (call: ReturnType<typeof setup>['call'], body: object) =>
    call('/api/watchlist', { method: 'POST', body: JSON.stringify(body) });

  it('needs a TMDB token to add a title', async () => {
    const { call } = setup();
    const res = await add(call, { kind: 'movie', tmdbId: 7 });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'missing_credential', provider: 'tmdb' });
  });

  it("stores TMDB's details for a movie", async () => {
    const { call, upstream } = await withToken();
    const res = await add(call, { kind: 'movie', tmdbId: 7 });

    expect(res.status).toBe(201);
    expect(String(upstream.mock.calls[0]![0])).toBe('https://api.themoviedb.org/3/movie/7');
    expect(await json<Item>(res)).toMatchObject({
      kind: 'movie',
      tmdbId: 7,
      title: 'Paper Moons',
      year: 2026,
      imdbId: 'tt0000001',
      status: 'want',
    });
    expect(await json<Item[]>(await call('/api/watchlist'))).toHaveLength(1);
  });

  it('reads the IMDb id of a show from its external ids', async () => {
    const { call, credentials, upstream } = setup();
    await credentials.set('tmdb', 'secret-token');
    upstream.mockResolvedValue(
      tmdb({
        name: 'Harbor Lights',
        first_air_date: '2024-03-01',
        external_ids: { imdb_id: 'tt9' },
      }),
    );

    const item = await json<Item>(await add(call, { kind: 'tv', tmdbId: 7, status: 'watching' }));
    expect(String(upstream.mock.calls[0]![0])).toContain('/tv/7?append_to_response=external_ids');
    expect(item).toMatchObject({
      kind: 'tv',
      title: 'Harbor Lights',
      imdbId: 'tt9',
      status: 'watching',
    });
  });

  it('treats a movie and a show with the same TMDB id as different titles', async () => {
    const { call, upstream } = await withToken();
    await add(call, { kind: 'movie', tmdbId: 7 });
    upstream.mockResolvedValueOnce(tmdb({ name: 'Seven', first_air_date: null }));

    expect((await add(call, { kind: 'tv', tmdbId: 7 })).status).toBe(201);
    const again = await add(call, { kind: 'movie', tmdbId: 7 });
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({ error: 'already_on_watchlist' });
  });

  it('rejects a title TMDB does not know', async () => {
    const { call } = await withToken();
    const res = await add(call, { kind: 'tv', tmdbId: 404 });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'unknown_title' });
  });

  it('changes status and removes items', async () => {
    const { call } = await withToken();
    const { id } = await json<Item>(await add(call, { kind: 'movie', tmdbId: 7 }));

    const patched = await call(`/api/watchlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    });
    expect(await json<Item>(patched)).toMatchObject({ id, status: 'done' });

    expect((await call(`/api/watchlist/${id}`, { method: 'DELETE' })).status).toBe(204);
    expect((await call(`/api/watchlist/${id}`, { method: 'DELETE' })).status).toBe(404);
    expect(await json<Item[]>(await call('/api/watchlist'))).toEqual([]);
  });

  it('refreshes widgets that read the watchlist when it changes', async () => {
    const { call } = await withToken();
    const widget = await json<WidgetRow>(
      await call('/api/dashboard/widgets', {
        method: 'POST',
        body: JSON.stringify({ type: 'reader', column: 'main' }),
      }),
    );
    const data = async () =>
      (await json<{ data: string[] }>(await call(`/api/widgets/${widget.id}/data`))).data;

    expect(await data()).toEqual([]);
    await add(call, { kind: 'movie', tmdbId: 7 });
    expect(await data()).toEqual(['Paper Moons']);
  });
});

describe('watchlist search', () => {
  it('returns movies and shows, drops people, and marks titles already saved', async () => {
    const { call, credentials, upstream } = setup();
    await credentials.set('tmdb', 'secret-token');
    upstream.mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes('/search/multi')) {
        return Response.json({
          results: [
            { id: 7, media_type: 'movie', title: 'Paper Moons', release_date: '2026-11-14' },
            { id: 9, media_type: 'tv', name: 'Harbor Lights', first_air_date: '2024-03-01' },
            { id: 3, media_type: 'person', name: 'Someone' },
          ],
        });
      }
      return Response.json({ title: 'Paper Moons', release_date: '2026-11-14' });
    });
    const saved = await json<{ id: string }>(
      await call('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ kind: 'movie', tmdbId: 7 }),
      }),
    );

    const res = await call('/api/watchlist/search?q=paper%20moons');
    const searchUrl = new URL(String(upstream.mock.calls.at(-1)![0]));
    expect(searchUrl.searchParams.get('query')).toBe('paper moons');
    expect(searchUrl.searchParams.get('include_adult')).toBe('false');
    expect(await res.json()).toEqual([
      expect.objectContaining({
        kind: 'movie',
        tmdbId: 7,
        year: 2026,
        onWatchlist: { id: saved.id, status: 'want' },
      }),
      expect.objectContaining({ kind: 'tv', tmdbId: 9, title: 'Harbor Lights', onWatchlist: null }),
    ]);
  });

  it('rejects queries shorter than two characters', async () => {
    const { call } = setup();
    expect((await call('/api/watchlist/search?q=a')).status).toBe(422);
  });

  it('needs a TMDB token', async () => {
    const { call } = setup();
    const res = await call('/api/watchlist/search?q=moons');
    expect(res.status).toBe(409);
  });
});

describe('watchlist details', () => {
  async function saved(body: object, kind: 'movie' | 'tv') {
    const ctx = setup();
    await ctx.credentials.set('tmdb', 'secret-token');
    ctx.upstream.mockImplementation(async () => Response.json(body));
    const res = await ctx.call('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ kind, tmdbId: 7 }),
    });
    return { ...ctx, id: (await json<{ id: string }>(res)).id };
  }

  it("returns a movie's overview, genres and runtime", async () => {
    const { call, id } = await saved(
      {
        title: 'Paper Moons',
        release_date: '2026-11-14',
        overview: 'Two astronomers.',
        tagline: 'Look up.',
        genres: [{ name: 'Drama' }, { name: 'Romance' }],
        runtime: 114,
        status: 'Post Production',
      },
      'movie',
    );

    expect(await json<unknown>(await call(`/api/watchlist/${id}/details`))).toEqual({
      overview: 'Two astronomers.',
      tagline: 'Look up.',
      genres: ['Drama', 'Romance'],
      date: '2026-11-14',
      runtimeMinutes: 114,
      seasons: null,
      episodes: null,
      status: 'Post Production',
    });
  });

  it("returns a show's seasons, episodes and typical episode length", async () => {
    const { call, id } = await saved(
      {
        name: 'Harbor Lights',
        first_air_date: '2024-03-01',
        episode_run_time: [52],
        number_of_seasons: 3,
        number_of_episodes: 24,
        status: 'Returning Series',
      },
      'tv',
    );

    expect(await json<unknown>(await call(`/api/watchlist/${id}/details`))).toMatchObject({
      date: '2024-03-01',
      runtimeMinutes: 52,
      seasons: 3,
      episodes: 24,
      overview: null,
      genres: [],
    });
  });

  it('is not found for an id that is not on the watchlist', async () => {
    const { call } = setup();
    expect((await call('/api/watchlist/nope/details')).status).toBe(404);
  });
});
