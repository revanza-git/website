// PreToolUse hook: before a `git commit`, remind Claude to check the repo docs
// and .gitignore for staleness. Reads the hook payload on stdin, prints JSON.
import { execSync } from "node:child_process";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
	input += chunk;
});
process.stdin.on("end", () => {
	let command = "";
	try {
		command = JSON.parse(input).tool_input?.command ?? "";
	} catch {
		// Not JSON; nothing to do.
	}
	if (!/\bgit\b[^\n]*\bcommit\b/.test(command)) return;

	let status = "";
	try {
		status = execSync("git status --short", { encoding: "utf8" })
			.split("\n")
			.filter(Boolean)
			.slice(0, 40)
			.join("; ");
	} catch {
		status = "(git status unavailable)";
	}

	const context = [
		"Commit docs check (repo hook).",
		"Before this commit, decide whether README.md, CLAUDE.md, AGENTS.md or .gitignore are stale for these changes",
		"(new commands, env vars, routes, content rules, generated files). If so, update them and include them in this same commit.",
		"Do not add Co-Authored-By or any other AI attribution to the commit message.",
		`Working tree: ${status || "(clean)"}`,
	].join(" ");

	process.stdout.write(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				additionalContext: context,
			},
		}),
	);
});
