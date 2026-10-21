import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { LOCAL_USER_ID, openDatabase } from '../src/db/client';
import { getOrCreateDashboard, listWidgets } from '../src/dashboard';

const migrations = fileURLToPath(new URL('../drizzle', import.meta.url));
let dir: string;

afterEach(() => rmSync(dir, { recursive: true, force: true }));

/** A database as M0 left it: only the first migration, with a dashboard and two widgets. */
function m0Database(file: string) {
  const folder = join(dir, 'm0');
  mkdirSync(join(folder, 'meta'), { recursive: true });
  const journal = JSON.parse(readFileSync(join(migrations, 'meta/_journal.json'), 'utf8'));
  const first = journal.entries[0];
  cpSync(join(migrations, `${first.tag}.sql`), join(folder, `${first.tag}.sql`));
  writeFileSync(
    join(folder, 'meta/_journal.json'),
    JSON.stringify({ ...journal, entries: [first] }),
  );

  const sqlite = new Database(file);
  sqlite.pragma('foreign_keys = ON');
  migrate(drizzle(sqlite), { migrationsFolder: folder });
  sqlite.exec(`
    INSERT INTO dashboards (id, name) VALUES ('d1', 'Bridge');
    INSERT INTO widget_instances (id, dashboard_id, type, "column", position, settings)
      VALUES ('w1', 'd1', 'stardate', 'side', 0, '{}'), ('w2', 'd1', 'stardate', 'main', 0, '{}');
  `);
  sqlite.close();
}

describe('migrations', () => {
  it('gives existing dashboards to the local user without losing their widgets', () => {
    dir = mkdtempSync(join(tmpdir(), 'astrometrics-'));
    const file = join(dir, 'astrometrics.db');
    m0Database(file);

    const db = openDatabase(file);
    const dashboard = getOrCreateDashboard(db, LOCAL_USER_ID);

    expect(dashboard).toMatchObject({ id: 'd1', userId: LOCAL_USER_ID });
    expect(listWidgets(db, 'd1').map((w) => w.id)).toEqual(['w2', 'w1']);
  });
});
