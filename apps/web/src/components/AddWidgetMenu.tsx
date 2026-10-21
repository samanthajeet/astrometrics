import { IconButton, Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from '@astrometrics/ui';
import { clientWidgets } from '@astrometrics/widgets/client';
import type { Column } from '@astrometrics/widget-sdk';
import { Plus } from 'lucide-react';
import { useAddWidget } from '../lib/queries';

export function AddWidgetMenu({ column }: { column: Column }) {
  const addWidget = useAddWidget();

  return (
    <Menu>
      <MenuTrigger asChild>
        <IconButton
          label={`Add widget to ${column} column`}
          size="sm"
          icon={<Plus className="size-4" />}
          className="text-muted hover:text-fg"
        />
      </MenuTrigger>
      <MenuContent className="w-72">
        <MenuLabel>Add a widget</MenuLabel>
        {Object.values(clientWidgets).map(({ manifest }) => (
          <MenuItem
            key={manifest.type}
            className="h-auto py-2"
            onSelect={() => addWidget.mutate({ type: manifest.type, column })}
          >
            <span className="block font-semibold">{manifest.name}</span>
            <span className="block text-xs text-muted">{manifest.description}</span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
