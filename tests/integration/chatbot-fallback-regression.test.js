import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

async function readFile(relativePath) {
  return fs.readFile(path.join(ROOT, relativePath), "utf8");
}

test("chatbot keeps hard fallback when WebGPU is unavailable", async () => {
  const source = await readFile("public/chatbot.js");

  assert.match(source, /if \(!navigator\.gpu\) \{\s*return false;\s*\}/);
  assert.match(source, /isWebGPUSupported = await checkWebGPUSupport\(\);/);
  assert.match(source, /if \(isMobileDevice\) \{\s*isWebGPUSupported = false;/);
  assert.match(
    source,
    /else if \(!isWebGPUSupported\) \{\s*addMessage\([\s\S]*WebGPU[\s\S]*updateStatus\("error", "WebGPU not supported"\);/m,
  );
});

test("chatbot uses FAQ mode path during non-WebGPU submissions", async () => {
  const source = await readFile("public/chatbot.js");

  assert.match(source, /if \(!isWebGPUSupported\) \{/);
  assert.match(source, /const faqResponse = findFAQResponse\(message\);/);
  assert.match(
    source,
    /isMobileDevice \? "mobile" : "error"[\s\S]*isMobileDevice \? "Mobile FAQ Ready" : "WebGPU not supported"/m,
  );
});

test("chatbot handles compatibility/model init failures by switching mode", async () => {
  const source = await readFile("public/chatbot.js");

  assert.match(
    source,
    /error\.message\.includes\("f16"\)[\s\S]*error\.message\.includes\("WebGPU"\)[\s\S]*error\.message\.includes\("shader"\)/m,
  );
  assert.match(source, /isWebGPUSupported = false; \/\/ Disable WebGPU for this session/);
  assert.match(source, /updateStatus\("mobile", "FAQ Mode Ready"\);/);
  assert.match(source, /I can still help answer questions about Revanza's portfolio/);
});
