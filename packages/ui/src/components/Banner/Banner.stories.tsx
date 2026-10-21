import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Banner } from './Banner';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    tone: 'warning',
    title: 'Showing cached data',
    children: 'TVmaze is unreachable. Last updated 12 minutes ago.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Couldn’t load releases',
    children: 'TMDB responded with 401. Check your token in Settings.',
    action: <Button size="sm">Retry</Button>,
  },
};

export const Success: Story = {
  args: { tone: 'success', title: 'GitHub connected', children: undefined },
};

export const Info: Story = {
  args: {
    tone: 'info',
    title: undefined,
    children: 'Widgets in the side column show their compact view.',
  },
};
