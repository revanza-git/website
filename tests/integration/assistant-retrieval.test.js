// Retrieval checks for the portfolio assistant: no network, no API key.
// Verifies that the right case study ranks first for questions a recruiter would ask.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildCorpus } from "../../src/lib/assistant/corpus.js";
import { buildIndex, search } from "../../src/lib/assistant/retrieve.js";

const read = (name) => JSON.parse(readFileSync(new URL(`../../src/collections/${name}.json`, import.meta.url), "utf8"));
const corpus = buildCorpus({
	projects: read("projects"),
	about: read("about"),
	experiences: read("experiences"),
	assistant: read("assistant"),
});
const index = buildIndex(corpus.filter((c) => c.kind !== "facts" && c.kind !== "directory"));

const topUrl = (question) => search(index, question)[0]?.chunk.url;

test("corpus covers every case study plus experience, strengths and facts", () => {
	const projectUrls = new Set(corpus.filter((c) => c.kind === "project").map((c) => c.url));
	assert.equal(projectUrls.size, read("projects").length);
	assert.ok(corpus.some((c) => c.kind === "experience"));
	assert.ok(corpus.some((c) => c.kind === "about"));
	assert.ok(corpus.some((c) => c.kind === "facts"));
	assert.ok(corpus.some((c) => c.kind === "directory"));
	for (const chunk of corpus) assert.ok(chunk.text.length < (chunk.kind === "directory" ? 3000 : 2400), `${chunk.id} is too long (${chunk.text.length})`);
});

test("questions rank the matching case study first", () => {
	const expectations = [
		["Tell me about the permit-to-work platform", "/projects/nr-ptw-online-permit-to-work"],
		["How does the RASCI STK AI module draft documents?", "/projects/rasci-stk-process-governance"],
		["What is MeatLink and does it have an MCP server?", "/projects/meatlink-b2b-meat-commerce"],
		["Oracle to PostgreSQL migration of the CSR platform", "/projects/nr-csr-program-management"],
		["CSIRT website security headers", "/projects/csirt-nusantara-regas-website"],
		["enterprise RAG knowledge assistant with Qwen", "/projects/enterprise-rag-knowledge-assistant"],
		["Dungeon Master AI copilot with pgvector", "/projects/dndmind-ai-copilot"],
		["risk monitoring platform with KRI dashboards", "/projects/nr-emas-risk-monitoring"],
	];
	for (const [question, url] of expectations) {
		assert.equal(topUrl(question), url, `top result for "${question}"`);
	}
});

test("retrieval respects the limit and character budget", () => {
	const hits = search(index, "What has he built with .NET and Blazor?", { limit: 3, maxChars: 4500 });
	assert.ok(hits.length > 0 && hits.length <= 3);
	const total = hits.reduce((sum, h) => sum + h.chunk.text.length, 0);
	assert.ok(total <= 4500, `context too large: ${total}`);
});

test("off-topic questions return weak or no matches", () => {
	const hits = search(index, "What is the weather in Paris today?");
	assert.ok(hits.length <= 2, `expected few hits, got ${hits.length}`);
});
