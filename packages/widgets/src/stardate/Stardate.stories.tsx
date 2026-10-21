import type { Meta, StoryObj } from '@storybook/react-vite';
import { StardateCompact, StardateMain } from './views';

const meta = {
  title: 'Widgets/Stardate',
  component: StardateMain,
} satisfies Meta<typeof StardateMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {};

export const Compact: Story = {
  render: () => (
    <div className="w-[328px]">
      <StardateCompact />
    </div>
  ),
};
