import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Field, Input } from '../Field/Field';
import { Dialog } from './Dialog';

const meta = {
  title: 'Components/Dialog',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Example({ defaultOpen = false, long = false }: { defaultOpen?: boolean; long?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Rename widget"
        description="Shown in the widget's header on every column."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
              Save
            </Button>
          </div>
        }
      >
        <Field label="Title">{(control) => <Input {...control} defaultValue="Stardate" />}</Field>
        {long &&
          Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="mt-4 text-sm text-muted">
              Long content scrolls inside the body while the header and footer stay put. Line{' '}
              {i + 1}.
            </p>
          ))}
      </Dialog>
    </>
  );
}

export const Closed: Story = { render: () => <Example /> };

export const Open: Story = { render: () => <Example defaultOpen /> };

export const ScrollingBody: Story = { render: () => <Example defaultOpen long /> };
