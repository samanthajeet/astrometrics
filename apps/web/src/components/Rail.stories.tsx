import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Rail } from './Rail';

const meta = {
  title: 'App/Rail',
  component: Rail,
  args: { view: 'dashboard', collapsed: false, onNavigate: fn(), onToggle: fn() },
  decorators: [
    (Story) => (
      <div className="flex h-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Rail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

export const OnSettings: Story = { args: { view: 'settings' } };
