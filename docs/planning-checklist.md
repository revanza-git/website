# Project Planning and Execution Checklist

Use this file as a single source of truth for planning, execution, validation, and release.

---

## 0. Document Control
- Project name: Revanza Web Portfolio (Astro + Sanity)
- Plan owner: Revanza Raytama
- Contributors: Revanza Raytama, Codex
- Status: `Final QA Completed (Local) / Release Pending`
- Start date: 2026-02-17
- Target release date: 2026-02-25
- Last updated: 2026-02-18 (fallback + post-release monitoring checks executed)

## 1. Problem and Objective
### 1.1 Problem Statement
Current project works and builds, but there are security, accessibility, and maintainability gaps:
- Chatbot and blog rendering paths use unsafe HTML injection patterns.
- Multiple links with `target="_blank"` miss `rel="noopener noreferrer"`.
- Some interactive UI uses non-semantic click handlers (`div`/`onclick`) harming keyboard accessibility.
- Tooling has drift (unused dependencies, check scripts mutating code, audit blocked by registry).
- Performance settings are not production-optimized (`minify: false`).

### 1.2 Objective
- Primary objective: Improve project safety, code quality, and release reliability without changing core UI/feature behavior.
- Secondary objectives:
  - Reduce security risk from XSS-like vectors.
  - Improve accessibility baseline.
  - Clean deployment/tooling pipeline for stable ongoing delivery.

### 1.3 Success Metrics
- Metric 1: 0 known unsafe `innerHTML`/`set:html` usage on untrusted input.
- Metric 2: 100% `target="_blank"` links include `rel="noopener noreferrer"`.
- Metric 3: `npm run build` and lint/check pass with no critical warnings from project source.

## 2. Scope and Boundaries
### 2.1 In Scope
- [x] Security hardening for chatbot and content rendering.
- [x] Accessibility fixes for clickable/non-semantic elements and external links.
- [x] Tooling and configuration cleanup (scripts, tsconfig, dependency hygiene).
- [x] Production build optimization and route consistency cleanup.

### 2.2 Out of Scope
- [ ] Full UI redesign.
- [ ] Migration away from Astro/Sanity stack.
- [ ] New major features unrelated to findings.

### 2.3 Constraints and Assumptions
- Constraint: Must keep existing portfolio behavior and content.
- Constraint: Must stay compatible with Docker dev and Vercel production flow.
- Assumption: Environment variables are controlled by project owner.
- Assumption: Existing Sanity content schemas remain unchanged in this cycle.

## 3. Requirements
### 3.1 Functional Requirements
- [x] FR-01: Chatbot must render messages safely (no unsafe HTML injection).
- [x] FR-02: Blog post rendering from Sanity must sanitize/escape unsafe content correctly.
- [x] FR-03: Navigation and post cards must remain functional with keyboard support.
- [x] FR-04: External links must include secure `rel` attributes.

### 3.2 Non-Functional Requirements
- [x] Performance: Production build uses minification and keeps acceptable bundle size.
- [x] Security: Eliminate direct injection paths for untrusted content.
- [x] Reliability: Build, check, and release steps are deterministic.
- [x] Accessibility: Interactive controls are keyboard and screen-reader friendly.
- [x] Maintainability: Remove unused dependencies and reduce duplicate route logic.

### 3.3 Acceptance Criteria
- [x] AC-01: No untrusted data is written via raw `innerHTML` or unsanitized `set:html`.
- [x] AC-02: All `target="_blank"` links have `rel="noopener noreferrer"`.
- [x] AC-03: `npm run build` succeeds; source-level warnings are reduced and documented.
- [x] AC-04: Docker dev and Vercel production config still work after changes.

## 4. Delivery Plan
### 4.1 Milestones
- [x] M1 - Discovery and findings documented (2026-02-17)
- [x] M2 - Security hardening complete (completed: 2026-02-17)
- [x] M3 - Accessibility hardening complete (completed: 2026-02-17)
- [x] M4 - Tooling/performance cleanup complete (completed: 2026-02-17)
- [ ] M5 - Final QA and release complete (target: 2026-02-25)

### 4.2 Work Breakdown
- [x] Task: Harden chatbot rendering (sanitize output and remove unsafe formatting path)  
  Owner: Revanza + Codex  
  Due date: 2026-02-17  
  Dependency: Review `public/chatbot.js`, validate markdown rendering strategy

