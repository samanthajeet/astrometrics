import { defineManifest } from '@astrometrics/widget-sdk';
import { z } from 'zod';

export const stardateManifest = defineManifest({
  type: 'stardate',
  name: 'Stardate',
  description: 'Local time, date, and the current stardate.',
  credentials: [],
  settingsSchema: z.object({}),
  defaultSettings: {},
  refreshMs: null,
  platforms: ['web', 'desktop'],
});
