import { defaultThemeSettings, presetIds, presets, ThemeProvider } from '@astrometrics/ui';
import '@astrometrics/ui/fonts';
import type { Preview } from '@storybook/react-vite';
import '../../web/src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    a11y: { test: 'error' },
  },
  globalTypes: {
    preset: {
      description: 'Theme preset',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: presetIds.map((id) => ({ value: id, title: presets[id].name })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light or dark',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
    radius: {
      description: 'Corner style',
      toolbar: {
        title: 'Radius',
        icon: 'circlehollow',
        items: [
          { value: 'sharp', title: 'Sharp' },
          { value: 'soft', title: 'Soft' },
          { value: 'round', title: 'Round' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { preset: 'voyager', mode: 'dark', radius: 'soft' },
  decorators: [
    (Story, { globals }) => (
      <ThemeProvider
        settings={{
          ...defaultThemeSettings,
          preset: globals.preset,
          mode: globals.mode,
          radius: globals.radius,
        }}
      >
        <div className="starfield min-h-full p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
