import {
  credentialProviderIds,
  credentialProviders,
  isCredentialProviderId,
  watchlistKinds,
  watchlistStatuses,
  type ServerWidget,
  type WidgetManifest,
} from '@astrometrics/widget-sdk';
import { serveStatic } from '@hono/node-server/serve-static';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { CredentialStore } from './credentials/store';
import { createWidgetContext, MissingCredentialError } from './credentials/widget-context';
import { addWidget, getOrCreateDashboard, listWidgets, removeWidget, setLayout } from './dashboard';
import { LOCAL_USER_ID, type Db } from './db/client';
import { dashboards, fetchCache, widgetInstances } from './db/schema';
import { localOnly, type LocalOnlyOptions } from './security';
import { fetchTmdbTitle, TmdbNotFoundError } from './tmdb';
import {
  addWatchlistItem,
  clearWatchlistCaches,
  findWatchlistItem,
  listWatchlist,
  removeWatchlistItem,
  setWatchlistStatus,
} from './watchlist';

export interface AppDeps extends LocalOnlyOptions {
  db: Db;
  credentials: CredentialStore;
  manifests: Record<string, WidgetManifest>;
  serverWidgets: Record<string, ServerWidget>;
  fetch?: typeof fetch;
  staticRoot?: string;
  now?: () => Date;
}

const secretSchema = z.object({ value: z.string().trim().min(1).max(4096) });
const addWidgetSchema = z.object({ type: z.string(), column: z.enum(['main', 'side']) });
const layoutSchema = z.object({ main: z.array(z.string()), side: z.array(z.string()) });
const addWatchlistSchema = z.object({
  kind: z.enum(watchlistKinds),
  tmdbId: z.number().int().positive(),
  status: z.enum(watchlistStatuses).default('want'),
});
const watchlistStatusSchema = z.object({ status: z.enum(watchlistStatuses) });

async function readJson(req: { json(): Promise<unknown> }): Promise<unknown> {
  return req.json().catch(() => null);
}

