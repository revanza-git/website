import { formatMessageHtml, manageContextWindow } from "./chatbot-utils.js";

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

// Mobile FAQ system for fallback
const mobileFAQ = {
  // Keywords to match against user input
  projects: {
    keywords: [
      "project",
      "projects",
      "work",
      "portfolio",
      "what did you build",
      "what have you built",
    ],
    response: `**🚀 Key Projects:**

**Legacy-to-Cloud Platform** (2024) - Modernized 6 internal systems, saved IDR 1.9B
**Real-Time Operations Dashboard** (2025) - 5,000+ sensor tags, reduced latency from 12h to <5min  
**Data Lake & Warehouse** (2025) - Unified 20+ apps, 30% cost savings
**Inventory Management System** (2024) - Cut input time by 60%, reduced errors by 90%

*Want more details? Check out the Projects section above! 👆*`,
  },

  experience: {
    keywords: [
      "experience",
      "background",
      "years",
      "career",
      "work history",
      "job",
    ],
    response: `**💼 Professional Background:**

**7+ years** as a Full-Stack & Data Engineer
**Current Role:** Lead Engineer at PT Nusantara Regas (2017-2025)
**Education:** B.Sc. Computer Science, Binus University (2017)

**Expertise:** Cloud architecture, data engineering, real-time streaming, DevOps

*Explore the About section for more details! 📖*`,
  },

  skills: {
    keywords: [
      "skill",
      "skills",
      "technology",
      "tech",
      "stack",
      "programming",
      "languages",
    ],
    response: `**🛠️ Technical Skills:**

**Backend:** .NET Core, Laravel, Java, Python
**Frontend:** React, Next.js, Blazor
**Data:** Apache NiFi, Kafka, Spark, BigQuery, SQL
**Cloud:** Docker, Kubernetes, GCP, GitLab CI/CD
**Databases:** SQL Server, PostgreSQL, MySQL

*Check out the full tech stack in the projects above! ⚡*`,
  },

  contact: {
    keywords: ["contact", "email", "reach", "hire", "linkedin", "get in touch"],
    response: `**📞 Let's Connect:**

**Email:** revanza.raytama@gmail.com
**LinkedIn:** linkedin.com/in/revanzaraytama
**GitHub:** github.com/revanza-git

*Feel free to reach out for collaboration opportunities! 🤝*`,
  },

  about: {
    keywords: ["about", "who", "introduction", "tell me about", "revanza"],
    response: `**👨‍💻 About Revanza:**

Award-winning **Software & Data Engineer** with **7+ years** of experience turning complex business problems into scalable solutions.

**Specializes in:** Cloud-native architecture, data platforms, real-time systems
**Industries:** Energy, Insurance, Telecommunications
**Impact:** Saved companies millions, automated critical processes

*Scroll up to read the full story! 📚*`,
  },
};

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
let isMobileDevice = false;
let isWebGPUSupported = false;

// Context window management
const MAX_CONTEXT_TOKENS = 3500; // Leave some buffer for model response
const SLIDING_WINDOW_SIZE = 10; // Keep last 10 messages

// Detect mobile device
function detectMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

// Check WebGPU support
async function checkWebGPUSupport() {
  if (!navigator.gpu) {
    return false;
  }

  try {
    // Check if we can get a GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return false;
    }

    // Check for required features/extensions that the AI model needs
    const device = await adapter.requestDevice();
    if (!device) {
      return false;
    }

    // Test shader compilation to check for f16 support
    try {
      // Try to create a simple shader module to test WebGPU capabilities
      device.createShaderModule({
        code: `
          @vertex fn vs_main() -> @builtin(position) vec4<f32> {
            return vec4<f32>(0.0, 0.0, 0.0, 1.0);
          }
          
          @fragment fn fs_main() -> @location(0) vec4<f32> {
            return vec4<f32>(1.0, 0.0, 0.0, 1.0);
          }
        `,
      });

      // If we can create the shader, WebGPU is working
      return true;
    } catch (shaderError) {
      console.warn("WebGPU shader compilation failed:", shaderError);
      return false;
    }
  } catch (error) {
    console.warn("WebGPU detection failed:", error);
    return false;
  }
}

// Find matching FAQ response
function findFAQResponse(input) {
  const lowercaseInput = input.toLowerCase();

  for (const data of Object.values(mobileFAQ)) {
    if (data.keywords.some((keyword) => lowercaseInput.includes(keyword))) {
      return data.response;
    }
  }

  // Default response if no match found
  return `I'd love to help! Try asking about:
  
**📱 Quick topics:**
• "**projects**" - See Revanza's key work
• "**skills**" - Technical expertise  
• "**experience**" - Professional background
• "**contact**" - Get in touch

*For the full AI experience, try this on desktop! 💻*`;
}

