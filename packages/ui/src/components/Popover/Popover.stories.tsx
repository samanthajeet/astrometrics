import type { Meta, StoryObj } from '@storybook/react-vite';
import { Palette, X } from 'lucide-react';
import { Button, IconButton } from '../Button/Button';
import { SwitchRow } from '../Switch/Switch';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './Popover';

const meta = {
  title: 'Components/Popover',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemePopover({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <div className="flex h-80 justify-end">
      <Popover defaultOpen={defaultOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button leadingIcon={<Palette className="size-4" aria-hidden />}>Theme</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Theme">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold tracking-wide uppercase">Theme</h2>
            <PopoverClose asChild>
              <IconButton label="Close" size="sm" icon={<X className="size-4" />} />
            </PopoverClose>
          </div>
          <p className="mt-1 text-sm text-muted">Voyager · following your system.</p>
          <div className="mt-3 divide-y divide-line">
            <SwitchRow label="Starfield background" defaultChecked />
            <SwitchRow label="Reduce motion" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const Closed: Story = { render: () => <ThemePopover /> };

export const Open: Story = { render: () => <ThemePopover defaultOpen /> };
