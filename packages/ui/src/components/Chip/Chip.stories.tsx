import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { tones } from '../tones';
import { Chip, FilterChip } from './Chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: { children: 'Watching', tone: 'accent' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WatchStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip tone="accent-4">Want</Chip>
      <Chip tone="accent" pulse>
        Watching
      </Chip>
      <Chip tone="success">Done</Chip>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => (
        <Chip key={tone} tone={tone}>
          {tone}
        </Chip>
      ))}
    </div>
  ),
};

function FilterChips() {
  const [selected, setSelected] = useState({
    movies: true,
    shows: true,
    docs: false,
    games: false,
  });
  return (
    <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
      {(Object.keys(selected) as (keyof typeof selected)[]).map((key) => (
        <FilterChip
          key={key}
          selected={selected[key]}
          onSelectedChange={(value) => setSelected((s) => ({ ...s, [key]: value }))}
        >
          {key[0]!.toUpperCase() + key.slice(1)}
        </FilterChip>
      ))}
    </div>
  );
}

export const Filters: Story = { render: () => <FilterChips /> };
