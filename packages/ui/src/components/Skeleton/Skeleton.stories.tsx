import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ListLoading: Story = {
  render: () => (
    <Card title="Upcoming releases" aria-busy="true" className="max-w-md">
      <span className="sr-only">Loading releases…</span>
      <ul className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3">
            <Skeleton className="h-14 w-10 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  ),
};
