import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/Empty state',
  component: EmptyState,
  args: {
    title: 'Your watchlist is a clear sky',
    description: 'Add a movie or show and it will show up here with its next release.',
    action: (
      <Button size="sm" variant="primary" leadingIcon={<Plus className="size-4" aria-hidden />}>
        Add a title
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <Card className="max-w-sm">
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoAction: Story = {
  args: {
    title: 'Nothing assigned',
    description: 'No open issues are assigned to you.',
    action: undefined,
  },
};
