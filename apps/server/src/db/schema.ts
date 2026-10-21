import { watchlistKinds, watchlistStatuses } from '@astrometrics/widget-sdk';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const createdAt = (name = 'created_at') =>
  integer(name, { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
});

export const dashboards = sqliteTable(
  'dashboards',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('dashboards_user_idx').on(table.userId)],
);

export const watchlistItems = sqliteTable(
  'watchlist_items',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: watchlistKinds }).notNull(),
    tmdbId: integer('tmdb_id').notNull(),
    imdbId: text('imdb_id'),
    title: text('title').notNull(),
    year: integer('year'),
    posterPath: text('poster_path'),
    status: text('status', { enum: watchlistStatuses }).notNull().default('want'),
    addedAt: createdAt('added_at'),
  },
  (table) => [
    uniqueIndex('watchlist_items_user_title_idx').on(table.userId, table.kind, table.tmdbId),
  ],
);

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
