# Revanza's Portfolio

This is Revanza Raytama's personal portfolio website, built from scratch using Astro and integrated with Sanity CMS for blog functionality. The project showcases work, thoughts, and experiences while maintaining a focus on performance and developer experience.

🌐 **Live Site**: [https://revanza.dev](https://revanza.dev)

## 👨‍💻 About Me

- Email: [revanza.raytama@gmail.com](mailto:revanza.raytama@gmail.com)
- LinkedIn: [@revanzaraytama](https://www.linkedin.com/in/revanzaraytama/)

## 🚀 Tech Stack

- [Astro](https://astro.build/) v4.8.2 - Static Site Generator
- [Tailwind CSS](https://tailwindcss.com/) v3.4.3 - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) v5.4.5 - Type Safety
- [Biome](https://biomejs.dev/) v1.7.3 - Code Formatter and Linter
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) v0.5.13 - Typography Plugin
- [Sanity CMS](https://www.sanity.io/) v3.88.3 - Headless Content Management System
- [RSS](https://www.rssboard.org/rss-specification) v1.2.2 - RSS Feed Generation

## 📋 Prerequisites

- Docker Desktop (for local development)
- Node.js v20 or higher (optional, for local tooling and Sanity Studio)
- npm v10 or higher

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/revanza-git/website.git
cd website
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Optionally set environment variables in `.env` (the Sanity project id defaults to the one in `sanity.config.ts`):

```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
```

## 🚀 Development

Start the main site in Docker:

```bash
npm run docker:dev
```

The site will be available at `http://localhost:4321`

If you want to run Sanity Studio locally (optional), install dependencies and start it in a separate terminal:

```bash
npm install
npm run sanity:dev
```

Sanity Studio will be available at `http://localhost:3333`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm start` - Alias for dev server
- `npm run build` - Build for production
- `npm run build:memory` - Build with increased Node memory (used by Vercel)
- `npm run preview` - Preview production build
- `npm run check` - Run Biome lint checks (non-mutating)
- `npm run test` - Run all tests
- `npm run test:integration` - Run integration regression tests
- `npm run test:monitoring` - Run production browser client-error sweep
- `npm run docker:dev` - Start local dev container
- `npm run docker:dev:down` - Stop and remove local dev container
- `npm run sanity` - Start Sanity Studio
- `npm run sanity:dev` - Start Sanity Studio
- `npm run sanity:deploy` - Deploy Sanity Studio
- `npm run sanity:build` - Build Sanity Studio

## 🏗️ Project Structure

The layout is documented once, in [AGENTS.md](AGENTS.md#repository-layout), so it cannot drift from the guidance contributors and agents follow. In short:

- `src/` is the Astro site: routes in `pages/`, one shell in `layouts/main.astro`, local JSON content in `collections/`, and the Sanity client in `lib/sanity.ts`.
- `studio/` plus the root `sanity.config.ts` and `sanity.cli.ts` are the Sanity Studio app that shares this package.
- `public/` holds static assets served at the site root, `tests/` holds the integration and monitoring suites, and `docs/` holds guides with release records under `docs/releases/<date>/`.

## 🎨 Features

- **🌙 Dark mode support** with system preference detection
- **🎬 Subtle motion** with Astro view transitions, a staggered hero entrance, and scroll reveals that respect reduced-motion settings
- **📱 Responsive design** optimized for all devices
- **📝 Blog/Writing section** with rich text support
- **🚀 Projects showcase** with filtering capabilities
- **🔒 Type-safe content** collections and schemas
- **🎨 Modern UI** with Tailwind CSS and custom styling
- **⚡ Performance optimized** with Astro's partial hydration
- **🔍 SEO friendly** with meta tags and structured data
- **📰 RSS feed generation** for blog posts
- **🔧 Portable Text support** for rich content
- **🌍 Environment variable management** with dotenv
- **✨ Code quality enforcement** with Biome
- **📅 Google Calendar integration** for easy meeting scheduling

## 📅 Google Calendar Meeting Scheduler

The portfolio includes a **one-click meeting scheduler** that integrates directly with Google Calendar, making it easy for potential clients and collaborators to book time with me.

### Features:

- **🎯 Direct Google Calendar integration** - Opens Google Calendar with pre-filled meeting details
- **📧 Auto-attendee addition** - Automatically adds revanza.raytama@gmail.com as meeting attendee
- **⏰ Smart defaults** - Pre-sets meeting for next Monday at 10 AM (user can adjust)
- **📝 Professional details** - Includes meeting title and description about project discussions
- **🎨 Consistent design** - Matches portfolio theme with blue accent color and calendar icon
- **📱 Responsive placement** - Available on both homepage and about page

### Implementation:

- **Component**: `src/components/schedule-meeting.astro`
- **Integration**: Added to homepage call-to-action section and about page contact section
- **User Experience**: Single click opens Google Calendar with all meeting details pre-filled
- **Accessibility**: Includes proper ARIA attributes and focus management

This feature streamlines the client onboarding process by removing friction from meeting scheduling.

## 📝 Content Management

Two content sources, both rendered at build time:

- Local JSON in `src/collections/` drives the home page, `/projects`, the case-study pages, and `/about`. `projects.json` is the single source for case studies.
- Sanity CMS drives the blog (`/blog`, `/blog/[slug]`, `/rss.xml`). Posts are fetched with GROQ queries in `src/lib/sanity.ts` and rendered with Portable Text. The Studio schemas live in `studio/schemas/`.

## 🌐 Deployment

### Deploying to Vercel (Recommended - Free Tier Compatible)

This portfolio is configured for **production deployment on Vercel** and **local development in Docker**.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Configure the project settings:
     - Framework Preset: Astro
     - Build Command: `npm run build:memory`
     - Output Directory: `dist`
     - Install Command: `npm ci`

3. Add Environment Variables in Vercel:

   - Go to Project Settings > Environment Variables
   - Add the following variables:
     ```
     SANITY_PROJECT_ID=your_project_id
     SANITY_DATASET=production
     ```

4. Deploy Sanity Studio with `npm run sanity:deploy` (see below). `.sanity/` is a generated cache, not a deployable app.

5. Deploy your project:
   - Click "Deploy"
   - Vercel will automatically build and deploy your site

`vercel.json` is already committed with these settings.

### Deploying Sanity Studio

1. Deploy Sanity Studio to [Sanity's hosting](https://www.sanity.io/manage):

   ```bash
   npm run sanity:deploy
   ```

2. Deploy your Astro site to Vercel as described above

### Post-Deployment

After deployment:

- Your main site will be available at `https://your-project.vercel.app`
- Sanity Studio will be available at `https://your-project.sanity.studio`

### Development Workflow

1. Local Development:

   ```bash
   # Terminal 1 - Main site
   npm run docker:dev

   # Terminal 2 - Sanity Studio
   npm install
   npm run sanity:dev
   ```

2. Production:
   - Content updates through Sanity Studio
   - Site rebuilds automatically when content changes
   - Vercel handles deployments automatically

### Deployment Cost Optimization

- **🆓 Free tier friendly**: Static site hosting keeps costs low
- **⚡ Fast builds**: Optimized build process for quick deployments
- **🔄 Auto-deployments**: Git-based workflow with automatic rebuilds

## 🎯 Browser Compatibility

### General Site:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- **✅ Mobile browsers fully supported** for all site features

## 🤖 AI Agent Guidance

- `AGENTS.md` holds the shared guidance for AI coding agents: layout, commands, content rules, and safety.
- `CLAUDE.md` adds Claude Code specifics on top of it: cross-file architecture, gotchas, and commit rules.
- `.claude/settings.json` ships a commit hook that reminds the agent to keep these docs and `.gitignore` current, and turns off AI attribution in commits.

## 📜 License

MIT License - feel free to use this project as inspiration for your own portfolio!
