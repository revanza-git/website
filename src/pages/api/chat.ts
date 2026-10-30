import type { APIRoute } from "astro";
import about from "../../collections/about.json";
import assistant from "../../collections/assistant.json";
import experiences from "../../collections/experiences.json";
import projects from "../../collections/projects.json";
import { buildCorpus } from "../../lib/assistant/corpus.js";
import { SYSTEM_PROMPT, buildContext } from "../../lib/assistant/prompt.js";
import { buildIndex, search } from "../../lib/assistant/retrieve.js";

// The only server-rendered route on the site: everything else is prerendered.
export const prerender = false;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = import.meta.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
const FALLBACK_MODEL = import.meta.env.GROQ_FALLBACK_MODEL ?? "llama-3.1-8b-instant";
const MAX_TURNS = 6; // messages kept from the conversation (user + assistant)
const MAX_MESSAGE_CHARS = 500;
const MAX_OUTPUT_TOKENS = 400;
const RATE_LIMIT = { windowMs: 60_000, max: 10 }; // per IP, per serverless instance (best effort)

const corpus = buildCorpus({ projects, about, experiences, assistant });
const index = buildIndex(corpus.filter((c) => c.kind !== "facts"));
const facts = corpus.find((c) => c.kind === "facts")?.text ?? "";

type ChatMessage = { role: "user" | "assistant"; content: string };

const recent = new Map<string, number[]>();
const limited = (ip: string) => {
	const now = Date.now();
	const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
	hits.push(now);
	recent.set(ip, hits);
	if (recent.size > 5000) recent.clear();
	return hits.length > RATE_LIMIT.max;
};

const json = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const validate = (payload: unknown): ChatMessage[] | null => {
	if (!payload || typeof payload !== "object") return null;
	const raw = (payload as { messages?: unknown }).messages;
	if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS * 2) return null;
	const messages: ChatMessage[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") return null;
		const { role, content } = item as { role?: unknown; content?: unknown };
		if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
		const text = content.trim();
		if (!text || text.length > MAX_MESSAGE_CHARS * (role === "assistant" ? 4 : 1)) return null;
		messages.push({ role, content: text });
	}
	if (messages[messages.length - 1].role !== "user") return null;
	return messages.slice(-MAX_TURNS);
};

const verifyTurnstile = async (token: unknown, ip: string) => {
	const secret = import.meta.env.TURNSTILE_SECRET_KEY;
	if (!secret) return true; // not configured: skip
	if (typeof token !== "string" || !token) return false;
	const body = new URLSearchParams({ secret, response: token, remoteip: ip });
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
	const data = (await res.json()) as { success?: boolean };
	return data.success === true;
};

const callGroq = async (model: string, messages: object[], signal: AbortSignal) => {
	const body: Record<string, unknown> = {
		model,
		messages,
		max_tokens: MAX_OUTPUT_TOKENS,
		temperature: 0.3,
		stream: true,
	};
	if (model.startsWith("openai/gpt-oss")) body.reasoning_effort = "low";
	return fetch(GROQ_URL, {
		method: "POST",
		headers: { "content-type": "application/json", authorization: `Bearer ${import.meta.env.GROQ_API_KEY}` },
		body: JSON.stringify(body),
		signal,
	});
};

// Turns Groq's SSE stream into a plain text stream of answer tokens.
const textStream = (upstream: ReadableStream<Uint8Array>) => {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = "";
	return upstream.pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				buffer += decoder.decode(chunk, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					if (!line.startsWith("data:")) continue;
					const data = line.slice(5).trim();
					if (!data || data === "[DONE]") continue;
					try {
						const delta = JSON.parse(data).choices?.[0]?.delta?.content;
						if (delta) controller.enqueue(encoder.encode(delta));
					} catch {
						// a partial frame; the remainder arrives with the next chunk
					}
				}
			},
		}),
	);
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
	if (!import.meta.env.GROQ_API_KEY) return json(503, { error: "The assistant is not configured." });
	const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || clientAddress || "unknown";
	if (limited(ip)) return json(429, { error: "Too many questions in a minute. Please wait a moment." });

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json(400, { error: "Invalid request." });
	}
	const messages = validate(payload);
	if (!messages) return json(400, { error: "Invalid request." });
	if (!(await verifyTurnstile((payload as { turnstileToken?: unknown }).turnstileToken, ip))) {
		return json(403, { error: "Verification failed. Please try again." });
	}

	// Retrieval query: the question plus the previous question, so follow-ups keep their subject.
	const userTurns = messages.filter((m) => m.role === "user").map((m) => m.content);
	const query = userTurns.slice(-2).join(" ");
	const hits = search(index, query, { limit: 5, maxChars: 9000 });
	const context = buildContext(hits, facts);

	const upstreamMessages = [
		{ role: "system", content: `${SYSTEM_PROMPT}\n\n${context}` },
		...messages,
	];

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 30_000);
	try {
		let res = await callGroq(PRIMARY_MODEL, upstreamMessages, controller.signal);
		if ((res.status === 429 || res.status === 404 || res.status === 503) && FALLBACK_MODEL !== PRIMARY_MODEL) {
			res = await callGroq(FALLBACK_MODEL, upstreamMessages, controller.signal);
		}
		if (!res.ok || !res.body) {
			clearTimeout(timer);
			const detail = await res.text().catch(() => "");
			console.error("assistant upstream error", res.status, detail.slice(0, 300));
			const message =
				res.status === 429
					? "The assistant has hit its usage limit for now. Please try again later or download the resume."
					: "The assistant is unavailable right now. Please try again later.";
			return json(503, { error: message });
		}
		const sources = hits.map(({ chunk }) => ({ title: chunk.title, url: chunk.url }));
		const unique = sources.filter((s, i) => sources.findIndex((o) => o.url === s.url) === i).slice(0, 3);
		return new Response(textStream(res.body), {
			status: 200,
			headers: {
				"content-type": "text/plain; charset=utf-8",
				"cache-control": "no-store",
				"x-assistant-sources": encodeURIComponent(JSON.stringify(unique)),
			},
		});
	} catch (error) {
		clearTimeout(timer);
		console.error("assistant request failed", error);
		return json(503, { error: "The assistant is unavailable right now. Please try again later." });
	}
};
