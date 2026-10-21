# Astrometrics

A personal, widget-based dashboard for developers. Web first, Electron later, one TypeScript
codebase. Everyone brings their own API tokens; the app never ships shared keys.

## Running it

Requires Node 24 (`nvm use`) and pnpm 10.

```bash
pnpm install
pnpm dev     # server on 127.0.0.1:4317, web on http://localhost:5173
pnpm start   # production build served by the server at http://127.0.0.1:4317
pnpm storybook  # component workshop on http://localhost:6006
pnpm lint && pnpm typecheck && pnpm test
```

Data lives in `.data/astrometrics.db` (SQLite). Set `ASTROMETRICS_DATA_DIR` to move it.

## How it fits together

```
apps/
  server/        Hono + Drizzle/SQLite, credential store, widget data API
  web/           Vite + React + TanStack Query + dnd-kit
  storybook/     component workshop (stories live next to their components)
packages/
  ui/            theme engine: presets, OKLCH custom palettes, ThemeProvider, Tailwind tokens
  widget-sdk/    widget contract and credential providers
  widgets/       the widgets (`./client` views, `./server` fetchers)
```

- **The local server owns secrets.** Tokens are stored in the OS keychain (service
  `astrometrics`) and attached to outgoing requests by the server. The browser can see whether a
  credential is configured, never its value.
- **A widget never sees a token.** Its server `fetch` gets a `WidgetContext`; `ctx.request(provider,
url)` attaches the credential, but only for providers the widget's manifest declares and only to
  that provider's origins.
- **The server only talks to its own UI.** It binds to `127.0.0.1`, rejects unknown `Host`
  (DNS rebinding) and `Origin` headers, and requires an `X-Astrometrics: 1` header on `/api`, which
  forces a CORS preflight that it never approves.
- **The column decides the view.** Every widget ships a `Main` and a `Compact` view. Widgets in
  the main column render `Main`; widgets in the side column render `Compact`.
- **Server data is cached.** `/api/widgets/:id/data` caches results for the widget's `refreshMs`
  and serves the last good result, marked stale, when a refresh fails.

## Theming

`@astrometrics/ui` builds every theme from five presets (Voyager, Halo-halo, Jeepney, Sampaguita,
Nebula) or one custom accent, in light or dark, with sharp, soft, or round corners. `ThemeProvider`
writes the result to `--am-*` variables on `<html>`; `theme.css` maps them to Tailwind utilities:
`bg-surface`, `bg-raised`, `bg-sunken`, `text-fg`, `text-muted`, `border-line`, `bg-accent` with
`text-on-accent`, `text-accent-ink` for links and icons, `rounded-card|control|chip`,
`shadow-1|2|3`, plus `starfield`, `chamfer`, and `hatch-<color>`. Unit tests hold every preset to
WCAG AA for the pairings the components draw.

## Adding a widget

1. Create `packages/widgets/src/<name>/` with a `manifest.ts` (`defineManifest`), `views.tsx`
   (`Main` and `Compact`), and, if it needs data, a server fetcher.
2. Register it in `packages/widgets/src/client.ts` (`defineClientWidget`) and
   `packages/widgets/src/server.ts` (`manifests`, plus `defineServerWidget` if it fetches).
3. If it needs a new credential, add a provider to `packages/widget-sdk/src/credentials.ts` with its
   auth scheme and allowed origins.

## Roadmap

| Milestone | Scope                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0 ✅     | Monorepo, local server and security guards, keychain credentials, two-column drag-and-drop dashboard, Stardate widget                                   |
| M0.5      | Design foundation: Storybook workshop; semantic theme tokens, presets, light/dark, custom accent in `packages/ui`; restyle the app; Appearance settings |
| M1        | Watchlist (local list), TMDB upcoming releases, TVmaze new episodes for tracked shows                                                                   |
| M2        | PTO tracker: ICS feed, OOO detection, accrual rule, balance                                                                                             |
| M3        | GitHub: review queue, my PRs (checks, review state), assigned issues                                                                                    |
| M4        | Shortcut: my open stories by workflow state                                                                                                             |
| M5        | Polish: widget settings UI, error states, config export/import                                                                                          |
| Later     | Electron app, hosted sync, AI briefing, connections and recommendations, more widgets                                                                   |
