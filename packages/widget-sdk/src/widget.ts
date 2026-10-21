import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { CredentialProviderId } from './credentials';
import type { WatchlistItem } from './watchlist';

export type Column = 'main' | 'side';
export type Platform = 'web' | 'desktop';
/** App data a widget's server fetcher may read through its context. */
export type DataSource = 'watchlist';

export interface WidgetManifest<TSettings = unknown> {
  type: string;
  name: string;
  description: string;
  credentials: readonly CredentialProviderId[];
  /** App data the fetcher reads. Changing that data clears this widget's cached result. */
  reads?: readonly DataSource[];
  settingsSchema: z.ZodType<TSettings>;
  defaultSettings: TSettings;
  /** How often the server re-fetches data. `null` means the widget has no server data. */
  refreshMs: number | null;
  platforms: readonly Platform[];
}

export interface WidgetContext {
  /** Plain fetch for APIs that need no credential. */
  fetch(url: string, init?: RequestInit): Promise<Response>;
  /**
   * Fetch with a stored credential attached. The widget never sees the secret; requests are only
   * allowed to the provider's own origins. For `secret-url` providers the URL is the secret, so
   * `url` is omitted.
   */
  request(provider: CredentialProviderId, url?: string, init?: RequestInit): Promise<Response>;
  /** The current user's watchlist, read-only. Only for widgets whose manifest `reads` it. */
  watchlist(): Promise<WatchlistItem[]>;
}

export interface ServerWidget<TSettings = unknown, TData = unknown> {
  manifest: WidgetManifest<TSettings>;
  fetch(ctx: WidgetContext, settings: TSettings): Promise<TData>;
}

export interface WidgetViewProps<TSettings = unknown, TData = unknown> {
  settings: TSettings;
  /** Undefined while loading, or always for widgets without server data. */
  data: TData | undefined;
}

export interface ClientWidget<TSettings = unknown, TData = unknown> {
  manifest: WidgetManifest<TSettings>;
  views: {
    Main: ComponentType<WidgetViewProps<TSettings, TData>>;
    Compact: ComponentType<WidgetViewProps<TSettings, TData>>;
  };
}

export function defineManifest<TSettings>(
  manifest: WidgetManifest<TSettings>,
): WidgetManifest<TSettings> {
  return manifest;
}

/** Erases a widget's settings/data types so it can sit in a registry with other widgets. */
export function defineClientWidget<TSettings, TData>(
  widget: ClientWidget<TSettings, TData>,
): ClientWidget {
  return widget as unknown as ClientWidget;
}

export function defineServerWidget<TSettings, TData>(
  widget: ServerWidget<TSettings, TData>,
): ServerWidget {
  return widget as unknown as ServerWidget;
}
