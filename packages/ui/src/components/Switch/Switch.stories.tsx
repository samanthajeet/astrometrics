import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch, SwitchRow } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications', defaultChecked: true },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Settings() {
  const [notify, setNotify] = useState(true);
  const [sync, setSync] = useState(false);
  return (
    <div className="max-w-md divide-y divide-line rounded-card border border-line bg-raised px-5">
      <SwitchRow
        label="Episode alerts"
        description="Notify me when a tracked show airs."
        checked={notify}
        onCheckedChange={setNotify}
      />
      <SwitchRow
        label="Sync across devices"
        description="Coming with hosted sync."
        checked={sync}
        onCheckedChange={setSync}
        disabled
      />
    </div>
  );
}

export const InSettings: Story = { render: () => <Settings /> };
