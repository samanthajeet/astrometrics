import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Components/Segmented control',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Range() {
  const [value, setValue] = useState<'day' | 'week' | 'month'>('week');
  return (
    <SegmentedControl
      label="Range"
      value={value}
      onValueChange={setValue}
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    />
  );
}

export const Default: Story = { render: () => <Range /> };

function WatchlistFilter() {
  const [value, setValue] = useState<'all' | 'want' | 'watching' | 'done'>('all');
  return (
    <SegmentedControl
      label="Watchlist status"
      value={value}
      onValueChange={setValue}
      options={[
        { value: 'all', label: 'All', count: 6 },
        { value: 'want', label: 'Want', count: 2 },
        { value: 'watching', label: 'Watching', count: 2 },
        { value: 'done', label: 'Done', count: 2 },
      ]}
    />
  );
}

export const WithCounts: Story = { render: () => <WatchlistFilter /> };
