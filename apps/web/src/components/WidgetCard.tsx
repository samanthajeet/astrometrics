import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clientWidgets } from '@astrometrics/widgets/client';
import type { Column } from '@astrometrics/widget-sdk';
import { ApiError, type WidgetInstance } from '../lib/api';
import { useRemoveWidget, useWidgetData } from '../lib/queries';
import { DragHandle, WidgetFrame } from './WidgetFrame';
import {
  ErrorNotice,
  MissingCredentialNotice,
  StaleNotice,
  UnknownWidgetNotice,
} from './WidgetNotices';

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
  const title = definition?.manifest.name ?? widget.type;

  return (
    <WidgetFrame
      ref={setNodeRef}
      title={title}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      dimmed={isDragging}
      onRemove={() => removeWidget.mutate(widget.id)}
      handle={
        <DragHandle
          ref={setActivatorNodeRef}
          label={`Move ${title}`}
          {...attributes}
          {...listeners}
        />
      }
    >
      {definition ? (
        <WidgetBody widget={widget} column={column} onOpenSettings={onOpenSettings} />
      ) : (
        <UnknownWidgetNotice type={widget.type} />
      )}
    </WidgetFrame>
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
      <MissingCredentialNotice provider={error.body.provider} onOpenSettings={onOpenSettings} />
    );
  }
  if (error) return <ErrorNotice message={error.message} />;

  return (
    <>
      <View settings={widget.settings} data={data?.data} />
      {data?.stale && <StaleNotice message={data.error} />}
    </>
  );
}