- [x] Task: Harden Sanity portable text rendering in dynamic routes  
  Owner: Revanza + Codex  
  Due date: 2026-02-17  
  Dependency: Decide sanitization library/approach for Astro static rendering

- [x] Task: Remove/guard raw HTML injection via env (`HEADER_INJECT`, `FOOTER_INJECT`)  
  Owner: Revanza  
  Due date: 2026-02-17  
  Dependency: Confirm whether custom HTML injection is still required

- [x] Task: Accessibility and link security pass (`target="_blank"`, semantic buttons/anchors)  
  Owner: Revanza + Codex  
  Due date: 2026-02-17  
  Dependency: Component-level updates in `src/components/*`

- [x] Task: Tooling cleanup (`check` scripts, tsconfig excludes, dependency cleanup, registry audit path)  
  Owner: Revanza  
  Due date: 2026-02-17  
  Dependency: Confirm preferred package manager (`npm` vs `pnpm`)

- [x] Task: Performance and route consistency cleanup (minify + `/blog` vs `/post` dedupe)  
  Owner: Revanza + Codex  
  Due date: 2026-02-17  
  Dependency: Define canonical post route and optional redirects

### 4.3 Dependencies
- Internal dependency: Agreement on canonical content route strategy.
- External dependency: npm registry audit support (current mirror blocks `npm audit` endpoint).
- Blocking condition: Unclear policy around `HEADER_INJECT` and `FOOTER_INJECT`.

## 5. Technical Plan
### 5.1 Current State
- Security-sensitive rendering exists in:
  - `public/chatbot.js`
  - `src/pages/blog/[slug].astro`
  - `src/pages/post/[slug].astro`
  - `src/layouts/main.astro`
- Accessibility/link issues across shared components:
  - `src/components/footer.astro`
  - `src/components/project.astro`
  - `src/pages/about.astro`
  - `src/components/posts-loop.astro`
  - `src/components/header.astro`

### 5.2 Proposed Changes
- Replace raw message HTML generation with safe rendering/sanitization in chatbot.
- Sanitize or safely serialize portable text output before injecting into page.
- Remove or strictly whitelist env-based HTML injection points.
- Add `rel="noopener noreferrer"` to all external blank-target links.
- Replace `onclick` container navigation with semantic anchors/buttons and keyboard support.
- Update `astro.config.mjs` for production minification strategy.
- Adjust `tsconfig`/check behavior to avoid scanning `dist` output noise.
- Remove unused dependencies from `package.json`.
- Standardize one canonical post route and redirect or remove duplicate.

### 5.3 Rollback Strategy
- Rollback method: `git revert` release commit(s).
- Deployment rollback: Redeploy previous successful Vercel build.
- Data rollback: No DB schema migration planned; content remains in Sanity.

## 6. Risk Management
### 6.1 Risk Register
- Risk: Security hardening changes break rich formatting in chatbot/blog.
  - Impact: Medium
  - Likelihood: Medium
  - Mitigation: Add snapshot/manual tests for message/post rendering.
  - Owner: Revanza + Codex

- Risk: Route consolidation causes broken links or SEO regressions.
  - Impact: High
  - Likelihood: Medium
  - Mitigation: Keep redirects and update internal links + sitemap/RSS paths.
  - Owner: Revanza

- Risk: Dependency cleanup removes actually needed transitive usage.
  - Impact: Medium
  - Likelihood: Low
  - Mitigation: Remove incrementally with build and runtime verification each step.
  - Owner: Revanza

### 6.2 Escalation Triggers
- Trigger: Build breaks on production branch after cleanup
  - Action: Revert last commit and isolate failing change set
  - Escalate to: Revanza (owner)

- Trigger: Security-related unresolved issue before release date
  - Action: Freeze non-security changes and patch only security blockers
  - Escalate to: Revanza (owner)

## 7. Validation and QA Checklist
### 7.1 Local Validation
- [x] Project installs cleanly
- [x] Build passes
- [x] Lint/check passes with agreed policy (non-mutating check script)
- [x] Type checks pass with final config
- [x] No unexpected console/runtime errors on key pages

### 7.2 Testing
- [x] Unit tests added/updated for sanitization and parsing logic
- [x] Integration test coverage for post routes and navigation behavior
- [x] Manual test scenarios executed (desktop/mobile)
- [x] Regression test completed for blog, posts, projects, and chatbot flows