export function createApp(deps: AppDeps) {
  const { db, credentials, manifests, serverWidgets } = deps;
  const fetchImpl = deps.fetch ?? fetch;
  const now = deps.now ?? (() => new Date());
  const app = new Hono<{ Variables: { userId: string } }>();

  app.use('*', localOnly(deps));
  // Hosting swaps this for the signed-in user; every route below reads it rather than assuming one.
  app.use('/api/*', async (c, next) => {
    c.set('userId', LOCAL_USER_ID);
    await next();
  });

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.get('/api/credentials', async (c) => {
    const statuses = await Promise.all(
      credentialProviderIds.map(async (provider) => ({
        provider,
        configured: (await credentials.get(provider)) !== null,
      })),
    );
    return c.json(statuses);
  });

  app.put('/api/credentials/:provider', async (c) => {
    const provider = c.req.param('provider');
    if (!isCredentialProviderId(provider)) return c.json({ error: 'unknown_provider' }, 404);

    const body = secretSchema.safeParse(await readJson(c.req));
    if (!body.success) return c.json({ error: 'invalid_value' }, 422);

    if (credentialProviders[provider].auth.type === 'secret-url') {
      const url = URL.parse(body.data.value);
      if (url?.protocol !== 'https:') return c.json({ error: 'invalid_value' }, 422);
    }

    await credentials.set(provider, body.data.value);
    return c.body(null, 204);
  });

  app.delete('/api/credentials/:provider', async (c) => {
    const provider = c.req.param('provider');
    if (!isCredentialProviderId(provider)) return c.json({ error: 'unknown_provider' }, 404);
    await credentials.delete(provider);
    return c.body(null, 204);
  });

  app.get('/api/dashboard', (c) => {
    const dashboard = getOrCreateDashboard(db, c.get('userId'));
    return c.json({
      id: dashboard.id,
      name: dashboard.name,
      widgets: listWidgets(db, dashboard.id),
    });
  });

  app.post('/api/dashboard/widgets', async (c) => {
    const body = addWidgetSchema.safeParse(await readJson(c.req));
    if (!body.success) return c.json({ error: 'invalid_body' }, 422);

    const manifest = manifests[body.data.type];
    if (!manifest) return c.json({ error: 'unknown_widget_type' }, 422);

    const dashboard = getOrCreateDashboard(db, c.get('userId'));
    const widget = addWidget(db, dashboard.id, {
      ...body.data,
      settings: manifest.defaultSettings,
    });
    return c.json(widget, 201);
  });

  app.delete('/api/dashboard/widgets/:id', (c) => {
    const dashboard = getOrCreateDashboard(db, c.get('userId'));
    if (!removeWidget(db, dashboard.id, c.req.param('id')))
      return c.json({ error: 'not_found' }, 404);
    return c.body(null, 204);
  });

  app.put('/api/dashboard/layout', async (c) => {
    const body = layoutSchema.safeParse(await readJson(c.req));
    if (!body.success) return c.json({ error: 'invalid_body' }, 422);

    const dashboard = getOrCreateDashboard(db, c.get('userId'));
    if (!setLayout(db, dashboard.id, body.data)) return c.json({ error: 'layout_mismatch' }, 409);
    return c.body(null, 204);
  });

  app.get('/api/watchlist', (c) => c.json(listWatchlist(db, c.get('userId'))));

  app.post('/api/watchlist', async (c) => {
    const body = addWatchlistSchema.safeParse(await readJson(c.req));
    if (!body.success) return c.json({ error: 'invalid_body' }, 422);
    const userId = c.get('userId');
    const { kind, tmdbId, status } = body.data;

    const existing = findWatchlistItem(db, userId, kind, tmdbId);
    if (existing) return c.json({ error: 'already_on_watchlist', item: existing }, 409);

    try {
      const ctx = createWidgetContext(credentials, fetchImpl, ['tmdb']);
      const title = await fetchTmdbTitle(ctx, kind, tmdbId);
      const item = addWatchlistItem(db, userId, { kind, tmdbId, status, ...title });
      clearWatchlistCaches(db, userId, manifests);
      return c.json(item, 201);
    } catch (error) {
      if (error instanceof MissingCredentialError) {
        return c.json({ error: 'missing_credential', provider: error.provider }, 409);
      }
      if (error instanceof TmdbNotFoundError) return c.json({ error: 'unknown_title' }, 422);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ error: 'fetch_failed', message }, 502);
    }
  });

  app.patch('/api/watchlist/:id', async (c) => {
    const body = watchlistStatusSchema.safeParse(await readJson(c.req));
    if (!body.success) return c.json({ error: 'invalid_body' }, 422);
    const userId = c.get('userId');

    const item = setWatchlistStatus(db, userId, c.req.param('id'), body.data.status);
    if (!item) return c.json({ error: 'not_found' }, 404);
    clearWatchlistCaches(db, userId, manifests);
    return c.json(item);
  });

  app.delete('/api/watchlist/:id', (c) => {
    const userId = c.get('userId');
    if (!removeWatchlistItem(db, userId, c.req.param('id'))) {
      return c.json({ error: 'not_found' }, 404);
    }
    clearWatchlistCaches(db, userId, manifests);
    return c.body(null, 204);
  });

  app.get('/api/widgets/:id/data', async (c) => {
    const userId = c.get('userId');
    const instance = db
      .select({ instance: widgetInstances })
      .from(widgetInstances)
      .innerJoin(dashboards, eq(widgetInstances.dashboardId, dashboards.id))
      .where(and(eq(widgetInstances.id, c.req.param('id')), eq(dashboards.userId, userId)))
      .get()?.instance;
    if (!instance) return c.json({ error: 'not_found' }, 404);

    const widget = serverWidgets[instance.type];
    if (!widget) return c.json({ error: 'no_server_data' }, 404);

    const cached = db
      .select()
      .from(fetchCache)
      .where(eq(fetchCache.widgetInstanceId, instance.id))
      .get();
    const refreshMs = widget.manifest.refreshMs ?? 0;
    const force = c.req.query('refresh') === '1';
    if (cached && !force && now().getTime() - cached.fetchedAt.getTime() < refreshMs) {
      return c.json({ data: cached.data, fetchedAt: cached.fetchedAt.toISOString(), stale: false });
    }

    const settings = widget.manifest.settingsSchema.safeParse(instance.settings);
    if (!settings.success) return c.json({ error: 'invalid_settings' }, 422);

    try {
      const ctx = createWidgetContext(credentials, fetchImpl, widget.manifest.credentials, {
        reads: widget.manifest.reads,
        sources: { watchlist: () => listWatchlist(db, userId) },
      });
      const data = await widget.fetch(ctx, settings.data);
      const fetchedAt = now();
      db.insert(fetchCache)
        .values({ widgetInstanceId: instance.id, data, fetchedAt })
        .onConflictDoUpdate({ target: fetchCache.widgetInstanceId, set: { data, fetchedAt } })
        .run();
      return c.json({ data, fetchedAt: fetchedAt.toISOString(), stale: false });
    } catch (error) {
      if (error instanceof MissingCredentialError) {
        return c.json({ error: 'missing_credential', provider: error.provider }, 409);
      }
      const message = error instanceof Error ? error.message : String(error);
      if (cached) {
        return c.json({
          data: cached.data,
          fetchedAt: cached.fetchedAt.toISOString(),
          stale: true,
          error: message,
        });
      }
      return c.json({ error: 'fetch_failed', message }, 502);
    }
  });

  if (deps.staticRoot) {
    app.use('/*', serveStatic({ root: deps.staticRoot }));
    app.get('*', serveStatic({ root: deps.staticRoot, path: 'index.html' }));
  }

  return app;
}
