import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "static",
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
