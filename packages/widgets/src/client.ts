import { defineClientWidget, type ClientWidget } from '@astrometrics/widget-sdk';
import { stardateManifest } from './stardate/manifest';
import { StardateCompact, StardateMain } from './stardate/views';

export const clientWidgets: Record<string, ClientWidget> = {
  [stardateManifest.type]: defineClientWidget({
    manifest: stardateManifest,
    views: { Main: StardateMain, Compact: StardateCompact },
  }),
};
