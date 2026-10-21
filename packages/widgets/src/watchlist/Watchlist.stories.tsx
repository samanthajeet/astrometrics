import { WidgetHostProvider, type WatchlistItem } from '@astrometrics/widget-sdk';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { WatchlistCompact, WatchlistMain } from './views';

const item = (
  title: string,
  kind: WatchlistItem['kind'],
  year: number,
  status: WatchlistItem['status'],
  day: number,
): WatchlistItem => ({
  id: title,
  kind,
  tmdbId: day,
  imdbId: null,
  title,
  year,
  posterPath: null,
  status,
  addedAt: `2026-10-${String(day).padStart(2, '0')}T12:00:00Z`,
});

const items: WatchlistItem[] = [
  item('The Quiet Nebula', 'movie', 2026, 'watching', 2),
  item('Harbor Lights', 'tv', 2024, 'want', 9),
  item('Paper Moons', 'movie', 2026, 'done', 4),
  item('Low Orbit', 'movie', 2026, 'want', 12),
  item('Midnight Carinderia', 'tv', 2025, 'watching', 7),
  item('Static Garden', 'movie', 2025, 'done', 1),
];

const withHost: Decorator = (Story) => (
  <WidgetHostProvider value={{ openWatchlist: fn(), openTitle: fn() }}>
    <Story />
  </WidgetHostProvider>
);

const mainWidth: Decorator = (Story) => (
  <div className="w-[640px] max-w-full">
    <Story />
  </div>
);

const compactWidth: Decorator = (Story) => (
  <div className="w-[328px] max-w-full">
    <Story />
  </div>
);

const meta = {
  title: 'Widgets/Watchlist',
  component: WatchlistMain,
  args: { settings: {}, data: items },
  decorators: [withHost],
} satisfies Meta<typeof WatchlistMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = { decorators: [mainWidth] };

export const MainEmpty: Story = { args: { data: [] }, decorators: [mainWidth] };

export const MainLoading: Story = { args: { data: undefined }, decorators: [mainWidth] };

export const Compact: Story = {
  render: (args) => <WatchlistCompact {...args} />,
  decorators: [compactWidth],
};

export const CompactEmpty: Story = {
  args: { data: [] },
  render: (args) => <WatchlistCompact {...args} />,
  decorators: [compactWidth],
};

export const CompactAllWatched: Story = {
  args: { data: items.map((i) => ({ ...i, status: 'done' as const })) },
  render: (args) => <WatchlistCompact {...args} />,
  decorators: [compactWidth],
};
