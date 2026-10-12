# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Vite dev server; catalog at /, comparator at /tools/unit-price-comparator
npm run build      # tsc -b type-check + vite build into dist/ (this is the validation step)
npm run preview    # serve the production build (needed to exercise the service worker/offline mode)
npx wrangler deploy  # deploy dist/ to Cloudflare Workers Static Assets (build first)
```

There is no test suite or linter; `npm run build` passing without TypeScript errors is the acceptance gate. Requires Node.js 20+.

## Architecture

Client-only React 19 + TypeScript SPA built with Vite, styled with Tailwind v4 (via `@tailwindcss/vite`, shared classes like `.field`/`.card` live in `src/styles.css`), icons from `lucide-react`. No backend: all state is React state persisted to `localStorage`.

- **Routing is hand-rolled** in `App` ([src/App.tsx](src/App.tsx)): it tracks `window.location.pathname`, listens to `popstate`, and `navigate()` uses `history.pushState`. Routes are `/` (catalog) and `/tools/<tool-id>`. Currently the comparator route is hardcoded and the catalog's `onOpen` ignores which tool was clicked — adding a second tool requires generalizing this dispatch.
- **Tool registry**: [src/config/tools.config.ts](src/config/tools.config.ts) holds `ToolMetadata` used by the catalog search (matches title, description, and tags). The `icon` field is a Lucide icon name string, but the catalog doesn't resolve it yet.
- **All UI is in `src/App.tsx`** (catalog, `Shell` layout with footer, comparator, small field components).
- **Persistence keys** are versioned: `tools.unit-price-comparator.v1` (items + baseline) and `tools.currency.v1` (shared currency preference). Bump the key suffix if the stored shape changes incompatibly; `load()` falls back to defaults on parse failure.
- **PWA**: `vite-plugin-pwa` (`autoUpdate`) in [vite.config.ts](vite.config.ts) defines the manifest and Workbox precache with `navigateFallback: '/index.html'`; registration happens in `src/main.tsx`. Tools must work offline after first load, so avoid runtime network fetches.
- **Hosting**: [wrangler.jsonc](wrangler.jsonc) serves `./dist` with `not_found_handling: "single-page-application"` and no Worker script. Keep that config; only change `compatibility_date` deliberately.

## Project rules (from PROJECT_SPEC.md)

[PROJECT_SPEC.md](PROJECT_SPEC.md) is the source of truth for product requirements, including the comparator's calculation rules and acceptance criteria. Key constraints:

- Mobile-first (375–430 px, up to `max-w-4xl`), 48×48 px minimum touch targets. Numeric inputs use `type="number"`, `step="any"`, `inputMode="decimal"`.
- Default currency is `₴`; supported: `₴ $ € £` and none.
- Unit prices are only compared within the same unit family (weight / volume / count).
- **Every change set must bump the version** (semver, choose the level by scope) and add a matching entry to [CHANGELOG.md](CHANGELOG.md) under `Added` / `Changed` / `Fixed` / `Removed`, written as user-facing summaries.
- The version is also hardcoded in the footer of `Shell` in `src/App.tsx` (`v0.1.1`) — update it together with `package.json`.
