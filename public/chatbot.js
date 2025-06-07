// ChatBot functionality - Client-side only
const portfolioContext = `You are a helpful assistant representing Revanza Raytama's portfolio. Here's comprehensive information about him:

PERSONAL INFO:
- Name: Revanza Raytama
- Location: Jakarta, Indonesia
- Role: Full-Stack & Data Engineer with 7+ years of experience

HEADLINE:
Full-Stack & Data Engineer (7+ yrs) | Building cloud-ready, data-intensive platforms that cut costs and surface real-time insights

PROFESSIONAL SUMMARY:
Senior Software & Data Engineer with 7+ years of experience designing backend systems, dashboards, and internal platforms that deliver business results—not just code. Specializes in cloud-native architecture, real-time data streaming, and large-scale data solutions across insurance, telco, and oil & gas sectors.

CORE STRENGTHS:
- Cloud-native web architecture (React/Next, .NET Core, Laravel, Java, Python)
- Data engineering & real-time streaming (Apache NiFi, Kafka, Spark, MQTT)
- SQL, BigQuery & lake-house design (5 TB+ pipelines; partitioning & clustering)
- DevOps & IaC (Docker, Kubernetes, GitLab CI/CD, Terraform)
- Project & stakeholder management (agile SDLC, cross-functional comms)
- Quantified value delivery (cost savings, staff-hour reductions, latency cuts)

SELECT PROJECTS:
1. Legacy-to-Cloud Modernization Platform (PT Nusantara Regas, 2024): Collapsed six ageing internal systems into a containerized, 3-tier platform. Saved 80 staff hours/month and avoided IDR 1.9B in vendor costs. Tech: .NET Core, React 18, SQL Server Always On, Docker, GitLab CI/CD.

2. FSRU Real-Time Operations Dashboard (PT Nusantara Regas – FSRU Division, 2025): Streamed 5,000+ sensor tags and surfaced near-instant KPIs. Reduced latency from 12h to <5min. Tech: Apache Spark, MQTT Broker, SQL Server, Talend CDC, Power BI.

3. In-House SQL Warehouse & Data Lake (PT Nusantara Regas, 2025): Unified 20+ siloed apps into a lake-house (PostgreSQL/NiFi → BigQuery). Added Cloud Scheduler, Monitoring & Slack alerts. Achieved 30% infra cost savings. Tech: PostgreSQL, Apache NiFi 1.19, Google BigQuery, GCP Composer, Cloud Monitoring.

4. SINV – Warehouse Inventory Management System (2024): Replaced spreadsheet workflow with a web app; added analytics, barcode intake, and Power BI connectors. Cut input time by 60%, reduced error rate by 90%. Tech: Laravel 10, Blazor WASM, SQL Server, Power BI Embedded.

5. FP3/LP3 Invoice-Merge Dashboard (2025): Automated OCR extraction and merging of PR/PO PDFs. Reduced paperwork turnaround from 3 days to same-day. Tech: ASP.NET Core 8.0, Tesseract OCR, SQL Server, Docker Compose.

6. Tugboat Fuel Monitoring System (2023): Digital fuel logbook & anomaly alerting for offshore tugboats. Detected 12 fuel leak events, saved 800L/month. Tech: React, Laravel 8, MySQL, Grafana.

7. DeFi Dashboard (Side Project, 2025): Next.js dashboard integrating MetaMask, RainbowKit, and ERC-20 token balances. Tech: Next.js 14, RainbowKit, Ethers.js, Tailwind CSS.

WORK HISTORY:
- PT Nusantara Regas (2017-2025): Software Engineer (Contract) → Lead Engineer. Owned architecture & maintenance of all internal web apps, led SDLC for third-party integrations, oversaw data-lake initiative, acted as PMO & QA liaison, and planned DevOps rollout.

EDUCATION:
- B.Sc. in Computer Science, Binus University, Indonesia (2017)


OPEN SOURCE & COMMUNITY:
- github.com/revanza-git – samples and personal utilities (CI, Laravel, NiFi templates)
- Mentor juniors on clean architecture & data pipelines

FUTURE FOCUS:
Transitioning into Solution / Data Architect roles, strengthening product-sense & ML Ops, Currently learning AI and Blockchain.

EXPERTISE AREAS:
- Software Engineering (Backend systems, APIs, distributed systems)
- Data Engineering (ETL, data pipelines, analytics dashboards)
- Platform Development (internal tools, automation, infrastructure)

INDUSTRY EXPERIENCE:
- Insurance
- Telecommunications
- Oil & Gas

IMPORTANT NOTE:
Revanza is not a digital marketer or UI/UX expert—he specializes in robust, scalable software and data solutions for complex business needs.

Please answer questions about Revanza's background, experience, projects, and skills based on this information. Be helpful, professional, and accurate. If asked about something not covered in this context, politely mention that you'd need more specific information.`;

let chatContainer = null;
let chatToggle = null;
let closeChat = null;
let chatForm = null;
let chatInput = null;
let chatMessages = null;
let sendButton = null;
let statusIndicator = null;
let statusText = null;
let charCounter = null;
let chatHistory = [];
let client = null;
let modelLoaded = false;
let modelLoading = false;