// Update status indicator
function updateStatus(status, text) {
  if (!statusIndicator || !statusText) return;

  statusIndicator.className = `w-2 h-2 rounded-full ${
    status === "loading"
      ? "bg-yellow-500 animate-pulse"
      : status === "ready"
        ? "bg-green-500 animate-pulse"
        : status === "mobile"
          ? "bg-blue-500 animate-pulse"
          : status === "error"
            ? "bg-red-500"
            : "bg-gray-500"
  }`;
  statusText.textContent = text;
}

// Initialize WebLLM only when needed
async function initModel() {
  // Multiple safety checks to prevent WebGPU initialization on mobile
  if (isMobileDevice) {
    console.log("Skipping AI model initialization on mobile device");
    addMessage(
      `**📱 Welcome to mobile!**
      
The full AI chatbot needs a desktop browser, but I can still help! Try asking about:

• **"projects"** - Key portfolio work
• **"skills"** - Technical expertise  
• **"experience"** - Professional background
• **"contact"** - Get in touch

*For the complete AI experience, visit on desktop! 💻*`,
      "assistant",
    );
    updateStatus("mobile", "Mobile FAQ Ready");
    return;
  }

  // Check device capabilities first
  if (!isWebGPUSupported) {
    console.log("WebGPU not supported, falling back to FAQ mode");
    addMessage(
      "⚠️ Your browser doesn't support WebGPU. Please try Chrome 113+, Edge 113+, or Firefox 113+ for the full AI experience. I can still help with basic questions!",
      "assistant",
    );
    updateStatus("error", "WebGPU not supported");
    return;
  }

  if (modelLoading || modelLoaded) {
    return;
  }

  modelLoading = true;
  updateStatus("loading", "Loading AI model...");

  try {
    console.log("Starting model initialization...");

    // Additional check before importing WebLLM
    if (!navigator.gpu) {
      throw new Error("WebGPU not available");
    }

    // Dynamic import to reduce initial bundle size
    const { CreateMLCEngine } = await import(
      "https://esm.run/@mlc-ai/web-llm@0.2.79"
    );
    console.log("Module loaded successfully");

    // Try to create the AI model with error handling for mobile compatibility
    client = await CreateMLCEngine("Qwen2.5-0.5B-Instruct-q4f16_1-MLC", {
      initProgressCallback: (progress) => {
        console.log("Loading progress:", progress.text, progress.progress);
        updateStatus(
          "loading",
          `Loading: ${Math.round(progress.progress * 100)}%`,
        );
      },
    });
    console.log("MLCEngine created and model loaded");

    modelLoaded = true;
    modelLoading = false;
    updateStatus("ready", "AI Ready");
    addMessage(
      "🚀 **AI is ready to help you!** Ask me anything about Revanza's portfolio, projects, or experience!",
      "assistant",
    );
  } catch (error) {
    console.error("Failed to load model:", error);
    modelLoading = false;

    // Check if the error is related to WebGPU or mobile compatibility
    if (
      error.message &&
      (error.message.includes("f16") ||
        error.message.includes("WebGPU") ||
        error.message.includes("extension") ||
        error.message.includes("shader"))
    ) {
      console.log("WebGPU compatibility error detected, switching to FAQ mode");
      isWebGPUSupported = false; // Disable WebGPU for this session
      updateStatus("mobile", "FAQ Mode Ready");
      addMessage(
        "🤖 I've switched to compatibility mode! I can still help answer questions about Revanza's portfolio. Try asking about projects, skills, experience, or contact info!",
        "assistant",
      );
    } else {
      updateStatus("error", "Failed to load AI");
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      addMessage(
        "Failed to load AI model. I'll use FAQ mode instead. Please ask about projects, skills, experience, or contact info!",
        "assistant",
      );
    }
  }
}

function addMessage(text, sender, isLoading = false) {
  const messageDiv = document.createElement("div");
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  messageDiv.id = messageId;
  messageDiv.className = `flex ${sender === "user" ? "justify-end" : "justify-start"}`;

  const messageBubble = document.createElement("div");
  messageBubble.className = `message-bubble max-w-[85%] p-4 rounded-2xl shadow-sm ${
    sender === "user"
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm"
      : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-bl-sm"
  }`;

  if (isLoading) {
    const loadingDots = document.createElement("div");
    loadingDots.className = "loading-dots";
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "loading-dot";
      loadingDots.appendChild(dot);
    }
    messageBubble.appendChild(loadingDots);
  } else {
    messageBubble.innerHTML = formatMessageHtml(text);
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
  }

  console.warn(`Loading message with ID ${loadingId} not found`);
  return false;
}

// Helper function to clear any stuck loading messages
function clearStuckLoadingMessages() {
  if (!chatMessages) return;

  const allMessages = chatMessages.querySelectorAll('[id^="msg-"]');
  for (const msg of allMessages) {
    const loadingElement = msg.querySelector(".loading-dots");
    if (loadingElement) {
      console.log(`Removing stuck loading message: ${msg.id}`);
      msg.remove();
    }
  }
}

