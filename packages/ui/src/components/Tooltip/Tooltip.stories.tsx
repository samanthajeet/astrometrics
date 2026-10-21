import type { Meta, StoryObj } from '@storybook/react-vite';
import { RefreshCw } from 'lucide-react';
import { IconButton } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Refresh now',
    children: <IconButton label="Refresh" icon={<RefreshCw className="size-5" />} />,
  },
  decorators: [
    (Story) => (
      <div className="flex h-32 items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnHover: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const LongContent: Story = {
  args: {
    defaultOpen: true,
    content: 'Last refreshed 4 minutes ago. TMDB data refreshes every 30 minutes.',
  },
};
