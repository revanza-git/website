// Header border on scroll, active nav link, and the light/dark toggle.

document.addEventListener("DOMContentLoaded", () => {
	const header = document.getElementById("header");

	const updateHeader = () => {
		if (!header) return;
		const scrolled = window.scrollY > 8;
		header.classList.toggle("border-rule", scrolled);
		header.classList.toggle("border-transparent", !scrolled);
	};
	updateHeader();
	window.addEventListener("scroll", updateHeader, { passive: true });

	const path = window.location.pathname.replace(/\/$/, "") || "/";
	for (const link of document.querySelectorAll("a[data-nav]")) {
		const target = link.pathname.replace(/\/$/, "") || "/";
		if (target === path || (target !== "/" && path.startsWith(`${target}/`))) {
			link.setAttribute("aria-current", "page");
		}
	}

	document.getElementById("darkToggle")?.addEventListener("click", () => {
		const isDark = document.documentElement.classList.toggle("dark");
		try {
			localStorage.setItem("dark_mode", isDark ? "true" : "false");
		} catch (e) {
			// Storage can be unavailable (private mode); the toggle still works for this page.
		}
	});
});
