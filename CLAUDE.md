# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AGENTS.md holds the shared agent guidance (layout, commands, content rules, safety). This file adds what you need beyond it: the architecture that spans several files, the non-obvious gotchas, and the repository's commit rules.

## Commands

```bash
npm ci                                   # Node 20, npm only
npm run docker:dev                       # dev server in Compose on http://localhost:4321 (bind-mounted; hot reload)
npm run dev                              # same, without Docker
npm run check                            # Biome lint (read-only); check:fix mutates
npm run test:integration                 # Node test runner, tests/integration/*.test.js
node --test --test-name-pattern="noopener" tests/integration/release-regression.test.js   # one test
npm run build                            # astro check + astro build (SANITY_PROJECT_ID optional, see below)
npm run test:monitoring                  # Playwright against the live site, not local code
```

Dependencies inside the Compose container live in an anonymous volume. After changing package.json, rebuild the image (`docker compose up --build`); editing files alone is not enough.

## Architecture

**Two content sources, one static build.** Everything is pre-rendered by Astro at build time.

- Local JSON in `src/collections/` drives the home page, `/projects`, `/projects/[slug]` and `/about`. `projects.json` is the single source for case studies: its array order sets the "Case study 01 / 14" numbering and the "Next case study" link in `src/pages/projects/[slug].astro`. `home.json` and `about.json` hold the list-shaped copy of those two pages (metrics, practice areas, strengths, contact links); paragraph prose stays in the page file.
- Sanity drives the blog: `/blog`, `/blog/[slug]` and `/rss.xml`. All of it goes through `src/lib/sanity.ts`. The Studio that edits that content is a separate app sharing this package: `sanity.config.ts` and `sanity.cli.ts` must stay at the repo root because the Sanity CLI reads them from the working directory, and its schemas live in `studio/schemas/`. `.sanity/` is its generated cache and is not tracked.

**Sections are folders.** `src/pages/projects/` and `src/pages/blog/` each hold an `index.astro` and a `[slug].astro`. The legacy redirect stubs `posts.astro` and `post/[slug].astro` are the only flat routes because they mirror the old URLs.

**Sanity is a build-time dependency with a fallback.** `src/lib/sanity.ts` creates the client at import time from `SANITY_PROJECT_ID`, falling back to the Studio project id hardcoded in `sanity.config.ts` and `sanity.cli.ts`, so `/blog`, `/rss.xml`, the `/post/:slug` redirects and `astro build` work without a `.env`. Set the env var only to point at another project; it is exposed through `envPrefix: ["SANITY_"]` in `astro.config.mjs`. If the client ever fails to initialise, every route that imports it returns 500, and the dev server pushes that error to every open tab as an overlay, so it can appear on top of the home page. The `@/*` alias comes from `tsconfig.json` paths; there is no separate Vite config.

**One layout.** `src/layouts/main.astro` is the shell for every page, blog included: Header/Footer, SEO and Open Graph tags, canonical URL from `Astro.site`, Person JSON-LD on `/` only, the pre-paint dark-mode script, `<ViewTransitions />`, Google Fonts, and the `ENABLE_HTML_INJECT` gate. Props: `title`, `description`, `image`, `imageAlt`, `type`. Social cards reject WebP, so case-study pages pass `image` only when it is PNG/JPEG and blog posts ask the Sanity CDN for a JPEG rendition. Blog bodies render through `@tailwindcss/typography` (`prose` classes) inside that shell.

**Design tokens.** `src/assets/css/main.css` defines RGB triplets (`--paper`, `--ink`, `--ink-2`, `--muted`, `--rule`, `--accent`, `--card`) that `tailwind.config.mjs` maps to color utilities such as `bg-paper`, `text-ink`, `border-rule`. Dark mode flips the variables under `.dark`, so components rarely need `dark:` variants. Shared component classes live in the same file: `.label`, `.link-underline`, `.btn-ink`, `.btn-line`, `.figure-frame`. Fonts are `font-serif` (Newsreader), `font-sans` (Instrument Sans), `font-mono` (JetBrains Mono).

**Client JS.** `src/assets/js/main.js` is the only script. Pages use Astro view transitions (`<ViewTransitions />` in `main.astro`), so its set-up runs on `astro:page-load`, which fires on the first load and after every client-side navigation: header border on scroll, `aria-current` on `a[data-nav]` links, the `#darkToggle` handler that persists `dark_mode` in localStorage, and the `[data-reveal]` IntersectionObserver. The swap replaces `<html>` attributes, so an `astro:after-swap` listener re-applies the `dark` class and adds `swapped`, which turns off the `.rise` entrance animation defined in `main.css`. The matching pre-paint read lives in `main.astro`, and the header uses `transition:animate="none"` so it stays still while the page cross-fades.

**Legacy blog URLs are redirected twice.** `vercel.json` issues 308s for `/posts` and `/post/:slug` in production, and `src/pages/posts.astro` plus `src/pages/post/[slug].astro` are meta-refresh fallbacks with canonical and noindex. The integration test asserts both, so change them together.

**Replacing a file under `public/` needs a cache bust.** Vercel serves every non-HTML static asset with `Cache-Control: public, max-age=31536000, immutable`, so browsers that already fetched a file never re-request it. When you replace a file in place (the resume PDF, a project image), bump the `?v=` query on its links. `vercel.json` overrides the header to `must-revalidate` for `/assets/documents/*` only; images are still immutable.

**Docs.** `docs/` holds living guides and the backlog. `docs/releases/<date>/` holds the records of one release and is never edited afterwards; start a new dated folder for the next one.

**Formatting.** `biome.json` only lints (`biome lint`); it does not format. `.editorconfig` says 2 spaces but most `.json`, `.ts` and `.js` files use tabs while `.astro` files use spaces. Match the file you touch.

## Commit rules

- Before every commit, check whether the change makes `README.md`, `CLAUDE.md`, `AGENTS.md` or `.gitignore` stale (new commands, env vars, routes, content rules, generated files). Update them in the same commit when they are; leave them alone when they are not.
- Do not add `Co-Authored-By`, "Generated with Claude Code", or any other AI attribution to commit messages or pull request descriptions. The author is the repository owner.
