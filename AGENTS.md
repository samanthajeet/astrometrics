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
- Style with the semantic utilities from `packages/ui/src/styles/theme.css` (`bg-raised`,
  `text-muted`, `text-on-accent`, ...), never raw hex or Tailwind's palette, so every theme applies.
- A new or changed preset must pass `packages/ui/src/theme/theme.test.ts`; nudge OKLCH lightness,
  not hue, to fix a failing pairing.
- Reach for `@astrometrics/ui` components before writing new markup. Interactive primitives (menu,
  tooltip, tabs, popover, switch, segmented control) use Radix, styled with our tokens.
- Tone-driven classes come from the maps in `packages/ui/src/components/tones.ts`; Tailwind only
  sees literal class strings, so never build them with template strings.
- A new component gets stories for every variant and state in all themes, with no accessibility
  violations.
