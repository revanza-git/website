import { ChatWorkerClient } from "@mlc-ai/web-llm";

let chatContainer: HTMLElement;
let chatToggle: HTMLElement;
let closeChat: HTMLElement;
let chatForm: HTMLFormElement;
let chatInput: HTMLInputElement;
let chatMessages: HTMLElement;
let sendButton: HTMLButtonElement;
let chatHistory = [];
let client: ChatWorkerClient | null = null;
let modelLoaded = false;

// Initialize WebLLM
async function initModel() {
  if (!navigator.gpu) {
    addMessage("⚠️ Your browser doesn't support WebGPU. Some features may be limited.", 'bot');
    return;
  }

  try {
    client = new ChatWorkerClient();
    await client.load("Qwen2-0.5B-Instruct-q4f16_0");
    modelLoaded = true;
    addMessage("AI model loaded and ready!", 'bot');
  } catch (error) {
    console.error("Failed to load model:", error);
    addMessage("Failed to load AI model. Please refresh the page.", 'bot');
  }
}

function addMessage(text: string, sender: 'user' | 'bot', isLoading = false): string {
  const messageDiv = document.createElement('div');
  const messageId = `msg-${Date.now()}`;
  messageDiv.id = messageId;
  messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

  const messageBubble = document.createElement('div');
  messageBubble.className = `message-bubble max-w-[80%] p-3 rounded-lg ${
    sender === 'user'
      ? 'bg-blue-600 text-white rounded-br-none'
      : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
  }`;

  if (isLoading) {
    messageBubble.innerHTML = `
      <div class="flex space-x-2">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      </div>
    `;
  } else {
    messageBubble.textContent = text;
  }

  messageDiv.appendChild(messageBubble);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageId;
}

document.addEventListener('DOMContentLoaded', () => {
  chatContainer = document.getElementById('chat-container') as HTMLElement;
  chatToggle = document.getElementById('chat-toggle') as HTMLElement;
  closeChat = document.getElementById('close-chat') as HTMLElement;
  chatForm = document.getElementById('chat-form') as HTMLFormElement;
  chatInput = document.getElementById('chat-input') as HTMLInputElement;
  chatMessages = document.getElementById('chat-messages') as HTMLElement;
  sendButton = document.getElementById('send-button') as HTMLButtonElement;

  // Add initial greeting
  addMessage('Hello! I\'m your portfolio assistant. How can I help you today?', 'bot');
  chatHistory.push({ role: 'assistant', content: "Hello! I'm your portfolio assistant. How can I help you today?" });

  // Initialize the model
  initModel();

  chatToggle.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
  });

  closeChat.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Add user message
    addMessage(message, 'user');
    chatHistory.push({ role: 'user', content: message });
    chatInput.value = '';

    // Show loading state
    const loadingId = addMessage('Thinking...', 'bot', true);

    try {
      if (modelLoaded && client) {
        // Use local model
        let botResponse = '';
        for await (const chunk of client.chat.completions.stream({
          messages: [{ role: 'user', content: message }]
        })) {
          botResponse += chunk.choices[0].delta.content ?? '';
          // Update the loading message with the current response
          const loadingMessage = document.getElementById(loadingId);
          if (loadingMessage) {
            const messageBubble = loadingMessage.querySelector('.message-bubble');
            if (messageBubble) {
              messageBubble.textContent = botResponse;
            }
          }
        }
        
        // Remove loading message and add final response
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
          loadingMessage.remove();
        }
        addMessage(botResponse, 'bot');
        chatHistory.push({ role: 'assistant', content: botResponse });
      } else {
        // Remove loading message
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
          loadingMessage.remove();
        }
        addMessage("I'm still loading my brain. Please try again in a moment!", 'bot');
      }
    } catch (error) {
      console.error('Error:', error);
      // Remove loading message
      const loadingMessage = document.getElementById(loadingId);
      if (loadingMessage) {
        loadingMessage.remove();
      }
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
      // Re-enable input
      chatInput.disabled = false;
      sendButton.disabled = false;
      chatInput.focus();
    }
  });
}); 