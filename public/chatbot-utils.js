export const DEFAULT_MAX_CONTEXT_TOKENS = 3500;
export const DEFAULT_SLIDING_WINDOW_SIZE = 10;

export function estimateTokens(text = "") {
  return Math.ceil(String(text).length / 4);
}

export function manageContextWindow(
  messages,
  systemPrompt,
  options = {},
) {
  const maxContextTokens =
    options.maxContextTokens ?? DEFAULT_MAX_CONTEXT_TOKENS;
  const slidingWindowSize =
    options.slidingWindowSize ?? DEFAULT_SLIDING_WINDOW_SIZE;

  const systemTokens = estimateTokens(systemPrompt);
  let totalTokens = systemTokens;
  const managedMessages = [];

  // Keep the most recent messages while respecting token/window limits.
  for (let i = messages.length - 1; i >= 0; i--) {
    const currentMessage = messages[i];
    const messageTokens = estimateTokens(currentMessage?.content ?? "");

    if (totalTokens + messageTokens > maxContextTokens) {
      break;
    }

    totalTokens += messageTokens;
    managedMessages.unshift(currentMessage);

    if (managedMessages.length >= slidingWindowSize) {
      break;
    }
  }

  return managedMessages;
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMessageHtml(text = "") {
  const safeText = escapeHtml(text);

  return safeText
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(
      /`([^`\n]+)`/g,
      '<code class="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded text-sm">$1</code>',
    )
    .replace(/\n/g, "<br>");
}