// Function to clear all chat messages
function clearAllMessages() {
  if (chatMessages) {
    chatMessages.innerHTML = "";
    chatHistory = [];
    console.log("Cleared all chat messages and history");

    // Add initial greeting based on device capabilities
    if (isMobileDevice && !isWebGPUSupported) {
      addMessage(
        `**📱 Hello! Welcome to Revanza's portfolio!**
        
I'm here to help you explore! Try asking about:

• **"projects"** - See amazing portfolio work
• **"skills"** - Technical expertise  
• **"experience"** - 7+ years background
• **"contact"** - Get in touch

*For the full AI experience, try desktop! 💻*`,
        "assistant",
      );
      updateStatus("mobile", "Mobile FAQ Ready");
    } else {
      addMessage(
        "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
        "assistant",
      );
      if (isWebGPUSupported) {
        updateStatus("ready", "AI Ready");
      }
    }

    chatHistory.push({
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. How can I help you explore Revanza's portfolio?",
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
  console.log("Is Mobile:", isMobileDevice);
  console.log("WebGPU Supported:", isWebGPUSupported);
  console.log("Model Loaded:", modelLoaded);
  console.log("Model Loading:", modelLoading);
  console.log("Recent Chat History:", chatHistory.slice(-3));
  console.log("======================");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize device detection
  isMobileDevice = detectMobile();

  // Async WebGPU support check
  try {
    isWebGPUSupported = await checkWebGPUSupport();
  } catch (error) {
    console.warn("WebGPU detection failed:", error);
    isWebGPUSupported = false;
  }

  console.log(
    `Device detection - Mobile: ${isMobileDevice}, WebGPU: ${isWebGPUSupported}`,
  );

  // Force disable WebGPU for mobile devices as additional safety measure
  if (isMobileDevice) {
    isWebGPUSupported = false;
    console.log("WebGPU disabled for mobile device");
  }

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

  // Add initial greeting based on device capabilities
  if (isMobileDevice && !isWebGPUSupported) {
    addMessage(
      `**📱 Hi there! Welcome to Revanza's portfolio!**
      
I'm here to help you explore! Try asking:

• **"projects"** - Amazing portfolio work
• **"skills"** - Technical expertise  
• **"experience"** - 7+ years background
• **"contact"** - Get in touch

*For the full AI experience, try desktop! 💻*`,
      "assistant",
    );
    updateStatus("mobile", "Mobile FAQ Ready");
  } else if (!isWebGPUSupported) {
    addMessage(
      "⚠️ Your browser doesn't support WebGPU. Please try Chrome 113+, Edge 113+, or Firefox 113+ for the full AI experience. I can still help with basic questions!",
      "assistant",
    );
    updateStatus("error", "WebGPU not supported");
  } else {
    addMessage(
      "Hello! I'm your AI assistant, powered by WebLLM. I can provide detailed information about Revanza's professional experience, projects, and expertise. What would you like to know?",
      "assistant",
    );

    // Set initial status
    updateStatus("ready", "AI Ready");
  }

  chatHistory.push({
    role: "assistant",
    content:
      "Hello! I'm your AI assistant. How can I help you explore Revanza's portfolio?",
  });

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

    // Initialize model when chat is first opened (desktop only)
    if (
      wasHidden &&
      !modelLoaded &&
      !modelLoading &&
      isWebGPUSupported &&
      !isMobileDevice
    ) {
      console.log("Initializing AI model for desktop user");
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

    // Add user message
    addMessage(message, "user");
    chatHistory.push({ role: "user", content: message });
    chatInput.value = "";
    updateCharCounter();

    // Handle mobile/non-WebGPU devices with FAQ system
    if (!isWebGPUSupported) {
      updateStatus("loading", "Thinking...");

      // Show brief loading for better UX
      const loadingId = addMessage("", "assistant", true);

      setTimeout(() => {
        removeLoadingMessage(loadingId);
        const faqResponse = findFAQResponse(message);
        addMessage(faqResponse, "assistant");
        chatHistory.push({ role: "assistant", content: faqResponse });

        // Re-enable input
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
        updateStatus(
          isMobileDevice ? "mobile" : "error",
          isMobileDevice ? "Mobile FAQ Ready" : "WebGPU not supported",
        );
      }, 800); // Brief delay for natural feel

      return;
    }

    // Full AI processing for desktop with WebGPU
    updateStatus("loading", "Thinking...");

    // Show loading state
    const loadingId = addMessage("", "assistant", true);
    console.log(`Created loading message with ID: ${loadingId}`);

    try {
      if (modelLoaded && client) {
        // Manage context window to prevent token limit exceeded
        const managedHistory = manageContextWindow(
          chatHistory,
          portfolioContext,
          {
            maxContextTokens: MAX_CONTEXT_TOKENS,
            slidingWindowSize: SLIDING_WINDOW_SIZE,
          },
        );

        console.log(`Context management: Using ${managedHistory.length} messages`);

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

        if (botResponse?.trim()) {
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
        if (isWebGPUSupported) {
          updateStatus("ready", "AI Ready");
        }
      }
    }
  });
});
