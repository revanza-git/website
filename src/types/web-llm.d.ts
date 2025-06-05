declare module '@mlc-ai/web-llm' {
  export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
  }

  export class MLCEngine {
    constructor(config?: any);
    reload(model: string): Promise<void>;
    chat: {
      completions: {
        create(params: { messages: ChatMessage[]; stream?: boolean }): Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
        stream(params: { messages: ChatMessage[] }): AsyncIterable<{
          choices: Array<{
            delta: {
              content?: string;
            };
          }>;
        }>;
      };
    };
  }

  export function CreateMLCEngine(model: string, config?: any): Promise<MLCEngine>;
} 