import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://revanza.dev",
  // Every page is prerendered; "hybrid" exists only for the assistant's /api/chat route.
  output: "hybrid",
  adapter: vercel(),
  integrations: [tailwind()],
  vite: {
    envPrefix: ["SANITY_"],
    envDir: ".",
    build: {
      chunkSizeWarningLimit: 6000,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split large vendor chunks
            if (id.includes("node_modules")) {
              if (id.includes("sanity")) {
                return "sanity";
              }
              if (id.includes("astro")) {
                return "astro";
              }
              return "vendor";
            }
          },
        },
      },
    },
  },
});
