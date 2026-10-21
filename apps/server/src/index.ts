import { serve } from '@hono/node-server';
import { manifests, serverWidgets } from '@astrometrics/widgets/server';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';
import { KeychainCredentialStore } from './credentials/keychain';
import { openDatabase } from './db/client';

const port = Number(process.env.ASTROMETRICS_PORT ?? 4317);
const webDevPort = 5173;
const dataDir =
  process.env.ASTROMETRICS_DATA_DIR ?? fileURLToPath(new URL('../../../.data', import.meta.url));
const production = process.env.NODE_ENV === 'production';

mkdirSync(dataDir, { recursive: true });

const app = createApp({
  db: openDatabase(join(dataDir, 'astrometrics.db')),
  credentials: new KeychainCredentialStore(),
  manifests,
  serverWidgets,
  allowedHosts: [`127.0.0.1:${port}`, `localhost:${port}`],
  allowedOrigins: [
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    ...(production ? [] : [`http://127.0.0.1:${webDevPort}`, `http://localhost:${webDevPort}`]),
  ],
  staticRoot: production ? '../web/dist' : undefined,
});

serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, () => {
  console.log(`Astrometrics server on http://127.0.0.1:${port}`);
});
