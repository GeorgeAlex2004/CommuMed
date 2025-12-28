// Hugging Face Space API provider
// Uses Hugging Face Space as API endpoint (free, no credit card)

export interface HuggingFaceConfig {
  spaceURL?: string;
  apiKey?: string; // Optional, for private spaces
}

// Default to Space API, fallback to Inference API
const DEFAULT_SPACE_URL = process.env.HUGGINGFACE_SPACE_URL || '';
const DEFAULT_INFERENCE_URL = 'https://router.huggingface.co/hf-inference';

// Generate embeddings using Hugging Face Space API or Inference API
export async function generateEmbedding(
  text: string,
  model: string = 'sentence-transformers/all-MiniLM-L6-v2',
  config?: HuggingFaceConfig
): Promise<number[]> {
  const spaceURL = config?.spaceURL || process.env.HUGGINGFACE_SPACE_URL || '';
  const apiKey = config?.apiKey || process.env.HUGGINGFACE_API_KEY || '';

  // Use Space API if available
  if (spaceURL) {
    try {
      const spaceApiUrl = spaceURL.endsWith('/') 
        ? `${spaceURL}api/predict` 
        : `${spaceURL}/api/predict`;
      
      const response = await fetch(spaceApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          data: [text],
          fn_index: 1, // Embedding function index
        }),
      });

      if (!response.ok) {
        throw new Error(`Space API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Gradio API returns { data: [...] }
      if (data.data && Array.isArray(data.data) && data.data[0]) {
        const result = data.data[0];
        if (result.embedding) {
          return result.embedding;
        }
      }

      throw new Error('Unexpected Space API response format');
    } catch (error) {
      console.error('Space API error, falling back to Inference API:', error);
      // Fall through to Inference API
    }
  }

  // Fallback to Inference API (using new router endpoint)
  try {
    const response = await fetch(`${DEFAULT_INFERENCE_URL}/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        inputs: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data[0] || data;
    }
    
    if (data.embeddings) {
      return Array.isArray(data.embeddings[0]) ? data.embeddings[0] : data.embeddings;
    }
    
    if (Array.isArray(data)) {
      return data;
    }

    throw new Error('Unexpected response format from Hugging Face');
  } catch (error) {
    console.error('Error generating embedding with Hugging Face:', error);
    throw error;
  }
}

// Generate chat response using Hugging Face Space API or Inference API
export async function* streamChatResponse(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    config?: HuggingFaceConfig;
  }
): AsyncGenerator<string, void, unknown> {
  const spaceURL = options.config?.spaceURL || process.env.HUGGINGFACE_SPACE_URL || '';
  const apiKey = options.config?.apiKey || process.env.HUGGINGFACE_API_KEY || '';
  const model = options.model || process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-3B-Instruct';

  let responseText = '';

  // Use Space API if available
  if (spaceURL) {
    try {
      const spaceApiUrl = spaceURL.endsWith('/') 
        ? `${spaceURL}api/predict` 
        : `${spaceURL}/api/predict`;
      
      const response = await fetch(spaceApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          data: [
            messages,
            options.temperature || 0.1,
            options.maxTokens || 2000,
          ],
          fn_index: 0, // Chat function index
        }),
      });

      if (!response.ok) {
        throw new Error(`Space API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Gradio API returns { data: [...] }
      if (data.data && Array.isArray(data.data) && data.data[0]) {
        const result = data.data[0];
        if (result.response) {
          responseText = result.response;
        } else if (result.error) {
          throw new Error(result.error);
        }
      }

      if (responseText) {
        // Stream the response word by word
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          yield words[i] + (i < words.length - 1 ? ' ' : '');
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
      }
    } catch (error) {
      console.error('Space API error, falling back to Inference API:', error);
      // Fall through to Inference API
    }
  }

  // Fallback to Inference API
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `System: ${msg.content}\n\n`;
    } else if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n\n`;
    }
  }
  prompt += 'Assistant:';

  try {
    const response = await fetch(`${DEFAULT_INFERENCE_URL}/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options.temperature || 0.1,
          max_new_tokens: options.maxTokens || 2000,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || '';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else if (typeof data === 'string') {
      responseText = data;
    }

    // Stream the response word by word
    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  } catch (error) {
    console.error('Error generating chat response with Hugging Face:', error);
    throw error;
  }
}

// Check if model is available (not loading)
export async function checkModelStatus(
  model: string,
  config?: HuggingFaceConfig
): Promise<{ loading: boolean; error?: string }> {
  const apiKey = config?.apiKey || process.env.HUGGINGFACE_API_KEY || '';
  const baseURL = DEFAULT_INFERENCE_URL;

  try {
    const response = await fetch(`${baseURL}/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        inputs: 'test',
      }),
    });

    if (response.status === 503) {
      return { loading: true };
    }

    if (!response.ok) {
      return { loading: false, error: `Status: ${response.status}` };
    }

    return { loading: false };
  } catch (error) {
    return { loading: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

