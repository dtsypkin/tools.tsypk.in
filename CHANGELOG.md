# Changelog

All notable changes to this project are documented below. This summary is based on the repository's previous git commits.

## [0.1.1]

### Added
- Continued product polish for the app shell and main interface.
- Added a footer to the main application layout.

### Changed
- Updated the package version from the previous release to `0.1.1`.
- Refined the main `App` component to better present the site content.

## [0.1.0]

### Added
- Initialized the `tools.tsypk.in` project with Vite, React, and Tailwind CSS.
- Added the project landing page, search catalog UI, and the initial tool registry.
- Added the first tool implementation: the unit price comparator.
- Added the app entry point, global styles, and base TypeScript/Vite configuration.
- Added Cloudflare Workers deployment configuration and static asset setup.
- Added a dedicated `wrangler.jsonc` configuration for deployment.
- Added project documentation, including `README.md`, `PROJECT_SPEC.md`, and repository hygiene files.
- Added public assets and the base PWA manifest and redirect behavior.

### Changed
- Updated the Cloudflare Workers configuration to support static asset hosting and SPA fallback routing.
- Added compatibility guidance for Cloudflare Workers setups.
- Improved deployment guidance and project documentation around compatibility and hosting requirements.

### Notes
- The project was structured around a client-rendered SPA with offline-friendly browser persistence.
- Documentation and configuration were expanded to support deployability on Cloudflare Workers while preserving the app's mobile-first tool experience.
