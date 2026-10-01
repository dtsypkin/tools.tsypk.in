# tools.tsypk.in

A fast, mobile-first collection of everyday tools that works offline. The first tool, **Unit Price Comparator**, helps shoppers compare package prices by weight, volume, or count.

## Features

- Searchable tool catalog
- Unit-price comparison for g/kg, ml/L, and items
- Best-value highlights and percentage differences
- Currency choices: ₴, $, €, £, or none
- Local browser persistence for comparisons and preferences
- Installable PWA with offline support
- Cloudflare Workers Static Assets configuration

## Requirements

- Node.js 20 or newer
- npm

## Develop

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The catalog is available at `/`; the comparator is at `/tools/unit-price-comparator`.

## Validate and build

```bash
npm run build
npm run preview
```

`npm run build` type-checks the app and writes the deployable static site to `dist/`.

## Deploy to Cloudflare Workers

The included `wrangler.jsonc` deploys `dist/` as static assets with an SPA fallback. Build the project, then deploy using your authenticated Cloudflare Wrangler workflow:

```bash
npm run build
npx wrangler deploy
```

When intentionally updating the Workers configuration, update `compatibility_date` in `wrangler.jsonc` and validate the build before deploying.

## Project notes

- Product and technical requirements: [PROJECT_SPEC.md](PROJECT_SPEC.md)
- Tool metadata: `src/config/tools.config.ts`
- The app stores comparison data only in the browser’s `localStorage`; it does not use a backend.

## License

This project is licensed under the [GNU GPL v3.0](LICENSE).
