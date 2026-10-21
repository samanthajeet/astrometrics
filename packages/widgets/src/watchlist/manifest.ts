import { defineManifest } from '@astrometrics/widget-sdk';
import { z } from 'zod';

export const watchlistManifest = defineManifest({
  type: 'watchlist',
  name: 'Watchlist',
  description: 'Movies and shows to watch, with their status.',
  credentials: [],
  reads: ['watchlist'],
  settingsSchema: z.object({}),
  defaultSettings: {},
  // Watchlist changes clear this widget's cache, so this only bounds staleness from elsewhere.
  refreshMs: 10 * 60_000,
  platforms: ['web', 'desktop'],
});
