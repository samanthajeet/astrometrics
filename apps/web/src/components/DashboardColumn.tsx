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

export function DashboardColumn({ column, widgets, onOpenSettings }: DashboardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <section aria-label={`${titles[column]} column`} className="flex min-w-0 flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-widest text-lcars-lavender uppercase">
          {titles[column]}
        </h2>
        <AddWidgetMenu column={column} />
      </header>
      <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-32 flex-col gap-4 rounded-xl ${
            widgets.length === 0 ? 'border border-dashed border-edge' : ''
          } ${isOver ? 'bg-panel/50' : ''}`}
        >
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              column={column}
              onOpenSettings={onOpenSettings}
            />
          ))}
          {widgets.length === 0 && (
            <p className="m-auto text-sm text-slate-500">Drag a widget here</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
