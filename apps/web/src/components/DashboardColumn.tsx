import { cx, Eyebrow } from '@astrometrics/ui';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@astrometrics/widget-sdk';
import type { WidgetInstance } from '../lib/api';
import { AddWidgetMenu } from './AddWidgetMenu';
import { WidgetCard } from './WidgetCard';

interface DashboardColumnProps {
  column: Column;
  widgets: WidgetInstance[];
  onOpenSettings: () => void;
}

const titles: Record<Column, string> = { main: 'Main', side: 'Side' };
const views: Record<Column, string> = { main: 'Main view', side: 'Compact view' };

export function DashboardColumn({ column, widgets, onOpenSettings }: DashboardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <section aria-label={`${titles[column]} column`} className="flex min-w-0 flex-col gap-4">
      <header className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2">
          <span
            aria-hidden
            className={cx(
              'size-2.5 rounded-[3px]',
              column === 'main' ? 'bg-accent' : 'bg-accent-2',
            )}
          />
          <Eyebrow>
            {titles[column]} column · {views[column]}
          </Eyebrow>
        </h2>
        <AddWidgetMenu column={column} />
      </header>
      <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cx(
            'flex min-h-32 flex-col gap-4 rounded-card transition-colors duration-150',
            widgets.length === 0 && 'border border-dashed border-line',
            isOver && 'bg-[color-mix(in_oklab,var(--am-accent)_8%,transparent)]',
          )}
        >
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              column={column}
              onOpenSettings={onOpenSettings}
            />
          ))}
          {widgets.length === 0 && <p className="m-auto text-sm text-muted">Drag a widget here</p>}
        </div>
      </SortableContext>
    </section>
  );
}
