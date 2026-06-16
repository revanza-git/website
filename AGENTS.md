# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

This is Revanza Raytama's personal portfolio site. It is a static Astro app with Tailwind CSS, local JSON/Markdown content, and optional Sanity CMS integration for blog data.

Primary stack:

- Astro 4 static output
- Tailwind CSS with `darkMode: "class"`
- TypeScript config based on `astro/tsconfigs/strict`
- Sanity client and schemas for CMS-backed content
- Biome for linting and import organization
- Node's built-in test runner for integration regression tests
- Playwright for production monitoring checks

## Repository Layout

- `src/pages/` contains Astro routes. Dynamic project and blog pages live here.
- `src/layouts/` contains shared page layouts.
- `src/components/` contains reusable Astro components, including homepage sections.
- `src/assets/css/main.css` contains Tailwind directives and small global styles.
- `src/assets/js/main.js` contains client-side behavior such as dark-mode toggling.
- `src/collections/` contains local JSON data for projects, experiences, and menu entries.
- `src/content/post/` contains local Markdown posts for Astro content collections.
- `src/lib/sanity.ts` contains Sanity client helpers and GROQ queries.
- `src/schemas/` contains Sanity document schemas.
- `public/` contains static assets served at site-root paths such as `/assets/images/...`.
- `tests/integration/` contains Node test-runner regression tests.
- `tests/monitoring/` contains Playwright checks against the production site.
- `docs/` contains release, QA, and monitoring notes.

## Local Setup

Use Node 20. The repo has `.node-version` set to `v20` and is configured for npm.

Install dependencies with:

```bash
npm ci
```

Copy environment defaults before local development:

```bash
cp .env.example .env
```

Required Sanity variables:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET` defaults to `production`

Optional variables include `FORMSPREE_ENDPOINT`, `SITE_URL`, `FEED_URL`, `BLOG_URL`, `ENABLE_HTML_INJECT`, `HEADER_INJECT`, and `FOOTER_INJECT`.

Do not commit real `.env`, `.env.local`, secrets, tokens, or production credentials.

## Development Commands

- `npm run dev` starts the Astro dev server.
- `npm start` is an alias for `npm run dev`.
- `npm run docker:dev` starts the dev server through Docker Compose on port `4321`.
- `npm run docker:dev:down` stops the Docker Compose stack.
- `npm run sanity:dev` starts Sanity Studio.
- `npm run preview` previews a production build.

The local site normally runs at `http://localhost:4321`.

## Validation Commands

Use the narrowest useful validation for the change:

- `npm run check` runs Biome lint checks.
- `npm run test:integration` runs repository regression tests.
- `npm run test` currently aliases integration tests.
- `npm run build` runs `astro check` and `astro build`.
- `npm run build:memory` runs the production build with increased Node memory.
- `npm run test:monitoring` runs Playwright checks against `https://revanza.vercel.app`.

Run `npm run build` before finishing changes that affect routes, layouts, content rendering, Sanity data, or config. Run `npm run test:integration` for redirect, security, layout injection, or anchor-link changes.

`npm run check:fix` mutates files. Use it only when formatting/lint fixes are intended.

## Code Style

- Prefer existing Astro component and layout patterns.
- Use Tailwind utility classes for page and component styling.
- Keep global CSS small and intentional in `src/assets/css/main.css`.
- Use the `@/*` alias for imports from `src` when it improves readability.
- Keep static asset references rooted at `/assets/...` for files under `public/assets/...`.
- For external links opened with `target="_blank"`, include `rel="noopener noreferrer"`. The integration test enforces this.
- Preserve the explicit `ENABLE_HTML_INJECT === "true"` gate in `src/layouts/main.astro`.
- Keep comments sparse and useful.
- Follow the existing mix of tabs/spaces as formatted by the touched file; do not reformat unrelated files.

## Content Guidelines

Projects are primarily maintained in `src/collections/projects.json`. Keep each project entry internally consistent:

- `slug` should match its dynamic route.
- `url` should normally be `/projects/<slug>`.
- `image` and `screenshots[].src` should point to files in `public/assets/images/projects/...`.
- `links` should include only public, working URLs.
- `stacks`, `problem`, `solution`, `proof`, and `result` drive the detail page content.

Navigation entries live in `src/collections/menu.json`.

Local Markdown posts live in `src/content/post/` and must match the schema in `src/content/config.js`:

- `title`
- `description`
- `dateFormatted`

Sanity-backed post helpers live in `src/lib/sanity.ts`; keep GROQ query fields aligned with the `Post` interface.

## UI and Accessibility Notes

- Maintain light and dark mode behavior; dark mode is class-based on the root HTML element.
- Keep responsive layouts usable on mobile and desktop.
- Use semantic headings and meaningful `alt` text for portfolio images.
- Avoid adding hidden runtime dependencies for static pages unless Astro hydration is truly needed.
- Keep hero and project imagery inspectable; do not replace content images with purely decorative assets.

## Testing Notes

The integration suite checks:

- Vercel redirects for legacy `/posts` and `/post/:slug` routes.
- Redirect pages' canonical and noindex semantics.
- `target="_blank"` link security attributes.
- HTML injection remaining gated by `ENABLE_HTML_INJECT`.

The monitoring suite opens production URLs and fails on page errors, console errors, or failed requests. It requires network access and reflects the deployed site, not necessarily local changes.

## Deployment

The main site is configured for Vercel:

- Framework preset: Astro
- Build command: `npm run build:memory`
- Output directory: `dist`
- Install command: `npm ci`

`vercel.json` contains redirect and deployment configuration. Be careful when changing it because regression tests assert specific redirect behavior.

## Agent Safety

- Check `git status --short` before editing and avoid overwriting user changes.
- Do not edit generated output in `dist/`, `.astro/`, `.vercel/`, `test-results/`, or `node_modules/`.
- Do not modify `.env` or `.env.local` unless explicitly asked.
- Keep changes narrowly scoped to the requested task.
- Prefer `rg` for searching.
- Use `package-lock.json` with npm; do not introduce another package manager lockfile.
- If adding dependencies, justify why they are needed and update `package-lock.json`.
