# Astrometrics — agent notes

Read `README.md` first; it describes the architecture and the widget contract.

- Use Node 24 (`.nvmrc`). Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before committing.
- Never send a secret to the browser or log one. Widgets reach credentials only through
  `WidgetContext.request`; don't add another path.
- Don't loosen the `localOnly` middleware in `apps/server/src/security.ts` (Host, Origin, and the
  `X-Astrometrics` header). Every `/api` route sits behind it.
- Every widget must provide both `Main` and `Compact` views.
- Schema changes: edit `apps/server/src/db/schema.ts`, then `pnpm --filter @astrometrics/server
db:generate`, and commit the generated migration.
- Tests: Vitest. Server behavior goes through `createApp` with `openDatabase(':memory:')` and
  `MemoryCredentialStore`; never touch the real keychain in tests.
