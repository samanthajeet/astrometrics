import type { Meta, StoryObj } from '@storybook/react-vite';
import { tones } from '../tones';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Components/Progress bar',
  component: ProgressBar,
  args: { label: 'Season progress', value: 62 },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hatched: Story = {};

export const Solid: Story = { args: { hatched: false } };

export const Large: Story = { args: { size: 'lg' } };

export const PtoSegments: Story = {
  args: {
    label: 'PTO hours this year',
    max: 120,
    size: 'lg',
    segments: [
      { label: 'Used', value: 54, tone: 'accent' },
      { label: 'Planned', value: 24, tone: 'accent-4' },
    ],
  },
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {tones.map((tone, i) => (
        <ProgressBar key={tone} label={tone} tone={tone} value={90 - i * 9} />
      ))}
    </div>
  ),
};
