import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [tailwind()],
  vite: {
    envPrefix: ["SANITY_"],
    envDir: ".",
    ssr: {
      // Exclude WebLLM from server-side rendering
      noExternal: [],
      external: ["@mlc-ai/web-llm"],
    },
    build: {
      chunkSizeWarningLimit: 6000,
      // Simplify build to avoid memory issues
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Keep WebLLM as separate chunk
            if (id.includes("@mlc-ai/web-llm")) {
              return "webllm";
            }
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
