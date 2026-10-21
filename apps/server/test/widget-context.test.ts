import { describe, expect, it, vi } from 'vitest';
import { MemoryCredentialStore } from '../src/credentials/store';
import { createWidgetContext } from '../src/credentials/widget-context';

describe('createWidgetContext', () => {
  it('refuses to send a credential to another origin', async () => {
    const store = new MemoryCredentialStore();
    await store.set('github', 'ghp_x');
    const ctx = createWidgetContext(store, vi.fn(), ['github']);
    await expect(ctx.request('github', 'https://evil.example/steal')).rejects.toThrow(
      /cannot be sent/,
    );
  });

  it('refuses a credential the widget did not declare', async () => {
    const store = new MemoryCredentialStore();
    await store.set('github', 'ghp_x');
    const ctx = createWidgetContext(store, vi.fn(), ['tmdb']);
    await expect(ctx.request('github', 'https://api.github.com/user')).rejects.toThrow(
      /did not declare/,
    );
  });

  it('reads the watchlist only for widgets that declare it', async () => {
    const store = new MemoryCredentialStore();
    const sources = { watchlist: () => [] };
    await expect(createWidgetContext(store, vi.fn(), [], { sources }).watchlist()).rejects.toThrow(
      /did not declare/,
    );
    await expect(
      createWidgetContext(store, vi.fn(), [], { reads: ['watchlist'], sources }).watchlist(),
    ).resolves.toEqual([]);
  });

  it('uses the stored URL for secret-url providers', async () => {
    const store = new MemoryCredentialStore();
    await store.set('calendar', 'https://calendar.example/secret.ics');
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(''));
    await createWidgetContext(store, fetchImpl, ['calendar']).request('calendar');
    expect(fetchImpl).toHaveBeenCalledWith('https://calendar.example/secret.ics', undefined);
  });

  it('sends Shortcut tokens in the Shortcut-Token header', async () => {
    const store = new MemoryCredentialStore();
    await store.set('shortcut', 'sc-token');
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(''));
    await createWidgetContext(store, fetchImpl, ['shortcut']).request(
      'shortcut',
      'https://api.app.shortcut.com/api/v3/member',
    );
    const init = fetchImpl.mock.calls[0]![1]!;
    expect(new Headers(init.headers).get('shortcut-token')).toBe('sc-token');
    expect(init.redirect).toBe('error');
  });
});
