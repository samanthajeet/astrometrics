import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Column } from '@astrometrics/widget-sdk';
import { useMemo, useState } from 'react';
import type { Layout, WidgetInstance } from '../lib/api';
import { useDashboard, useSaveLayout } from '../lib/queries';
import { DashboardColumn } from './DashboardColumn';

function toLayout(widgets: WidgetInstance[]): Layout {
  const byPosition = (column: Column) =>
    widgets
      .filter((w) => w.column === column)
      .sort((a, b) => a.position - b.position)
      .map((w) => w.id);
  return { main: byPosition('main'), side: byPosition('side') };
}

function findColumn(layout: Layout, id: UniqueIdentifier): Column | undefined {
  if (id === 'main' || id === 'side') return id;
  if (layout.main.includes(String(id))) return 'main';
  if (layout.side.includes(String(id))) return 'side';
  return undefined;
}

export function Dashboard({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { data: dashboard, isPending, error } = useDashboard();
  const saveLayout = useSaveLayout();
  const [dragLayout, setDragLayout] = useState<Layout | null>(null);

  const serverLayout = useMemo(() => toLayout(dashboard?.widgets ?? []), [dashboard]);
  const layout = dragLayout ?? serverLayout;
  const widgetsById = useMemo(() => new Map(dashboard?.widgets.map((w) => [w.id, w])), [dashboard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setDragLayout((current) => {
      const base = current ?? serverLayout;
      const from = findColumn(base, active.id);
      const to = findColumn(base, over.id);
      if (!from || !to || from === to) return base;

      const overIndex = base[to].indexOf(String(over.id));
      const insertAt = overIndex === -1 ? base[to].length : overIndex;
      const target = [...base[to]];
      target.splice(insertAt, 0, String(active.id));
      return {
        ...base,
        [from]: base[from].filter((id) => id !== active.id),
        [to]: target,
      } as Layout;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const base = dragLayout ?? serverLayout;
    setDragLayout(null);
    if (!over) return;

    const column = findColumn(base, active.id);
    let next = base;
    if (column && column === findColumn(base, over.id)) {
      const ids = base[column];
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (to !== -1 && from !== to) next = { ...base, [column]: arrayMove(ids, from, to) };
    }

    const changed = (['main', 'side'] as const).some(
      (c) => next[c].join() !== serverLayout[c].join(),
    );
    if (changed) saveLayout.mutate(next);
  };

  if (isPending) return <p className="p-8 text-slate-400">Loading…</p>;
  if (error)
    return <p className="p-8 text-lcars-red">Couldn't reach the server: {error.message}</p>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragLayout(null)}
    >
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {(['main', 'side'] as const).map((column) => (
          <DashboardColumn
            key={column}
            column={column}
            widgets={layout[column].flatMap((id) => widgetsById.get(id) ?? [])}
            onOpenSettings={onOpenSettings}
          />
        ))}
      </div>
    </DndContext>
  );
}
