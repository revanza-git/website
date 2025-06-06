declare module "@mlc-ai/web-llm" {
	export interface ChatMessage {
		role: "user" | "assistant" | "system";
		content: string;
	}

	export interface MLCEngineConfig {
		initProgressCallback?: (progress: {
			text: string;
			progress: number;
		}) => void;
		appConfig?: Record<string, unknown>;
	}

	export class MLCEngine {
		constructor(config?: MLCEngineConfig);
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

	export function CreateMLCEngine(
		model: string,
		config?: MLCEngineConfig,
	): Promise<MLCEngine>;
}
