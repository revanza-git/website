// End-to-end eval for the portfolio assistant. Needs a running site with GROQ_API_KEY set.
// Usage: node tests/assistant/eval.mjs [baseUrl]   (default http://localhost:4321)
// Each case checks the answer for required substrings (`expect`: all, `expectAny` / `expectAnyB`: at least
// one of each list) and forbidden substrings (`forbid`). Matching is case-insensitive. Exit code 1 on failures.
import { readFileSync } from "node:fs";

const base = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");
const cases = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8"));
const only = process.argv[3] ? Number(process.argv[3]) : null;

const ask = async (question) => {
	const res = await fetch(`${base}/api/chat`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
	});
	if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
	return res.text();
};

const has = (answer, needle) => answer.toLowerCase().includes(needle.toLowerCase());

let failed = 0;
const start = Date.now();
for (const [i, c] of cases.entries()) {
	if (only !== null && i !== only) continue;
	let answer;
	try {
		answer = await ask(c.q);
	} catch (error) {
		failed++;
		console.log(`FAIL ${String(i).padStart(2)} ${c.q}\n     request failed: ${error.message}`);
		continue;
	}
	const problems = [];
	for (const n of c.expect ?? []) if (!has(answer, n)) problems.push(`missing "${n}"`);
	for (const key of ["expectAny", "expectAnyB"]) {
		const list = c[key];
		if (list && !list.some((n) => has(answer, n))) problems.push(`none of [${list.join(", ")}]`);
	}
	for (const n of c.forbid ?? []) if (has(answer, n)) problems.push(`contains "${n}"`);
	if (answer.length > 1400) problems.push(`too long (${answer.length} chars)`);
	const ok = problems.length === 0;
	if (!ok) failed++;
	console.log(`${ok ? "ok  " : "FAIL"} ${String(i).padStart(2)} ${c.q}`);
	if (!ok) console.log(`     ${problems.join("; ")}\n     answer: ${answer.replace(/\s+/g, " ").slice(0, 300)}`);
	// Stay well inside the free-tier request rate.
	await new Promise((r) => setTimeout(r, 2500));
}
const ran = only === null ? cases.length : 1;
console.log(`\n${ran - failed}/${ran} passed in ${Math.round((Date.now() - start) / 1000)}s`);
process.exit(failed ? 1 : 0);
