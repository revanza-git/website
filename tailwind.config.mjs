/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				paper: token("paper"),
				"paper-2": token("paper-2"),
				card: token("card"),
				ink: token("ink"),
				"ink-2": token("ink-2"),
				muted: token("muted"),
				rule: token("rule"),
				accent: token("accent"),
			},
			fontFamily: {
				serif: ["Newsreader", "Georgia", "Cambria", "serif"],
				sans: [
					'"Instrument Sans"',
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"Segoe UI",
					"sans-serif",
				],
				mono: [
					'"JetBrains Mono"',
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"monospace",
				],
			},
			maxWidth: {
				measure: "68ch",
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
