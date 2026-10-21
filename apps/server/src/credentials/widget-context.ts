import {
  credentialProviders,
  type CredentialProviderId,
  type DataSource,
  type WatchlistItem,
  type WidgetContext,
} from '@astrometrics/widget-sdk';
import type { CredentialStore } from './store';

export class MissingCredentialError extends Error {
  constructor(readonly provider: CredentialProviderId) {
    super(`No ${credentialProviders[provider].label} credential is configured.`);
  }
}

export interface DataSources {
  watchlist(): WatchlistItem[];
}

const noData: DataSources = { watchlist: () => [] };

export function createWidgetContext(
  store: CredentialStore,
  fetchImpl: typeof fetch,
  allowed: readonly CredentialProviderId[],
  { reads = [], sources = noData }: { reads?: readonly DataSource[]; sources?: DataSources } = {},
): WidgetContext {
  return {
    fetch: (url, init) => fetchImpl(url, init),

    async watchlist() {
      if (!reads.includes('watchlist')) {
        throw new Error('This widget did not declare that it reads the watchlist.');
      }
      return sources.watchlist();
    },

    async request(provider, url, init) {
      if (!allowed.includes(provider)) {
        throw new Error(`This widget did not declare the ${provider} credential.`);
      }
      const secret = await store.get(provider);
      if (!secret) throw new MissingCredentialError(provider);

      const { auth } = credentialProviders[provider];
      if (auth.type === 'secret-url') return fetchImpl(secret, init);

      if (!url) throw new Error(`A URL is required for ${provider} requests.`);
      const origin = new URL(url).origin;
      if (!auth.origins.some((allowed) => allowed === origin)) {
        throw new Error(`${provider} credentials cannot be sent to ${origin}.`);
      }

      const headers = new Headers(init?.headers);
      if (auth.type === 'bearer') headers.set('Authorization', `Bearer ${secret}`);
      else headers.set(auth.header, secret);
      // A redirect could carry a custom auth header to another host.
      return fetchImpl(url, { ...init, headers, redirect: 'error' });
    },
  };
}