// Context window management
const MAX_CONTEXT_TOKENS = 3500; // Leave some buffer for model response
const SLIDING_WINDOW_SIZE = 10; // Keep last 10 messages

// Rough token estimation (approximate 4 chars per token)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Manage context window size by keeping recent messages
function manageContextWindow(messages) {
  const systemTokens = estimateTokens(portfolioContext);
  let totalTokens = systemTokens;
  const managedMessages = [];

  // Start from the most recent messages and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = estimateTokens(messages[i].content);

    if (totalTokens + messageTokens > MAX_CONTEXT_TOKENS) {
      break;
    }

    totalTokens += messageTokens;
    managedMessages.unshift(messages[i]);

    // Also limit by sliding window size
    if (managedMessages.length >= SLIDING_WINDOW_SIZE) {
      break;
    }
  }

  console.log(
    `Context management: Using ${managedMessages.length} messages, ~${totalTokens} tokens`,
  );
  return managedMessages;
}

// Update status indicator
function updateStatus(status, text) {
  if (!statusIndicator || !statusText) return;

  statusIndicator.className = `w-2 h-2 rounded-full ${
    status === "loading"
      ? "bg-yellow-500 animate-pulse"
      : status === "ready"
        ? "bg-green-500 animate-pulse"
        : status === "error"
          ? "bg-red-500"
          : "bg-gray-500"
  }`;
  statusText.textContent = text;
}

