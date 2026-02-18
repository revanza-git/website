# Next Cycle Improvements

Date recorded: 2026-02-18

## Priority backlog
- [ ] Add authenticated preview smoke-check automation (Vercel protected preview currently blocks anonymous CLI checks).
- [ ] Configure required Vercel project environment variables explicitly for both preview and production to avoid reliance on local prebuilt deploys.
- [ ] Add a lightweight production error-monitoring SDK (for example Sentry or equivalent) to capture real client-side exceptions over time.
- [ ] Add Lighthouse CI performance budgets for key pages (`/`, `/blog`, blog detail) and enforce them in CI.
- [ ] Add Playwright monitoring command to CI for key-page browser console/page-error checks.
- [ ] Refresh `caniuse-lite`/Browserslist database regularly in maintenance workflow.
