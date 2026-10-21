import {
  defineServerWidget,
  type ServerWidget,
  type WidgetManifest,
} from '@astrometrics/widget-sdk';
import { stardateManifest } from './stardate/manifest';
import { watchlistManifest } from './watchlist/manifest';

export const manifests: Record<string, WidgetManifest> = {
  [stardateManifest.type]: stardateManifest,
  [watchlistManifest.type]: watchlistManifest,
};

export const serverWidgets: Record<string, ServerWidget> = {
  [watchlistManifest.type]: defineServerWidget({
    manifest: watchlistManifest,
    fetch: (ctx) => ctx.watchlist(),
  }),
};
