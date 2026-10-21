import { clientWidgets } from '@astrometrics/widgets/client';
import type { Column } from '@astrometrics/widget-sdk';
import { Plus } from 'lucide-react';
import { useRef } from 'react';
import { useAddWidget } from '../lib/queries';

export function AddWidgetMenu({ column }: { column: Column }) {
  const addWidget = useAddWidget();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="relative">
      <summary
        aria-label={`Add widget to ${column} column`}
        className="flex cursor-pointer list-none items-center rounded-md p-1 text-slate-400 hover:bg-panel-raised hover:text-slate-200"
      >
        <Plus className="size-4" />
      </summary>
      <ul className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-edge bg-panel-raised p-1 shadow-xl">
        {Object.values(clientWidgets).map(({ manifest }) => (
          <li key={manifest.type}>
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left hover:bg-edge"
              onClick={() => {
                addWidget.mutate({ type: manifest.type, column });
                detailsRef.current?.removeAttribute('open');
              }}
            >
              <span className="block text-sm">{manifest.name}</span>
              <span className="block text-xs text-slate-400">{manifest.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
