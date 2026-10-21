import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`);

export const dashboards = sqliteTable('dashboards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
});

export const widgetInstances = sqliteTable(
  'widget_instances',
  {
    id: text('id').primaryKey(),
    dashboardId: text('dashboard_id')
      .notNull()
      .references(() => dashboards.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    column: text('column', { enum: ['main', 'side'] }).notNull(),
    position: integer('position').notNull(),
    settings: text('settings', { mode: 'json' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('widget_instances_dashboard_idx').on(table.dashboardId)],
);

export const fetchCache = sqliteTable('fetch_cache', {
  widgetInstanceId: text('widget_instance_id')
    .primaryKey()
    .references(() => widgetInstances.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
});
