# Astro Aria Portfolio

This is my personal portfolio website, built from scratch using Astro Aria and integrated with Sanity CMS for blog functionality. The project showcases my work, thoughts, and experiences while maintaining a focus on performance and developer experience.

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
- [Styled Components](https://styled-components.com/) v6.1.18 - CSS-in-JS Styling
- [WebLLM](https://github.com/mlc-ai/web-llm) v0.2.79 - Client-side AI for the interactive chatbot

## 📋 Prerequisites

- Node.js v20 or higher
- npm v6 or higher
- Sanity CLI (for local development)
- WebGPU-supported browser (Chrome 113+, Edge 113+) for AI chatbot functionality

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd astro-revanza
```

2. Install dependencies using npm:

```bash
npm install
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
npm run dev
```

Start Sanity Studio (in a separate terminal):

```bash
npm run sanity:dev
```

The site will be available at `http://localhost:4321`
Sanity Studio will be available at `http://localhost:3333`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm start` - Alias for dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Biome checks and auto-fix issues
- `npm run sanity` - Start Sanity Studio
- `npm run sanity:deploy` - Deploy Sanity Studio
- `npm run sanity:build` - Build Sanity Studio

## 🏗️ Project Structure

```
/
├── src/
│   ├── assets/         # Static assets like images and fonts
│   ├── collections/    # Content collections and schemas
│   ├── components/     # Reusable UI components
│   │   ├── button.astro
│   │   ├── ChatBot.astro  # AI-powered interactive chatbot
│   │   └── home/
│   │       ├── projects.astro
│   │       ├── separator.astro
│   │       └── writings.astro
│   ├── content/        # Content configuration
│   ├── layouts/        # Page layouts and templates
│   ├── lib/           # Utility functions and shared code
│   ├── pages/         # Route components
│   └── schemas/       # Sanity CMS schemas
├── public/            # Public static files
│   └── chatbot.js     # Client-side AI chatbot functionality
├── .sanity/          # Sanity Studio configuration
├── astro.config.mjs  # Astro configuration
├── sanity.config.ts  # Sanity CMS configuration
├── tailwind.config.mjs # Tailwind CSS configuration
├── package.json      # Project dependencies and scripts
└── .node-version     # Node.js version specification
```

## 🎨 Features

- **🌙 Dark mode support** with system preference detection
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
- **🤖 AI-powered chatbot** for interactive portfolio exploration (client-side)

## 🤖 AI Chat Bot

The portfolio features a **client-side AI-powered chatbot** that provides interactive exploration of portfolio content. This implementation was specifically designed to be **compatible with Vercel's free tier** by running entirely in the browser without server-side dependencies.

### ⚠️ Device Compatibility Notice:

**🖥️ Desktop Required for Full AI Experience**: The full AI chatbot requires a **desktop browser with WebGPU support**.

**📱 Mobile Devices**: Currently have **limited support** with a FAQ-based fallback system. For the complete AI-powered experience, please visit on desktop.

### Key Features:

- **🖥️ Client-side execution** - No server costs, perfect for free hosting tiers
- **🧠 WebLLM integration** - Runs AI models directly in the browser using WebGPU
- **⚡ Real-time responses** - Instant interaction without API calls (desktop only)
- **🎯 Context-aware answers** - Trained on portfolio content for accurate responses
- **🌙 Dark mode support** - Seamlessly matches the site theme
- **📱 Mobile FAQ fallback** - Basic question-answer system for mobile devices
- **⌨️ Enhanced UX** - Character counter, status indicators, smooth animations

### Technical Implementation:

- **Model**: Qwen2.5-0.5B-Instruct-q4f16_1-MLC (optimized for browser execution)
- **Runtime**: WebLLM v0.2.79 for client-side AI execution
- **Requirements**: WebGPU-supported **desktop** browser (Chrome 113+, Edge 113+, Firefox 113+)
- **Mobile Fallback**: FAQ system with predefined responses about projects, skills, experience, and contact
- **Context Management**: Sliding window approach to handle conversation length
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### Deployment Benefits:

- **💰 Zero additional costs** - No AI API fees or server compute charges
- **🚀 Vercel free tier compatible** - Static files only, no serverless functions needed
- **🔒 Privacy-focused** - All processing happens locally in the user's browser
- **📈 Scalable** - No backend bottlenecks as each user runs their own AI instance

The chatbot provides visitors with an interactive way to explore the portfolio, ask questions about projects, experience, and skills. **For the best experience, use a desktop browser with WebGPU support.**

## 📝 Content Management

Content is managed through Sanity CMS, providing a user-friendly interface for managing:

- Blog posts
- Projects
- Site settings
- Media assets

The content is fetched using GROQ queries and rendered using Portable Text components.

## 🌐 Deployment

### Deploying to Vercel (Recommended - Free Tier Compatible)

This portfolio is optimized for **Vercel's free tier** thanks to its static nature and client-side AI implementation. No serverless functions or server-side AI processing required!

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Configure the project settings:
     - Framework Preset: Astro
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. Add Environment Variables in Vercel:

   - Go to Project Settings > Environment Variables
   - Add the following variables:
     ```
     SANITY_PROJECT_ID=your_project_id
     SANITY_DATASET=production
     ```

4. Deploy Sanity Studio:

   - Create a new project in Vercel for Sanity Studio
   - Set the root directory to `.sanity`
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add the same environment variables as above

5. Deploy your project:
   - Click "Deploy"
   - Vercel will automatically build and deploy your site

### Alternative: Deploy Sanity Studio Separately

If you prefer to deploy Sanity Studio separately:

1. Deploy Sanity Studio to [Sanity's hosting](https://www.sanity.io/manage):

   ```bash
   npm run sanity:deploy
   ```

2. Deploy your Astro site to Vercel as described above

### Post-Deployment

After deployment:

- Your main site will be available at `https://your-project.vercel.app`
- Sanity Studio will be available at:
  - `https://your-project.sanity.studio` (if using Sanity hosting)
  - or `https://your-sanity-studio.vercel.app` (if deployed to Vercel)
- AI chatbot will work immediately without additional setup (for WebGPU-supported browsers)

### Development Workflow

1. Local Development:

   ```bash
   # Terminal 1 - Main site
   npm run dev

   # Terminal 2 - Sanity Studio
   npm run sanity:dev
   ```

2. Production:
   - Content updates through Sanity Studio
   - Site rebuilds automatically when content changes
   - Vercel handles deployments automatically
   - AI chatbot runs client-side with no server dependencies

### Deployment Cost Optimization

- **🆓 Free tier friendly**: Static site with client-side AI = $0 hosting costs
- **📊 No API usage fees**: AI runs locally, no external API calls
- **⚡ Fast builds**: Optimized build process for quick deployments
- **🔄 Auto-deployments**: Git-based workflow with automatic rebuilds

## 🎯 Browser Compatibility

### General Site:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- **✅ Mobile browsers fully supported** for all site features

### AI Chatbot:

#### 🖥️ Desktop (Full AI Experience):

- Chrome 113+ (WebGPU required)
- Edge 113+ (WebGPU required)
- Firefox 113+ (WebGPU required)
- Safari: Limited support (WebGPU in development)

#### 📱 Mobile (FAQ Fallback Only):

- **⚠️ Limited AI functionality** - Basic FAQ system available
- All mobile browsers supported for FAQ mode
- For complete AI experience, please use desktop

**Important**: The AI chatbot requires WebGPU support which is not yet available on mobile devices. Mobile users will receive a helpful FAQ-based system that can answer basic questions about projects, skills, experience, and contact information.

_Note: The main portfolio site works perfectly on all devices; only the advanced AI chatbot features require desktop browsers._

## 📜 License

[Add your license information here]
