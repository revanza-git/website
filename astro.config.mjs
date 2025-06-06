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
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes('@mlc-ai/web-llm')) {
							return 'webllm';
						}
						if (id.includes('node_modules')) {
							return 'vendor';
						}
					},
				},
			},
		},
	},
});
