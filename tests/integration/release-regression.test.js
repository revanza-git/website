import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

async function readFile(relativePath) {
  return fs.readFile(path.join(ROOT, relativePath), "utf8");
}

async function getAstroFiles(dir) {
  const absoluteDir = path.join(ROOT, dir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAstroFiles(relativePath)));
      continue;
    }

    if (entry.isFile() && relativePath.endsWith(".astro")) {
      files.push(relativePath);
    }
  }

  return files;
}

test("vercel redirects keep legacy /posts and /post/:slug compatibility", async () => {
  const content = await readFile("vercel.json");
  const config = JSON.parse(content);
  const redirects = config.redirects ?? [];

  assert.ok(
    redirects.some(
      (redirect) =>
        redirect.source === "/posts" &&
        redirect.destination === "/blog" &&
        redirect.permanent === true,
    ),
  );

  assert.ok(
    redirects.some(
      (redirect) =>
        redirect.source === "/post/:slug" &&
        redirect.destination === "/blog/:slug" &&
        redirect.permanent === true,
    ),
  );
});

test("redirect pages keep canonical route and noindex semantics", async () => {
  const postsRedirect = await readFile("src/pages/posts.astro");
  const postSlugRedirect = await readFile("src/pages/post/[slug].astro");

  assert.match(postsRedirect, /const target = "\/blog";/);
  assert.match(postsRedirect, /meta http-equiv="refresh"/);
  assert.match(postsRedirect, /rel="canonical" href=\{target\}/);
  assert.match(postsRedirect, /noindex, follow/);

  assert.match(postSlugRedirect, /const target = `\/blog\/\$\{slug\}`;/);
  assert.match(postSlugRedirect, /meta http-equiv="refresh"/);
  assert.match(postSlugRedirect, /rel="canonical" href=\{target\}/);
  assert.match(postSlugRedirect, /noindex, follow/);
});

test("all target=_blank anchors include noopener noreferrer", async () => {
  const astroFiles = await getAstroFiles("src");
  const failures = [];

  for (const file of astroFiles) {
    const content = await readFile(file);
    const anchorTags = content.match(/<a\b[\s\S]*?>/g) ?? [];

    for (const anchorTag of anchorTags) {
      if (!anchorTag.includes('target="_blank"')) {
        continue;
      }
      const hasNoopener = /rel="[^"]*\bnoopener\b[^"]*"/.test(anchorTag);
      const hasNoreferrer = /rel="[^"]*\bnoreferrer\b[^"]*"/.test(anchorTag);
      if (!hasNoopener || !hasNoreferrer) {
        failures.push(`${file}: ${anchorTag.replace(/\s+/g, " ").trim()}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test("env HTML injection remains explicitly gated by ENABLE_HTML_INJECT", async () => {
  const content = await readFile("src/layouts/main.astro");

  assert.match(
    content,
    /const allowHtmlInject = import\.meta\.env\.ENABLE_HTML_INJECT === "true";/,
  );
  assert.match(content, /\{allowHtmlInject && <Fragment set:html=\{headerInject\} \/>\}/);
  assert.match(content, /\{allowHtmlInject && <Fragment set:html=\{footerInject\} \/>\}/);
});
