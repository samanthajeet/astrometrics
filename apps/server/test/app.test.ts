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

function setup() {
  const credentials = new MemoryCredentialStore();
  const upstream = vi.fn<typeof fetch>(async () => new Response('{}', { status: 200 }));
  let clock = new Date('2026-10-20T12:00:00Z');
  const app = createApp({
    db: openDatabase(':memory:'),
    credentials,
    manifests: { echo: echoManifest },
    serverWidgets: { echo: echoWidget },
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
