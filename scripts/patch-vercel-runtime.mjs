// Post-build step for Vercel. @astrojs/vercel 7 (the last release for Astro 4) can only emit
// nodejs18.x or nodejs20.x for the server function, and Vercel has retired Node 18, so the
// deployment fails with: The following Serverless Functions contain an invalid "runtime".
// This rewrites the runtime in every function config to the project's Node version.
// Override with VERCEL_NODE_RUNTIME (for example nodejs24.x) when Vercel moves on again.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const runtime = process.env.VERCEL_NODE_RUNTIME ?? "nodejs22.x";
const functionsDir = join(process.cwd(), ".vercel", "output", "functions");

if (!existsSync(functionsDir)) {
	console.log("[patch-vercel-runtime] no .vercel/output/functions directory; nothing to do");
	process.exit(0);
}

let patched = 0;
for (const entry of readdirSync(functionsDir)) {
	const config = join(functionsDir, entry, ".vc-config.json");
	if (!existsSync(config)) continue;
	const json = JSON.parse(readFileSync(config, "utf8"));
	if (json.runtime === runtime) continue;
	console.log(`[patch-vercel-runtime] ${entry}: ${json.runtime} -> ${runtime}`);
	json.runtime = runtime;
	writeFileSync(config, `${JSON.stringify(json, null, 2)}\n`);
	patched++;
}
console.log(`[patch-vercel-runtime] patched ${patched} function config(s)`);
