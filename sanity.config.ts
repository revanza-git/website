import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
// Sanity Studio entry. The CLI reads this file and sanity.cli.ts from the repo root;
// everything else that belongs to the Studio lives under studio/.
import { schemaTypes } from "./studio/schemas";

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
