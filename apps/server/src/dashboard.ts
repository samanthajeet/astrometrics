import type { Column } from '@astrometrics/widget-sdk';
import { and, asc, eq, max } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Db } from './db/client';
import { dashboards, widgetInstances } from './db/schema';

export interface Layout {
  main: string[];
  side: string[];
}

export function getOrCreateDashboard(db: Db, userId: string) {
  const existing = db
    .select()
    .from(dashboards)
    .where(eq(dashboards.userId, userId))
    .orderBy(asc(dashboards.createdAt))
    .get();
  if (existing) return existing;

  const dashboard = { id: randomUUID(), userId, name: 'Bridge' };
  db.transaction((tx) => {
    tx.insert(dashboards).values(dashboard).run();
    tx.insert(widgetInstances)
      .values({
        id: randomUUID(),
        dashboardId: dashboard.id,
        type: 'stardate',
        column: 'side',
        position: 0,
        settings: {},
      })
      .run();
  });
  return db.select().from(dashboards).where(eq(dashboards.id, dashboard.id)).get()!;
}

export function listWidgets(db: Db, dashboardId: string) {
  return db
    .select({
      id: widgetInstances.id,
      type: widgetInstances.type,
      column: widgetInstances.column,
      position: widgetInstances.position,
      settings: widgetInstances.settings,
    })
    .from(widgetInstances)
    .where(eq(widgetInstances.dashboardId, dashboardId))
    .orderBy(asc(widgetInstances.column), asc(widgetInstances.position))
    .all();
}

export function addWidget(
  db: Db,
  dashboardId: string,
  widget: { type: string; column: Column; settings: unknown },
) {
  return db.transaction((tx) => {
    const last = tx
      .select({ position: max(widgetInstances.position) })
      .from(widgetInstances)
      .where(
        and(
          eq(widgetInstances.dashboardId, dashboardId),
          eq(widgetInstances.column, widget.column),
        ),
      )
      .get();
    const row = {
      id: randomUUID(),
      dashboardId,
      type: widget.type,
      column: widget.column,
      position: (last?.position ?? -1) + 1,
      settings: widget.settings,
    };
    tx.insert(widgetInstances).values(row).run();
    return row;
  });
}

export function removeWidget(db: Db, dashboardId: string, id: string): boolean {
  const result = db
    .delete(widgetInstances)
    .where(and(eq(widgetInstances.id, id), eq(widgetInstances.dashboardId, dashboardId)))
    .run();
  return result.changes > 0;
}

/** Returns false when the layout doesn't name exactly the dashboard's widgets. */
export function setLayout(db: Db, dashboardId: string, layout: Layout): boolean {
  const ids = [...layout.main, ...layout.side];
  const current = new Set(listWidgets(db, dashboardId).map((w) => w.id));
  if (ids.length !== current.size || new Set(ids).size !== ids.length) return false;
  if (!ids.every((id) => current.has(id))) return false;

  db.transaction((tx) => {
    for (const column of ['main', 'side'] as const) {
      layout[column].forEach((id, position) => {
        tx.update(widgetInstances)
          .set({ column, position })
          .where(eq(widgetInstances.id, id))
          .run();
      });
    }
  });
  return true;
}
