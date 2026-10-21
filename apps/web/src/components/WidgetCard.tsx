import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clientWidgets } from '@astrometrics/widgets/client';
import { credentialProviders, type Column } from '@astrometrics/widget-sdk';
import { GripVertical, X } from 'lucide-react';
import { ApiError, type WidgetInstance } from '../lib/api';
import { useRemoveWidget, useWidgetData } from '../lib/queries';

interface WidgetCardProps {
  widget: WidgetInstance;
  column: Column;
  onOpenSettings: () => void;
}

export function WidgetCard({ widget, column, onOpenSettings }: WidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });
  const removeWidget = useRemoveWidget();
  const definition = clientWidgets[widget.type];
  const name = definition?.manifest.name ?? widget.type;

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`rounded-xl border border-edge bg-panel ${isDragging ? 'opacity-60' : ''}`}
    >
      <header className="flex items-center gap-2 border-b border-edge px-3 py-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Move ${name}`}
          className="cursor-grab rounded p-0.5 text-slate-500 hover:text-slate-300 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <h3 className="flex-1 truncate text-sm font-medium text-lcars-gold">{name}</h3>
        <button
          type="button"
          onClick={() => removeWidget.mutate(widget.id)}
          aria-label={`Remove ${name}`}
          className="rounded p-0.5 text-slate-500 hover:text-lcars-red"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="p-4">
        {definition ? (
          <WidgetBody widget={widget} column={column} onOpenSettings={onOpenSettings} />
        ) : (
          <p className="text-sm text-slate-400">Unknown widget type “{widget.type}”.</p>
        )}
      </div>
    </article>
  );
}

function WidgetBody({ widget, column, onOpenSettings }: WidgetCardProps) {
  const { manifest, views } = clientWidgets[widget.type]!;
  const { data, error } = useWidgetData(widget.id, manifest.refreshMs);
  const View = column === 'main' ? views.Main : views.Compact;

  if (
    error instanceof ApiError &&
    error.body?.error === 'missing_credential' &&
    error.body.provider
  ) {
    return (
      <p className="text-sm text-slate-300">
        Connect {credentialProviders[error.body.provider].label} to use this widget.{' '}
        <button type="button" onClick={onOpenSettings} className="text-lcars-blue underline">
          Open settings
        </button>
      </p>
    );
  }
  if (error) return <p className="text-sm text-lcars-red">{error.message}</p>;

  return (
    <>
      <View settings={widget.settings} data={data?.data} />
      {data?.stale && (
        <p className="mt-2 text-xs text-lcars-gold">Showing cached data: {data.error}</p>
      )}
    </>
  );
}
