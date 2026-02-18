import assert from "node:assert/strict";
import test from "node:test";

import {
  escapeHtml,
  formatMessageHtml,
  manageContextWindow,
} from "../../public/chatbot-utils.js";

test("escapeHtml escapes HTML-sensitive characters", () => {
  const input = `<script>alert("xss")</script> & 'quoted'`;
  const output = escapeHtml(input);

  assert.equal(
    output,
    "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;",
  );
});

test("formatMessageHtml keeps safe markdown and escapes raw HTML", () => {
  const input = "<img src=x onerror=alert(1)> **bold** *italic* `code`";
  const output = formatMessageHtml(input);

  assert.match(output, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(output, /<strong>bold<\/strong>/);
  assert.match(output, /<em>italic<\/em>/);
  assert.match(output, /<code class="[^"]+">code<\/code>/);
  assert.doesNotMatch(output, /<script>/i);
});

test("manageContextWindow keeps most recent messages under token budget", () => {
  const messages = [
    { role: "user", content: "a".repeat(20) },
    { role: "assistant", content: "b".repeat(20) },
    { role: "user", content: "c".repeat(20) },
    { role: "assistant", content: "d".repeat(20) },
    { role: "user", content: "e".repeat(20) },
  ];

  const managed = manageContextWindow(messages, "system", {
    maxContextTokens: 17,
    slidingWindowSize: 10,
  });

  assert.equal(managed.length, 3);
  assert.deepEqual(
    managed.map((message) => message.content[0]),
    ["c", "d", "e"],
  );
});

test("manageContextWindow honors sliding-window size", () => {
  const messages = [
    { role: "user", content: "first" },
    { role: "assistant", content: "second" },
    { role: "user", content: "third" },
  ];

  const managed = manageContextWindow(messages, "system", {
    maxContextTokens: 999,
    slidingWindowSize: 2,
  });

  assert.equal(managed.length, 2);
  assert.deepEqual(
    managed.map((message) => message.content),
    ["second", "third"],
  );
});