### 7.3 Security and Reliability
- [x] Input validation reviewed for chatbot user input
- [x] Env/secrets usage reviewed (`.env`, Vercel env vars)
- [x] Error handling and fallback paths tested for WebGPU fallback mode
- [x] Monitoring/logging checks completed post-release

## 8. Release Checklist
### 8.1 Pre-Release
- [x] Branch up to date with `main`
- [ ] PR approved and reviewed
- [x] Release notes prepared (security + quality improvements)
- [ ] Vercel env variables verified
- [x] Docker dev smoke check passed

### 8.2 Deployment
- [x] Deploy to staging/preview
- [ ] Preview smoke test passed
- [x] Deploy to production
- [x] Production smoke test passed

### 8.3 Post-Release
- [ ] Confirm no client-side errors on key pages
- [ ] Check performance metrics and error logs
- [ ] Notify stakeholders/project owner
- [ ] Record follow-up improvements for next cycle

## 9. Communication Plan
- Audience: Project owner and collaborators
- Update frequency: Daily during active implementation
- Channel: Git commits + PR comments + project docs
- Status update format: `Done / Next / Blockers`

## 10. Progress Log
- Date: 2026-02-17
  - Summary: Completed project analysis and identified high-priority security/accessibility/tooling issues.
  - Decision made: Prioritize security hardening first, then accessibility, then tooling/performance.
  - Next step: Implement Task 1 (chatbot and dynamic post rendering hardening).

- Date: 2026-02-17
  - Summary: Completed implementation pass 1:
    - hardened chatbot rendering and dynamic post rendering
    - guarded env HTML injection behind `ENABLE_HTML_INJECT`
    - fixed blank-target link safety
    - improved accessibility for menu and post cards
    - cleaned tooling/dependencies and validated build/check
  - Decision made: Keep route dedupe (`/blog` vs `/post`) for next pass to avoid accidental SEO/link regressions in this change set.
  - Next step: Validate Docker/Vercel behavior and complete route consistency work.

- Date: 2026-02-17
  - Summary: Validation completed:
    - `npm run check` passes
    - `npm run build` passes with zero Astro check errors/warnings/hints
    - Docker dev stack starts and serves `http://localhost:4321` (HTTP 200)
  - Decision made: Keep container setup as-is and continue with route consistency in next pass.
  - Next step: Implement canonical route cleanup for `/blog` vs `/post`.

- Date: 2026-02-17
  - Summary: Route consistency cleanup completed:
    - canonicalized navigation and internal writing links to `/blog`
    - converted legacy `/posts` and `/post/[slug]` to redirect pages
    - added Vercel redirects for `/posts -> /blog` and `/post/:slug -> /blog/:slug`
    - validated static output includes redirect pages and canonical tags
  - Decision made: Keep legacy URLs as compatibility redirects instead of hard removal.
  - Next step: Final QA + release checklist execution.

- Date: 2026-02-18
  - Summary: Final QA local execution completed:
    - `npm run check` passes (`biome lint .`, no issues)
    - `npm run build` passes (`astro check` 0 errors/warnings/hints + static build success)
    - Docker dev smoke check passed with HTTP 200 on key routes:
      - `/`, `/about`, `/projects`, `/blog`, `/blog/rewiring-5tb-data-pipeline-at-home`
      - legacy compatibility routes `/posts` and `/post/rewiring-5tb-data-pipeline-at-home`
    - No runtime errors observed in `docker compose logs` during key-route requests
    - Reviewed env/secrets handling:
      - `.env` and `.env.local` are ignored
      - only `.env.example` is tracked
      - env-based HTML injection remains gated by `ENABLE_HTML_INJECT`
  - Release notes draft (for PR/production release):
    - Security: hardened chatbot and blog rendering paths; guarded env HTML injection
    - Accessibility: fixed external-link security attrs and semantic interaction behavior
    - Reliability: lint/build/type checks passing with deterministic scripts
    - Routing: canonical `/blog` route with compatibility redirects from `/posts` and `/post/:slug`
  - Decision made: Local QA is complete; external release actions are pending.
  - Next step: PR approval, Vercel env verification, preview deploy, then production deploy + post-release checks.

