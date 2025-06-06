import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/schemas";

export default defineConfig({
	name: "default",
	title: "Revan's Blog",
	projectId: "px8q3nuz",
	dataset: "production",
	plugins: [structureTool()],
	schema: {
		types: schemaTypes,
	},
});
