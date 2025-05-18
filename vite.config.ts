import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'import.meta.env.SANITY_PROJECT_ID': JSON.stringify(env.SANITY_PROJECT_ID || ''),
      'import.meta.env.SANITY_DATASET': JSON.stringify(env.SANITY_DATASET || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
}); 