import type { APIRoute } from 'astro';

// System message to define the chatbot's behavior
const systemMessage = `You are a helpful portfolio assistant. Your role is to:
1. Answer questions about the portfolio owner's projects
2. Provide details about their skills and experience
3. Help visitors navigate the portfolio
4. Assist with scheduling meetings or interviews

Keep your responses concise, professional, and helpful. If you don't know something specific about the portfolio owner, be honest about it.`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    // Using Hugging Face's free inference API
    const response = await fetch(import.meta.env.HUGGINGFACE_MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${systemMessage}\n\nUser: ${message}\nAssistant:`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Hugging Face API Error:', errorData);
      throw new Error(`Failed to get response from Hugging Face: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats from Hugging Face
    let botResponse = "I apologize, but I couldn't generate a response.";
    if (Array.isArray(data) && data.length > 0) {
      botResponse = data[0].generated_text || botResponse;
    } else if (typeof data === 'object' && data.generated_text) {
      botResponse = data.generated_text;
    }

    // Clean up the response
    botResponse = botResponse
      .replace(/Assistant:/g, '')
      .replace(/User:/g, '')
      .trim();

    return new Response(JSON.stringify({ response: botResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 