// Builds the retrieval corpus for the portfolio assistant from the JSON collections.
// Plain JavaScript so the Node test runner can import it without a build step.

/**
 * @typedef {{ id: string, title: string, url: string, text: string, kind: "project" | "experience" | "about" | "facts" }} Chunk
 */

const sentences = (text) => text.split(/(?<=[.!?])\s+/);

/** Split a long text into pieces of at most `max` characters on sentence boundaries. */
const split = (text, max) => {
	const parts = [];
	let current = "";
	for (const sentence of sentences(text)) {
		if (current && current.length + sentence.length + 1 > max) {
			parts.push(current.trim());
			current = "";
		}
		current += `${sentence} `;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
};

/**
 * @param {{ projects: any[], about: { strengths: string[] }, experiences: any[], assistant: { facts: string[] } }} data
 * @returns {Chunk[]}
 */
export function buildCorpus({ projects, about, experiences, assistant }) {
	/** @type {Chunk[]} */
	const chunks = [];

	projects.forEach((project, index) => {
		const title = project.name;
		const url = project.url;
		const number = String(index + 1).padStart(2, "0");
		const head = `Case study ${number}: ${title}. Stack: ${project.stacks.join(", ")}. ${project.description}`;
		chunks.push({ id: `${project.slug}:overview`, title, url, kind: "project", text: `${head} Problem: ${project.problem}` });
		for (const [i, part] of split(`What he built: ${project.solution}`, 1400).entries()) {
			chunks.push({ id: `${project.slug}:solution:${i}`, title, url, kind: "project", text: `${title}. ${part}` });
		}
		const proof = (project.proof ?? []).map((p, i) => `${i + 1}. ${p}`).join(" ");
		for (const [i, part] of split(`Proof: ${proof} Result: ${project.result}`, 1600).entries()) {
			chunks.push({ id: `${project.slug}:proof:${i}`, title, url, kind: "project", text: `${title}. ${part}` });
		}
		if (project.links?.length) {
			const links = project.links.map((l) => `${l.label}: ${l.url}`).join("; ");
			chunks[chunks.length - 1].text += ` Links: ${links}.`;
		}
	});

	for (const experience of experiences) {
		const title = `${experience.role} at ${experience.company}`;
		chunks.push({
			id: `experience:${experience.company}`,
			title,
			url: "/about",
			kind: "experience",
			text: `Experience: ${experience.role}, ${experience.company}, ${experience.dates}. ${experience.description}`,
		});
	}

	chunks.push({
		id: "about:strengths",
		title: "About Revanza",
		url: "/about",
		kind: "about",
		text: `Strengths: ${about.strengths.join(" ")}`,
	});

	chunks.push({
		id: "facts",
		title: "Profile facts",
		url: "/about",
		kind: "facts",
		text: assistant.facts.join(" "),
	});

	return chunks;
}
