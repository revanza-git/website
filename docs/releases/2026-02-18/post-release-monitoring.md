# Post-Release Monitoring Checks

Execution date: 2026-02-18  
Executor: Codex

## Production deployment inspected
- Command: `npx vercel inspect revanza.vercel.app`
- Result: deployment `dpl_FrhhK6KLsfhfreAEuRyUKtNAvrtk` is `Ready`
- Production alias: `https://revanza.vercel.app`

## Deployment logs inspected
- Command: `npx vercel inspect revanza.vercel.app --logs`
- Result: clean build/deploy sequence with final status `Deployment completed`; no build errors.

## Client-side error sweep (production)
- Command: `npx playwright test tests/monitoring/client-errors.spec.js --reporter=line`
- Scope:
  - `/`
  - `/about`
  - `/projects`
  - `/blog`
  - `/blog/rewiring-5tb-data-pipeline-at-home`
  - `/posts`
  - `/post/rewiring-5tb-data-pipeline-at-home`
- Result:
  - `7/7` checks passed
  - no uncaught `pageerror`
  - no `console.error`
  - no failed network requests

## Runtime endpoint health checks
- Command set:
  - `curl https://revanza.vercel.app/`
  - `curl https://revanza.vercel.app/about`
  - `curl https://revanza.vercel.app/projects`
  - `curl https://revanza.vercel.app/blog`
  - `curl https://revanza.vercel.app/blog/rewiring-5tb-data-pipeline-at-home`
  - `curl https://revanza.vercel.app/rss.xml`
  - `curl https://revanza.vercel.app/posts`
  - `curl https://revanza.vercel.app/post/rewiring-5tb-data-pipeline-at-home`
- Result:
  - `200`: `/`, `/about`, `/projects`, `/blog`, `/blog/[slug]`, `/rss.xml`
  - `308`: `/posts`, `/post/[slug]` (expected permanent redirects)

## Header/cache sanity check
- Command: response headers from `https://revanza.vercel.app/`
- Observed:
  - `HTTP/1.1 200 OK`
  - `Cache-Control: public, max-age=0, must-revalidate`
  - `Content-Type: text/html; charset=utf-8`
  - `X-Vercel-Cache: HIT`

## Performance snapshot (production browser timing)
- Command: Playwright navigation timing snapshot against production pages.
- Observed metrics:
  - `/`: TTFB `35ms`, DCL `710.9ms`, Load `711.2ms`, FCP `420ms`
  - `/about`: TTFB `21.6ms`, DCL `117.4ms`, Load `117.6ms`, FCP `88ms`
  - `/projects`: TTFB `26.8ms`, DCL `116ms`, Load `116.2ms`, FCP `112ms`
  - `/blog`: TTFB `21.8ms`, DCL `36ms`, Load `267.7ms`, FCP `48ms`
  - `/blog/rewiring-5tb-data-pipeline-at-home`: TTFB `22.8ms`, DCL `53.4ms`, Load `700.6ms`, FCP `108ms`
  - `/rss.xml`: TTFB `22.5ms`, DCL `88.7ms`, Load `90.3ms`, FCP `108ms`

## Notes
- This app is static output; there are no serverless runtime function logs expected for normal page views.
- `vercel logs` is a streaming command and did not provide actionable runtime events for this static deployment window.
