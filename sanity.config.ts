import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './src/schemas';

export default defineConfig({
  name: "default",
  title: "Revan's Blog",
  projectId: "px8q3nuz",
  dataset: "production",
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
}); 