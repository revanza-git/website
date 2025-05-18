# Personal Portfolio Website

A modern, responsive portfolio website built with Astro, Tailwind CSS, TypeScript, and Sanity CMS.

## 🚀 Tech Stack

- [Astro](https://astro.build/) - Static Site Generator
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Biome](https://biomejs.dev/) - Code Formatter and Linter
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) - Typography Plugin
- [Sanity CMS](https://www.sanity.io/) - Headless Content Management System
- [RSS](https://www.rssboard.org/rss-specification) - RSS Feed Generation

## 📋 Prerequisites

- Node.js v20 or higher
- pnpm v9.12.2 or higher
- Sanity CLI (for local development)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd astro-revanza
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Sanity project credentials:

```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
```

## 🚀 Development

Start the development server:

```bash
pnpm dev
```

Start Sanity Studio (in a separate terminal):

```bash
pnpm sanity dev
```

The site will be available at `http://localhost:4321`
Sanity Studio will be available at `http://localhost:3333`

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Biome checks and auto-fix issues
- `pnpm sanity` - Start Sanity Studio

## 🏗️ Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── button.astro
│   │   └── home/
│   │       ├── projects.astro
│   │       ├── separator.astro
│   │       └── writings.astro
│   ├── content/
│   │   └── config.js
│   ├── layouts/
│   │   └── main.astro
│   ├── pages/
│   │   └── index.astro
│   └── schemas/
│       └── [your-sanity-schemas]
├── public/
│   └── assets/
│       └── images/
├── .sanity/
├── astro.config.mjs
├── sanity.config.ts
├── tailwind.config.mjs
├── package.json
└── .node-version
```

## 🎨 Features

- Dark mode support
- Responsive design
- Blog/Writing section
- Projects showcase
- Type-safe content collections
- Modern UI with Tailwind CSS
- Performance optimized
- SEO friendly
- Sanity CMS integration for content management
- RSS feed generation for blog posts
- Portable Text support for rich content

## 📝 Content Management

Content is managed through Sanity CMS, providing a user-friendly interface for managing:

- Blog posts
- Projects
- Site settings
- Media assets

The content is fetched using GROQ queries and rendered using Portable Text components.

## 🌐 Deployment

Build the project for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 📜 License

[Add your license information here]
