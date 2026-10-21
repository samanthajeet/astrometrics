import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input, PasswordInput } from './Field';

const meta = {
  title: 'Components/Field',
  component: Field,
  args: { label: 'Display name', children: (control) => <Input {...control} /> },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    label: 'Display name',
    help: 'Shown to people you connect with.',
    children: (control) => <Input {...control} defaultValue="sam-at-the-bridge" />,
  },
};

export const Password: Story = {
  args: {
    label: 'API Read Access Token',
    help: 'Stored in your system keychain.',
    children: (control) => <PasswordInput {...control} defaultValue="eyJhbGciOi.example-token" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Secret ICS feed URL',
    error: 'Use an https:// address.',
    children: (control) => <Input {...control} defaultValue="http://calendar.example/feed.ics" />,
  },
};

export const Placeholder: Story = {
  args: {
    label: 'Search shows',
    children: (control) => <Input {...control} type="search" placeholder="Star Trek: Voyager" />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Workspace',
    help: 'Set by your organization.',
    children: (control) => <Input {...control} defaultValue="SixFifty" disabled />,
  },
};
