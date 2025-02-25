# Personal Portfolio Website

A modern, responsive portfolio website built with Astro, Tailwind CSS, and TypeScript.

## 🚀 Tech Stack

- [Astro](https://astro.build/) - Static Site Generator
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Biome](https://biomejs.dev/) - Code Formatter and Linter
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) - Typography Plugin

## 📋 Prerequisites

- Node.js v20 or higher
- pnpm v9.12.2 or higher

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd astro-aria
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

## 🚀 Development

Start the development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:4321`

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Biome checks and auto-fix issues

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
│   └── pages/
│       └── index.astro
├── public/
│   └── assets/
│       └── images/
├── astro.config.mjs
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

## 📝 Content Management

Content is managed through Astro's content collections. Blog posts can be added in the `src/content` directory following the schema defined in `src/content/config.js`.

## 🌐 Deployment

Build the project for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 📜 License

[Add your license information here]
