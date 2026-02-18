import { expect, test } from "@playwright/test";

const base = "https://revanza.vercel.app";
const paths = [
  "/",
  "/about",
  "/projects",
  "/blog",
  "/blog/rewiring-5tb-data-pipeline-at-home",
  "/posts",
  "/post/rewiring-5tb-data-pipeline-at-home",
];

for (const path of paths) {
  test(`no critical client-side errors on ${path}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on("pageerror", (error) => {
      pageErrors.push(String(error));
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("requestfailed", (request) => {
      failedRequests.push(
        `${request.method()} ${request.url()} :: ${request.failure()?.errorText || "unknown"}`,
      );
    });

    const response = await page.goto(`${base}${path}`, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });

    // Accept legacy redirect routes and successful page responses.
    expect([200, 301, 302, 307, 308]).toContain(response?.status() ?? 0);

    // Static production pages should not emit runtime script errors.
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}
