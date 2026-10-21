import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';

const reviews = [2, 3, 2, 4, 3, 5, 4, 4, 6, 5, 7, 6, 5, 6];

const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  args: { data: reviews, label: 'Reviews, last 14 days: 2 to 6' },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InAStat: Story = {
  render: () => (
    <div className="grid max-w-xl grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
      {(
        [
          ['PRs merged', '18', 'accent', [1, 2, 1, 3, 2, 2, 4, 3, 2, 3, 5, 4, 3, 4]],
          ['Episodes', '9', 'accent-2', [0, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1]],
          ['Failing runs', '2', 'danger', [3, 2, 4, 2, 1, 2, 1, 0, 1, 2, 1, 0, 1, 0]],
        ] as const
      ).map(([label, total, tone, data]) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-card border border-line bg-raised p-4"
        >
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            {label}
          </p>
          <p className="font-mono text-2xl font-semibold">{total}</p>
          <Sparkline data={data} tone={tone} label={`${label}, last 14 days`} />
        </div>
      ))}
    </div>
  ),
};

export const Flat: Story = { args: { data: [3, 3, 3, 3, 3], label: 'No change' } };