- Date: 2026-02-18
  - Summary: Testing completion pass executed:
    - added unit test suite for chatbot sanitization/context helpers (`tests/unit/chatbot-utils.test.js`)
    - added integration regression suite for route/link/env safety contracts (`tests/integration/release-regression.test.js`)
    - extracted reusable chatbot safety helpers into `public/chatbot-utils.js` and wired runtime usage
    - executed `npm run test` successfully (unit + integration all passing)
    - executed manual UI regression sweep in Docker with desktop and mobile UA markers on:
      - `/`, `/about`, `/projects`, `/blog`, `/blog/rewiring-5tb-data-pipeline-at-home`
      - `/posts`, `/post/rewiring-5tb-data-pipeline-at-home`
    - documented manual pass in `docs/manual-ui-regression.md`
  - Decision made: QA testing scope for this release cycle is complete at local level.
  - Next step: Proceed with preview/prod deployment validation in Vercel.

- Date: 2026-02-18
  - Summary: Vercel preview deployment checks executed:
    - verified Vercel CLI auth and linked project (`revanza-gits-projects/revanza`)
    - pulled preview project settings (`vercel pull --yes --environment=preview`)
    - local Vercel pipeline build passed (`vercel build`) with zero Astro diagnostics
    - deployed prebuilt preview successfully:
      - preview URL: `https://revanza-gqwmoe91g-revanza-gits-projects.vercel.app`
      - inspect URL: `https://vercel.com/revanza-gits-projects/revanza/9ZS2rLp4To2Ff4pmtxkSBGjS3LG1`
      - deployment status: `Ready`
  - Blocker: Automated HTTP smoke checks to preview URL return `401 Unauthorized` due Vercel preview protection (SSO/auth gate).
  - Next step: Run authenticated browser smoke checks on preview URL, then proceed to production deploy.

- Date: 2026-02-18
  - Summary: Vercel production deployment checks executed:
    - pulled production project settings (`vercel pull --yes --environment=production`)
    - production-mode local build passed (`vercel build --prod`) with zero Astro diagnostics
    - deployed production from prebuilt artifacts (`vercel deploy --prebuilt --prod --yes`)
    - deployment status confirmed `Ready` via inspect:
      - deployment URL: `https://revanza-h28ffn43w-revanza-gits-projects.vercel.app`
      - inspect URL: `https://vercel.com/revanza-gits-projects/revanza/FrhhK6KLsfhfreAEuRyUKtNAvrtk`
      - production alias: `https://revanza.vercel.app`
    - production smoke checks passed on `https://revanza.vercel.app`:
      - HTTP `200`: `/`, `/about`, `/projects`, `/blog`, `/blog/rewiring-5tb-data-pipeline-at-home`, `/rss.xml`
      - HTTP `308`: `/posts -> /blog`, `/post/rewiring-5tb-data-pipeline-at-home -> /blog/rewiring-5tb-data-pipeline-at-home`
      - content markers validated for home/about/projects/blog/blog detail pages
  - Note: Vercel project currently has no configured environment variables (`vercel env ls production` empty). Current release is healthy, but future non-prebuilt cloud builds should set required env vars explicitly.
  - Next step: Complete authenticated preview smoke check and post-release monitoring/log verification.

- Date: 2026-02-18
  - Summary: WebGPU fallback and post-release monitoring checks completed:
    - added chatbot fallback regression coverage (`tests/integration/chatbot-fallback-regression.test.js`)
    - verified fallback guards for:
      - `navigator.gpu` absence path
      - forced mobile WebGPU disable path
      - FAQ-mode submit flow on non-WebGPU devices
      - model compatibility-error fallback (`FAQ Mode Ready`)
    - executed `npm run test:integration` and `npm run check` successfully
    - inspected production deployment + logs:
      - `npx vercel inspect revanza.vercel.app`
      - `npx vercel inspect revanza.vercel.app --logs`
    - re-ran production health checks (`200` on key routes, expected `308` legacy redirects)
    - documented post-release monitoring evidence in `docs/post-release-monitoring.md`
  - Decision made: 7.3 fallback and monitoring/logging checklist items are complete.
  - Next step: Close remaining release items (authenticated preview smoke, stakeholder notification, follow-up backlog).

## 11. Completion Criteria
- [x] All acceptance criteria met
- [x] All planned tests completed and passed
- [x] Documentation updated (`README` and relevant docs)
- [ ] Deployment completed successfully
- [ ] No critical open issues remain
