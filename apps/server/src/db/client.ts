import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** The single user of a local install. Hosting replaces it with signed-in users. */
export const LOCAL_USER_ID = 'local';

export function openDatabase(filename: string) {
  const sqlite = new Database(filename);
  sqlite.pragma('journal_mode = WAL');
  const db = drizzle(sqlite, { schema });
  // Migrations that rebuild a table drop the old one, which would cascade-delete its children
  // with foreign keys on. The migrator runs in a transaction, where SQLite ignores this pragma,
  // so it has to be off before migrating.
  sqlite.pragma('foreign_keys = OFF');
  migrate(db, { migrationsFolder });
  const violations = sqlite.pragma('foreign_key_check') as unknown[];
  if (violations.length > 0) {
    throw new Error(`Migration left ${violations.length} foreign key violations.`);
  }
  sqlite.pragma('foreign_keys = ON');
  return db;
}

export type Db = ReturnType<typeof openDatabase>;
