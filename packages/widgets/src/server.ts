import type { ServerWidget, WidgetManifest } from '@astrometrics/widget-sdk';
import { stardateManifest } from './stardate/manifest';

export const manifests: Record<string, WidgetManifest> = {
  [stardateManifest.type]: stardateManifest,
};

export const serverWidgets: Record<string, ServerWidget> = {};
