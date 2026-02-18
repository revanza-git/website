# Manual UI Regression Checklist

Execution date: 2026-02-18  
Executor: Codex (local Docker dev environment)

## Scope
- Key routes: `/`, `/about`, `/projects`, `/blog`, `/blog/[slug]`
- Legacy compatibility routes: `/posts`, `/post/[slug]`
- Core UI areas: header navigation, content sections, chatbot mount, redirect pages

## Environment
- Runtime: Docker Compose (`revanza-web-porto`)
- URL: `http://localhost:4321`
- Device modes checked:
  - Desktop user-agent
  - Mobile user-agent (iPhone Safari UA string)

## Checklist Results
- [x] Home page loads (`200`) and includes chatbot section markup ("Ask the AI")
- [x] About page loads (`200`) and main heading/content renders
- [x] Projects page loads (`200`) and project cards render
- [x] Blog listing page loads (`200`) and post entries render
- [x] Blog detail page loads (`200`) for known slug
- [x] Legacy `/posts` route responds and renders redirect page
- [x] Legacy `/post/[slug]` route responds and renders redirect page
- [x] No unexpected runtime/server errors observed in `docker compose logs` during route sweep

## Notes
- This pass validates route/render/runtime regressions in a deployed-like dev container.
- Deep visual checks (pixel-level diffs, animation timing, dark/light contrast audits) were not part of this pass.
