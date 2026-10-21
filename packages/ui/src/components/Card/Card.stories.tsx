import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis } from 'lucide-react';
import { IconButton } from '../Button/Button';
import { Card, Eyebrow, Tile } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    title: 'Long Rest',
    eyebrow: 'PTO · 2026',
    action: (
      <IconButton label="Long Rest options" size="sm" icon={<Ellipsis className="size-4" />} />
    ),
    children: <p className="text-sm text-muted">42 hours available. Next OOO: Nov 26–28.</p>,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => (
  <div className="max-w-md">
    <Story />
  </div>
);

export const Default: Story = { decorators: [narrow] };

export const Plain: Story = {
  args: { title: undefined, eyebrow: undefined, action: undefined },
  decorators: [narrow],
};

export const Tiles: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      <Tile tone="accent" label="Watchlist" value="12" detail="3 watching" />
      <Tile tone="accent-2" label="Next episode" value="Tue" detail="Severance S3E4" chamfer />
      <Tile tone="accent-3" label="PTO" value="42 h" detail="5.2 days" />
      <Tile tone="accent-4" label="Reviews" value="3" detail="1 waiting 2 days" chamfer />
    </div>
  ),
};

export const EyebrowLabel: Story = {
  render: () => <Eyebrow>Stardate −296196.23</Eyebrow>,
};
