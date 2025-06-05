/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Navigator {
  gpu?: GPU;
}

interface GPU {
  getPreferredCanvasFormat(): Promise<"bgra8unorm" | "rgba8unorm">;
}

declare module "@mlc-ai/web-llm" {
  export class ChatWorkerClient {
    constructor();
    load(model: string): Promise<void>;
    chat: {
      completions: {
        stream(options: { messages: Array<{ role: string; content: string }> }): AsyncIterable<{
          choices: Array<{ delta: { content?: string } }>;
        }>;
      };
    };
  }
}
