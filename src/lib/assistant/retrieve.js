// Lexical retrieval (BM25) over the assistant corpus. The corpus is a few dozen chunks,
// so a small in-process index is enough and nothing is sent to an embeddings API.

const STOP = new Set(
	"a an the and or of to in on for with by at from as is are was were be been it its this that these those he his him what which who how does did do has have had can could tell me about any his their you your i we they them there than then into over under up down out not no yes".split(" "),
);

const stem = (word) => word.replace(/(ing|ed|es|s)$/u, (m, _s, offset) => (offset > 3 ? "" : m));

/** @param {string} text */
export const tokenize = (text) =>
	text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}+#.]+/gu, " ")
		.split(/\s+/)
		.map((t) => t.replace(/^\.+|\.+$/g, ""))
		.filter((t) => t.length > 1 && !STOP.has(t))
		.map(stem);

/**
 * @param {import("./corpus.js").Chunk[]} chunks
 */
export function buildIndex(chunks) {
	const docs = chunks.map((chunk) => {
		// Title tokens count twice so a question that names a project ranks its chunks first.
		const tokens = [...tokenize(chunk.title), ...tokenize(chunk.title), ...tokenize(chunk.text)];
		const tf = new Map();
		for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
		return { chunk, tf, length: tokens.length };
	});
	const df = new Map();
	for (const doc of docs) for (const term of doc.tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
	const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
	return { docs, df, avgLength, size: docs.length };
}

/**
 * Rank chunks for a query. Returns the best `limit` chunks that fit within `maxChars`.
 * @param {ReturnType<typeof buildIndex>} index
 * @param {string} query
 * @param {{ limit?: number, maxChars?: number }} [options]
 */
export function search(index, query, { limit = 5, maxChars = 9000 } = {}) {
	const k1 = 1.2;
	const b = 0.75;
	const terms = [...new Set(tokenize(query))];
	const scored = index.docs.map((doc) => {
		let score = 0;
		for (const term of terms) {
			const f = doc.tf.get(term);
			if (!f) continue;
			const n = index.df.get(term) ?? 0;
			const idf = Math.log(1 + (index.size - n + 0.5) / (n + 0.5));
			score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * doc.length) / index.avgLength)));
		}
		return { chunk: doc.chunk, score };
	});
	scored.sort((x, y) => y.score - x.score);
	const picked = [];
	let used = 0;
	for (const { chunk, score } of scored) {
		if (score <= 0 || picked.length >= limit) break;
		if (used + chunk.text.length > maxChars) continue;
		picked.push({ chunk, score });
		used += chunk.text.length;
	}
	return picked;
}
