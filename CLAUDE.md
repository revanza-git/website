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
npm run build                            # astro check + astro build (needs SANITY_PROJECT_ID, see below)
npm run test:monitoring                  # Playwright against the live site, not local code
```

Dependencies inside the Compose container live in an anonymous volume. After changing package.json, rebuild the image (`docker compose up --build`); editing files alone is not enough.

## Architecture

**Two content sources, one static build.** Everything is pre-rendered by Astro at build time.

- Local JSON in `src/collections/` drives the home page, `/projects`, `/projects/[slug]` and `/about`. `projects.json` is the single source for case studies: its array order sets the "Case study 01 / 14" numbering and the "Next case study" link in `src/pages/projects/[slug].astro`.
- Sanity drives the blog: `/blog`, `/blog/[slug]`, `/rss.xml`, and the `posts-loop` component. All of it goes through `src/lib/sanity.ts`.
- `src/content/post/*.md` is an Astro content collection (schema in `src/content/config.js`) that no route currently renders. `src/portfolioData.js` is also unreferenced. Treat both as legacy.

**Sanity is a build-time hard dependency.** `createClient` in `src/lib/sanity.ts` throws at import if `SANITY_PROJECT_ID` is empty, so any route that imports it returns 500 in dev and `astro build` fails inside `getStaticPaths`. The home page and project pages do not import it and keep working. The Studio config (`sanity.config.ts`, `sanity.cli.ts`) hardcodes the project id; the site reads it from env, exposed through `envPrefix: ["SANITY_"]` in `astro.config.mjs`. Astro does not load the root `vite.config.ts`; the `@/*` alias comes from `tsconfig.json` paths.

**Two layouts with different jobs.**

- `src/layouts/main.astro` is the real site shell: Header/Footer, SEO and Open Graph tags, canonical URL from `Astro.site`, Person JSON-LD on `/` only, the pre-paint dark-mode script, `<ViewTransitions />`, Google Fonts, and the `ENABLE_HTML_INJECT` gate. Props: `title`, `description`, `image`, `imageAlt`, `type`. Case-study pages pass `image` only when it is PNG/JPEG because social cards reject WebP.
- `src/layouts/Layout.astro` is a bare `<html>` shell used only by the Sanity blog pages. Those pages still use the old neutral/blue Tailwind palette rather than the design tokens, so they look different from the rest of the site. `post.astro` wraps `main.astro` for Markdown frontmatter.

**Design tokens.** `src/assets/css/main.css` defines RGB triplets (`--paper`, `--ink`, `--ink-2`, `--muted`, `--rule`, `--accent`, `--card`) that `tailwind.config.mjs` maps to color utilities such as `bg-paper`, `text-ink`, `border-rule`. Dark mode flips the variables under `.dark`, so components rarely need `dark:` variants. Shared component classes live in the same file: `.label`, `.link-underline`, `.btn-ink`, `.btn-line`, `.figure-frame`. Fonts are `font-serif` (Newsreader), `font-sans` (Instrument Sans), `font-mono` (JetBrains Mono).

**Client JS.** `src/assets/js/main.js` is the only script. Pages use Astro view transitions (`<ViewTransitions />` in `main.astro`), so its set-up runs on `astro:page-load`, which fires on the first load and after every client-side navigation: header border on scroll, `aria-current` on `a[data-nav]` links, the `#darkToggle` handler that persists `dark_mode` in localStorage, and the `[data-reveal]` IntersectionObserver. The swap replaces `<html>` attributes, so an `astro:after-swap` listener re-applies the `dark` class and adds `swapped`, which turns off the `.rise` entrance animation defined in `main.css`. The matching pre-paint read lives in `main.astro`, and the header uses `transition:animate="none"` so it stays still while the page cross-fades.

**Legacy blog URLs are redirected twice.** `vercel.json` issues 308s for `/posts` and `/post/:slug` in production, and `src/pages/posts.astro` plus `src/pages/post/[slug].astro` are meta-refresh fallbacks with canonical and noindex. The integration test asserts both, so change them together.

**Replacing a file under `public/` needs a cache bust.** Vercel serves every non-HTML static asset with `Cache-Control: public, max-age=31536000, immutable`, so browsers that already fetched a file never re-request it. When you replace a file in place (the resume PDF, a project image), bump the `?v=` query on its links. `vercel.json` overrides the header to `must-revalidate` for `/assets/documents/*` only; images are still immutable.

**Formatting.** `biome.json` only lints (`biome lint`); it does not format. `.editorconfig` says 2 spaces but most `.json`, `.ts` and `.js` files use tabs while `.astro` files use spaces. Match the file you touch.

## Commit rules

- Before every commit, check whether the change makes `README.md`, `CLAUDE.md`, `AGENTS.md` or `.gitignore` stale (new commands, env vars, routes, content rules, generated files). Update them in the same commit when they are; leave them alone when they are not.
- Do not add `Co-Authored-By`, "Generated with Claude Code", or any other AI attribution to commit messages or pull request descriptions. The author is the repository owner.
