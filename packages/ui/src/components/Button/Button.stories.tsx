import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { fn } from 'storybook/test';
import { Button, IconButton, type ButtonSize, type ButtonVariant } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Add widget', variant: 'primary', size: 'md', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant[0]!.toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" leadingIcon={<Plus className="size-4" aria-hidden />}>
        Add widget
      </Button>
      <Button trailingIcon={<ArrowRight className="size-4" aria-hidden />}>Open settings</Button>
      <Button variant="danger" leadingIcon={<Trash2 className="size-4" aria-hidden />}>
        Remove
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton label="Refresh" icon={<RefreshCw className="size-5" />} />
      <IconButton label="Settings" variant="secondary" icon={<Settings className="size-5" />} />
      <IconButton label="Add widget" variant="primary" icon={<Plus className="size-5" />} />
      <IconButton label="Add widget" size="sm" icon={<Plus className="size-4" />} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </div>
  ),
};
