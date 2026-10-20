// Header border on scroll, active nav link, the light/dark toggle, and scroll reveals.
// Pages navigate with Astro view transitions, so set-up runs on astro:page-load
// (which also fires on the first load) instead of DOMContentLoaded.

const updateHeader = () => {
	const header = document.getElementById("header");
	if (!header) return;
	const scrolled = window.scrollY > 8;
	header.classList.toggle("border-rule", scrolled);
	header.classList.toggle("border-transparent", !scrolled);
};

const markActiveNav = () => {
	const path = window.location.pathname.replace(/\/$/, "") || "/";
	for (const link of document.querySelectorAll("a[data-nav]")) {
		const target = link.pathname.replace(/\/$/, "") || "/";
		const active = target === path || (target !== "/" && path.startsWith(`${target}/`));
		if (active) link.setAttribute("aria-current", "page");
		else link.removeAttribute("aria-current");
	}
};

const bindDarkToggle = () => {
	const button = document.getElementById("darkToggle");
	if (!button || button.dataset.bound) return;
	button.dataset.bound = "true";
	button.addEventListener("click", () => {
		const isDark = document.documentElement.classList.toggle("dark");
		try {
			localStorage.setItem("dark_mode", isDark ? "true" : "false");
		} catch (e) {
			// Storage can be unavailable (private mode); the toggle still works for this page.
		}
	});
};

// Fade [data-reveal] elements up as they scroll into view. Elements already on screen
// are left alone, so nothing flashes and the page is complete without JavaScript.
const revealOnScroll = () => {
	const items = document.querySelectorAll("[data-reveal]:not(.reveal)");
	if (items.length === 0 || !("IntersectionObserver" in window)) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const observer = new IntersectionObserver(
		(entries, io) => {
			let order = 0;
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.style.transitionDelay = `${order++ * 60}ms`;
				entry.target.classList.add("is-visible");
				io.unobserve(entry.target);
			}
		},
		{ rootMargin: "0px 0px -10% 0px" },
	);
	const fold = window.innerHeight;
	for (const el of items) {
		if (el.getBoundingClientRect().top < fold) continue;
		el.classList.add("reveal");
		observer.observe(el);
	}
};

const init = () => {
	updateHeader();
	markActiveNav();
	bindDarkToggle();
	revealOnScroll();
};

window.addEventListener("scroll", updateHeader, { passive: true });

// The swap replaces <html> attributes, so re-apply the colour scheme before the new page
// paints, and mark the document so the .rise entrance does not replay on every navigation.
document.addEventListener("astro:after-swap", () => {
	document.documentElement.classList.add("swapped");
	try {
		const stored = localStorage.getItem("dark_mode");
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		if (stored === "true" || (stored === null && prefersDark)) {
			document.documentElement.classList.add("dark");
		}
	} catch (e) {
		// Without storage the scheme falls back to the system preference on each page.
	}
});

document.addEventListener("astro:page-load", init);
