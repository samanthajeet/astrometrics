import type { Preview } from '@storybook/react-vite';
import '../../web/src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    a11y: { test: 'error' },
  },
  decorators: [
    (Story) => (
      <div className="min-h-full bg-space p-4 text-slate-200">
        <Story />
      </div>
    ),
  ],
};

export default preview;
