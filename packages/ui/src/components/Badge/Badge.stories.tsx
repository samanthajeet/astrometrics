import type { Meta, StoryObj } from '@storybook/react-vite';
import { tones } from '../tones';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Connected', tone: 'success' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
      <Badge variant="outline">outline</Badge>
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge tone="accent" count>
        3
      </Badge>
      <Badge tone="danger" count>
        12
      </Badge>
      <Badge tone="neutral" count>
        99+
      </Badge>
    </div>
  ),
};
