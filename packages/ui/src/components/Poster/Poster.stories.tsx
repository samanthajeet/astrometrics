import type { Meta, StoryObj } from '@storybook/react-vite';
import { Poster } from './Poster';

const meta = {
  title: 'Components/Poster',
  component: Poster,
  args: { src: null },
} satisfies Meta<typeof Poster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without an image the accent gradient stands in, so every theme shows something. */
export const Placeholder: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      <Poster {...args} size="sm" />
      <Poster {...args} size="md" />
      <div className="w-32">
        <Poster {...args} size="fill" />
      </div>
    </div>
  ),
};