// Initialize WebLLM only when needed
async function initModel() {
  if (modelLoading || modelLoaded || !navigator.gpu) {
    if (!navigator.gpu) {
      addMessage(
        "⚠️ Your browser doesn't support WebGPU. Some features may be limited.",
        "assistant",
      );
      updateStatus("error", "WebGPU not supported");
    }
    return;
  }

  modelLoading = true;
  updateStatus("loading", "Loading AI model...");

  try {
    console.log("Starting model initialization...");

    // Dynamic import to reduce initial bundle size
    const { CreateMLCEngine } = await import(
      "https://esm.run/@mlc-ai/web-llm@0.2.79"
    );
    console.log("Module loaded successfully");

    client = await CreateMLCEngine("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
    console.log("MLCEngine created and model loaded");

    modelLoaded = true;
    modelLoading = false;
    updateStatus("ready", "AI Ready");
    addMessage("AI is ready to help you!", "assistant");
  } catch (error) {
    console.error("Failed to load model:", error);
    modelLoading = false;
    updateStatus("error", "Failed to load AI");
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    addMessage(
      "Failed to load AI model. Please check the console for details and refresh the page.",
      "assistant",
    );
  }
}

function addMessage(text, sender, isLoading = false) {
  const messageDiv = document.createElement("div");
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  messageDiv.id = messageId;
  messageDiv.className = `flex ${sender === "user" ? "justify-end" : "justify-start"}`;

  const messageBubble = document.createElement("div");
  messageBubble.className = `message-bubble max-w-[85%] p-4 rounded-2xl shadow-sm ${
    sender === "user"
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm"
      : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-bl-sm"
  }`;

  if (isLoading) {
    messageBubble.innerHTML = `
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
  } else {
    // Format text with basic markdown-like styling
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded text-sm">$1</code>',
      );

    messageBubble.innerHTML = formattedText;
  }

  messageDiv.appendChild(messageBubble);
  chatMessages?.appendChild(messageDiv);

  // Smooth scroll to bottom
  setTimeout(() => {
    chatMessages?.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }, 100);

  console.log(`Added message with ID: ${messageId}, isLoading: ${isLoading}`);
  return messageId;
}

// Helper function to safely remove loading messages
function removeLoadingMessage(loadingId) {
  const loadingMessage = document.getElementById(loadingId);
  if (loadingMessage) {
    console.log(`Removing loading message with ID: ${loadingId}`);
    loadingMessage.remove();
    return true;
  } else {
    console.warn(`Loading message with ID ${loadingId} not found`);
    return false;
  }
}

// Helper function to clear any stuck loading messages
function clearStuckLoadingMessages() {
  if (!chatMessages) return;

  const allMessages = chatMessages.querySelectorAll('[id^="msg-"]');
  allMessages.forEach((msg) => {
    const loadingElement = msg.querySelector(".loading-dots");
    if (loadingElement) {
      console.log(`Removing stuck loading message: ${msg.id}`);
      msg.remove();
    }
  });
}

// Function to clear all chat messages
function clearAllMessages() {
  if (chatMessages) {
    chatMessages.innerHTML = "";
    chatHistory = [];
    console.log("Cleared all chat messages and history");

    // Add initial greeting again
    addMessage(
      "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
      "assistant",
    );
    chatHistory.push({
      role: "assistant",
      content:
        "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
    });
  }
}

// Update character counter
function updateCharCounter() {
  if (chatInput && charCounter) {
    const length = chatInput.value.length;
    charCounter.textContent = `${length}/500`;

    if (length > 450) {
      charCounter.className = "absolute bottom-1 right-3 text-xs text-red-500";
    } else if (length > 400) {
      charCounter.className =
        "absolute bottom-1 right-3 text-xs text-yellow-500";
    } else {
      charCounter.className =
        "absolute bottom-1 right-3 text-xs text-neutral-400";
    }
  }
}

// Debug function to check chat state
function debugChatState() {
  console.log("=== Chat Debug Info ===");
  console.log("Chat History Length:", chatHistory.length);
  console.log("DOM Messages Count:", chatMessages?.children.length || 0);
  console.log("Model Loaded:", modelLoaded);
  console.log("Model Loading:", modelLoading);
  console.log("Recent Chat History:", chatHistory.slice(-3));
  console.log("======================");
}

document.addEventListener("DOMContentLoaded", () => {
  chatContainer = document.getElementById("chat-container");
  chatToggle = document.getElementById("chat-toggle");
  closeChat = document.getElementById("close-chat");
  const clearChat = document.getElementById("clear-chat");
  chatForm = document.getElementById("chat-form");
  chatInput = document.getElementById("chat-input");
  chatMessages = document.getElementById("chat-messages");
  sendButton = document.getElementById("send-button");
  statusIndicator = document.getElementById("status-indicator");
  statusText = document.getElementById("status-text");
  charCounter = document.getElementById("char-counter");

  // Add initial greeting
  addMessage(
    "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
    "assistant",
  );
  chatHistory.push({
    role: "assistant",
    content:
      "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
  });

  // Set initial status
  updateStatus("ready", "AI Ready");

  // Add loading state message if model is not loaded
  if (!modelLoaded) {
    updateStatus("loading", "Loading...");
  }

  // Character counter
  chatInput?.addEventListener("input", updateCharCounter);

  // Enter key handling
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm?.requestSubmit();
    }
  });

  chatToggle?.addEventListener("click", () => {
    const wasHidden = chatContainer?.classList.contains("hidden");
    chatContainer?.classList.toggle("hidden");

    // Initialize model when chat is first opened
    if (wasHidden && !modelLoaded && !modelLoading) {
      initModel();
    }

    // Focus input when opening
    if (wasHidden && chatInput) {
      setTimeout(() => chatInput.focus(), 100);
    }
  });

  closeChat?.addEventListener("click", () => {
    chatContainer?.classList.add("hidden");
  });

  clearChat?.addEventListener("click", () => {
    clearAllMessages();
  });

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chatInput || !chatInput.value.trim()) return;

    const message = chatInput.value.trim();

    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;
    updateStatus("loading", "Thinking...");

    // Add user message
    addMessage(message, "user");
    chatHistory.push({ role: "user", content: message });
    chatInput.value = "";
    updateCharCounter();

    // Show loading state
    const loadingId = addMessage("", "assistant", true);
    console.log(`Created loading message with ID: ${loadingId}`);

    try {
      if (modelLoaded && client) {
        // Manage context window to prevent token limit exceeded
        const managedHistory = manageContextWindow(chatHistory);

        // Use local model - non-streaming for now
        const response = await client.chat.completions.create({
          messages: [
            { role: "system", content: portfolioContext },
            ...managedHistory,
          ],
        });

        const botResponse = response.choices[0].message.content;

        // Remove loading message and add final response
        const removed = removeLoadingMessage(loadingId);
        console.log(`Loading message removal successful: ${removed}`);

        if (botResponse && botResponse.trim()) {
          addMessage(botResponse, "assistant");
          chatHistory.push({ role: "assistant", content: botResponse });
          updateStatus("ready", "AI Ready");
        } else {
          addMessage(
            "I received an empty response. Please try again.",
            "assistant",
          );
          updateStatus("error", "Empty response");
        }
      } else {
        // Remove loading message
        removeLoadingMessage(loadingId);
        addMessage(
          "I'm still loading my brain. Please try again in a moment!",
          "assistant",
        );
        updateStatus("loading", "Still loading...");
      }
    } catch (error) {
      console.error("Error:", error);
      // Remove loading message
      removeLoadingMessage(loadingId);

      // Clear any other stuck loading messages
      setTimeout(() => clearStuckLoadingMessages(), 1000);

      // Check if it's a context window error and provide helpful message
      if (
        error instanceof Error &&
        error.message.includes("ContextWindowSizeExceededError")
      ) {
        addMessage(
          "The conversation has become too long. I'll start fresh to continue helping you. Please repeat your question.",
          "assistant",
        );
        // Clear chat history to start fresh
        chatHistory = [];
        updateStatus("ready", "AI Ready");
      } else {
        addMessage(
          "Sorry, I encountered an error. Please try again.",
          "assistant",
        );
        updateStatus("error", "Error occurred");
      }
    } finally {
      // Debug chat state
      debugChatState();

      // Re-enable input
      if (chatInput && sendButton) {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
        updateStatus("ready", "AI Ready");
      }
    }
  });
});
