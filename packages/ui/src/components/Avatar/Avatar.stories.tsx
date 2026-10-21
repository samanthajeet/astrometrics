import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Kathryn Janeway', size: 'md' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Seven of Nine" size="sm" />
      <Avatar name="Seven of Nine" size="md" status="online" />
      <Avatar name="Seven of Nine" size="lg" status="away" />
    </div>
  ),
};

export const BrokenImage: Story = {
  args: { name: 'Tuvok', src: '/does-not-exist.png' },
};

export const Group: Story = {
  render: () => (
    <AvatarGroup
      label="Watching with you"
      people={[
        { name: 'Kathryn Janeway' },
        { name: 'Chakotay' },
        { name: "B'Elanna Torres" },
        { name: 'Tom Paris' },
        { name: 'Harry Kim' },
        { name: 'Neelix' },
      ]}
    />
  ),
};
