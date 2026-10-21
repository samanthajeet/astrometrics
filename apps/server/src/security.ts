import type { MiddlewareHandler } from 'hono';

export interface LocalOnlyOptions {
  allowedHosts: readonly string[];
  allowedOrigins: readonly string[];
}

export const API_HEADER = 'x-astrometrics';

/**
 * The server holds the user's tokens, so any web page the user visits must not be able to use it.
 * The Host check blocks DNS rebinding, the Origin check blocks cross-site requests, and the custom
 * header forces a CORS preflight, which this server never approves.
 */
export function localOnly({ allowedHosts, allowedOrigins }: LocalOnlyOptions): MiddlewareHandler {
  return async (c, next) => {
    const host = c.req.header('host');
    if (!host || !allowedHosts.includes(host)) return c.json({ error: 'forbidden_host' }, 403);

    const origin = c.req.header('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return c.json({ error: 'forbidden_origin' }, 403);
    }

    if (c.req.path.startsWith('/api/') && c.req.header(API_HEADER) !== '1') {
      return c.json({ error: 'missing_api_header' }, 403);
    }

    await next();
  };
}
