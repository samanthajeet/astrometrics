import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Maximize2, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Button, IconButton } from '../Button/Button';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from './Menu';

const meta = {
  title: 'Components/Menu',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function WidgetMenu({ defaultOpen }: { defaultOpen?: boolean }) {
  const [compact, setCompact] = useState(false);
  return (
    <div className="flex h-72 justify-end">
      <Menu defaultOpen={defaultOpen} modal={false}>
        <MenuTrigger asChild>
          <IconButton label="Widget options" icon={<Ellipsis className="size-5" />} />
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Upcoming releases</MenuLabel>
          <MenuItem icon={<RefreshCw className="size-4" />} shortcut="R" onSelect={fn()}>
            Refresh now
          </MenuItem>
          <MenuItem icon={<Maximize2 className="size-4" />} onSelect={fn()}>
            Open main view
          </MenuItem>
          <MenuItem icon={<Settings className="size-4" />} shortcut="," onSelect={fn()}>
            Widget settings
          </MenuItem>
          <MenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
            Hide released titles
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 className="size-4" />} destructive onSelect={fn()}>
            Remove widget
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

export const Closed: Story = { render: () => <WidgetMenu /> };

export const Open: Story = { render: () => <WidgetMenu defaultOpen /> };

export const WithTextTrigger: Story = {
  render: () => (
    <div className="h-56">
      <Menu modal={false}>
        <MenuTrigger asChild>
          <Button>Add widget</Button>
        </MenuTrigger>
        <MenuContent align="start">
          <MenuItem onSelect={fn()}>Stardate</MenuItem>
          <MenuItem onSelect={fn()}>Watchlist</MenuItem>
          <MenuItem onSelect={fn()}>Upcoming releases</MenuItem>
          <MenuItem disabled>GitHub (connect first)</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  ),
};
