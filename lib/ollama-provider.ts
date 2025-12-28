// Custom Ollama provider for AI SDK
// Since @ai-sdk/ollama doesn't exist, we'll create a custom implementation
// that works with Ollama's API directly

export interface OllamaModel {
  generate: (prompt: string, options?: OllamaOptions) => Promise<ReadableStream>;
}

export interface OllamaOptions {
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export function createOllamaModel(
  model: string,
  options?: {
    baseURL?: string;
  }
): any {
  const baseURL = options?.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  // Return a model-like object that works with AI SDK's streamText
  return {
    provider: 'ollama',
    modelId: model,
    baseURL,
  };
}

// Direct Ollama API call function
export async function* streamOllamaResponse(
  prompt: string,
  options: {
    baseURL?: string;
    model?: string;
    system?: string;
    temperature?: number;
  }
): AsyncGenerator<string, void, unknown> {
  const baseURL = options.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = options.model || process.env.OLLAMA_MODEL || 'llama3.2';
  
  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(options.system ? [{ role: 'system', content: options.system }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true,
      options: {
        temperature: options.temperature || 0.3,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response stream');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            }
            if (data.done) {
              return;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
