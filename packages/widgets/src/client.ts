import { defineClientWidget, type ClientWidget } from '@astrometrics/widget-sdk';
import { stardateManifest } from './stardate/manifest';
import { StardateCompact, StardateMain } from './stardate/views';
import { watchlistManifest } from './watchlist/manifest';
import { WatchlistCompact, WatchlistMain } from './watchlist/views';

export const clientWidgets: Record<string, ClientWidget> = {
  [stardateManifest.type]: defineClientWidget({
    manifest: stardateManifest,
    views: { Main: StardateMain, Compact: StardateCompact },
  }),
  [watchlistManifest.type]: defineClientWidget({
    manifest: watchlistManifest,
    views: { Main: WatchlistMain, Compact: WatchlistCompact },
  }),
};
