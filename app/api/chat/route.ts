import { NextRequest } from 'next/server';
import { VectorStore, VectorChunk, generateEmbedding } from '@/lib/vectorStore';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

function getDataDir() {
  // Hugging Face Spaces use /data for persistent storage
  if (process.env.SPACE_ID || process.env.HF_SPACE) {
    return '/data';
  }
  // Vercel uses /tmp
  if (process.env.VERCEL) {
    return '/tmp/data';
  }
  // Local development
  return join(process.cwd(), 'data');
}

async function loadEmbeddings(): Promise<VectorChunk[] | null> {
  try {
    // First, try loading from a URL (for Vercel deployment with cloud storage)
    const embeddingsUrl = process.env.EMBEDDINGS_URL;
    if (embeddingsUrl) {
      try {
        console.log('Loading embeddings from URL:', embeddingsUrl);
        const response = await fetch(embeddingsUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded ${data.length} embeddings from URL`);
          return data as VectorChunk[];
        } else {
          console.warn(`Failed to load embeddings from URL: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error loading embeddings from URL, falling back to file system:', error);
      }
    }

    // Fallback to file system
    const dataDir = getDataDir();
    const filePath = join(dataDir, 'embeddings.json');
    
    if (!existsSync(filePath)) {
      return null;
    }

    const data = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    console.log(`Loaded ${parsed.length} embeddings from file system`);
    return parsed as VectorChunk[];
  } catch (error) {
    console.error('Error loading embeddings:', error);
    return null;
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response('Query is required', { status: 400 });
    }

    // Load embeddings from file system
    const vectorChunks = await loadEmbeddings();

    if (!vectorChunks || vectorChunks.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Documentation embeddings not found. Please run the embedding generation script first.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine provider (default to huggingface)
    const provider = (process.env.LLM_PROVIDER || 'huggingface').toLowerCase() as 'huggingface' | 'ollama';

    // Generate embedding for the query
    let queryEmbedding: number[];
    try {
      if (provider === 'huggingface') {
        const { generateEmbedding: hfGenerateEmbedding } = await import('@/lib/huggingface-provider');
        queryEmbedding = await hfGenerateEmbedding(
          query.trim(),
          process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
          {
            spaceURL: process.env.HUGGINGFACE_SPACE_URL,
            apiKey: process.env.HUGGINGFACE_API_KEY,
          }
        );
      } else {
        // Ollama fallback
        const ollamaBaseUrlEmbed = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const embeddingModel = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
        queryEmbedding = await generateEmbedding(query.trim(), 'ollama', {
          baseURL: ollamaBaseUrlEmbed,
          model: embeddingModel,
        });
      }
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw error;
    }

    // Create vector store and search
    const vectorStore = new VectorStore();
    vectorStore.addChunks(vectorChunks);

    // Get top relevant chunks using vector similarity
    const searchResults = vectorStore.search(queryEmbedding, 20);
    
    if (searchResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No relevant information found in the documentation for your query.',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Combine relevant chunks into context
    const context = searchResults
      .map((result, idx) => `[Source ${idx + 1}, Page ${result.page}]: ${result.text}`)
      .join('\n\n');

    // Create a strict system prompt that only uses the provided documentation
    const systemPrompt = `You are a medical information assistant. Your ONLY source of information is the documentation provided below.

CRITICAL RULES - YOU MUST FOLLOW THESE STRICTLY:
1. You MUST ONLY use information from the provided documentation context below
2. DO NOT use ANY information from your training data, general knowledge, or external sources
3. DO NOT make inferences, assumptions, or add information not explicitly stated in the documentation
4. DO NOT combine information from the documentation with your own knowledge
5. If the documentation doesn't contain information about the query, you MUST respond with EXACTLY: "I don't have information about this in the provided documentation."
6. DO NOT paraphrase or reword information in a way that adds meaning not present in the documentation
7. DO NOT provide general medical advice or common knowledge that isn't in the documentation
8. When citing information, use the exact wording from the documentation when possible
9. Always cite page numbers when referencing specific information

FORMATTING REQUIREMENTS:
- Use clear, hierarchical headings with ## for main sections and ### for subsections
- Use **bold** for important terms, disease names, and key concepts
- Use bullet points (-) for lists of items, types, symptoms, causes, etc.
- Use numbered lists (1., 2., 3.) for sequential information or steps
- Group related information under clear section headers
- Use line breaks between sections for readability
- Format page citations as "(Page X)" at the end of relevant sentences
- Use properly formatted markdown tables when the documentation presents tabular data:
  - Format: | Header 1 | Header 2 | Header 3 |
           |----------|----------|----------|
           | Data 1   | Data 2   | Data 3   |
  - Ensure all columns align properly
  - Use clear, descriptive headers
  - Keep table content concise
- Keep paragraphs concise (3-4 sentences max)
- Use emphasis (*italic*) for important notes or warnings

RESPONSE STRUCTURE:
- Start with a brief overview if the documentation provides one
- Organize information logically (e.g., Definition → Types → Causes → Symptoms → Treatment)
- Use clear section headers to separate different aspects
- ALWAYS end with a "Sources" section listing ALL page numbers referenced, formatted as:
  ---
  **Sources:** Page X, Page Y, Page Z
  ---

MANDATORY CITATION REQUIREMENT:
- You MUST cite the page number for EVERY piece of information you provide
- If you mention symptoms, cite the page where symptoms are listed
- If you mention treatments, cite the page where treatments are described
- At the end of your response, include a "Sources" section with ALL page numbers you referenced
- Format: ---\n**Sources:** Page X, Page Y, Page Z\n---
- If you cannot find the information in the documentation, DO NOT make up an answer - say "I don't have information about this in the provided documentation."

Documentation Context:
${context}

IMPORTANT: Your response must be based EXCLUSIVELY on the documentation above. Every fact you state must come from the documentation context provided. Format it clearly and professionally using the guidelines above. ALWAYS include page citations. If you cannot answer the question using only the documentation, say "I don't have information about this in the provided documentation." Do not use any other knowledge.`;

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          let fullResponse = '';

          if (provider === 'huggingface') {
            // Use Hugging Face Inference API
            const { streamChatResponse } = await import('@/lib/huggingface-provider');
            
            const messages = [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query },
            ];

            try {
              for await (const chunk of streamChatResponse(messages, {
                model: process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
                temperature: 0.1,
                maxTokens: 2000,
                config: {
                  spaceURL: process.env.HUGGINGFACE_SPACE_URL,
                  apiKey: process.env.HUGGINGFACE_API_KEY,
                },
              })) {
                fullResponse += chunk;
                // Format as AI SDK stream format: 0:"text content"\n
                const formattedChunk = `0:${JSON.stringify(chunk)}\n`;
                controller.enqueue(encoder.encode(formattedChunk));
              }
            } catch (error) {
              console.error('Hugging Face API error:', error);
              throw error;
            }
          } else {
            // Ollama fallback
            const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
            const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

            const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: ollamaModel,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: query },
                ],
                stream: true,
                options: {
                  temperature: 0.1,
                  num_predict: 2000,
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
                      const text = data.message.content;
                      fullResponse += text;
                      const chunk = `0:${JSON.stringify(text)}\n`;
                      controller.enqueue(encoder.encode(chunk));
                    }
                    if (data.done) {
                      break;
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
            }
          }

          // Automatically append sources section if not already present
          const uniquePages = [...new Set(searchResults.map(r => r.page))].sort((a, b) => a - b);
          if (!fullResponse.includes('**Sources:**') && !fullResponse.includes('Sources:') && uniquePages.length > 0) {
            const sourcesText = `\n\n---\n\n**Sources:** ${uniquePages.map(p => `Page ${p}`).join(', ')}\n`;
            const sourcesChunk = `0:${JSON.stringify(sourcesText)}\n`;
            controller.enqueue(encoder.encode(sourcesChunk));
          }
          
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      },
    });

    // Add CORS headers for Vercel deployment
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Add CORS headers if origin is present
    if (origin) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
      headers['Access-Control-Max-Age'] = '86400';
    }

    return new Response(stream, {
      headers,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to generate response. Please try again.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Connection errors
      if (errorMsg.includes('econnrefused') || errorMsg.includes('fetch failed') || errorMsg.includes('network')) {
        const provider = (process.env.LLM_PROVIDER || 'huggingface').toLowerCase();
        if (provider === 'huggingface') {
          errorMessage = `Cannot connect to Hugging Face Space. Please check:
1. HUGGINGFACE_SPACE_URL is set correctly: ${process.env.HUGGINGFACE_SPACE_URL || 'NOT SET'}
2. Space is running at: https://unwonted-uplift-commumed-llm.hf.space
3. First request may take 30-60 seconds (model loading)`;
        } else {
          errorMessage = `Cannot connect to Ollama at ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`;
        }
      }
      // Embedding errors
      else if (errorMsg.includes('embedding') {
        errorMessage = `Error generating embedding: ${error.message}. Check HUGGINGFACE_SPACE_URL and model configuration.`;
      }
      // Embeddings loading errors
      else if (errorMsg.includes('embeddings') || errorMsg.includes('not found')) {
        errorMessage = `Embeddings not found. Check EMBEDDINGS_URL: ${process.env.EMBEDDINGS_URL || 'NOT SET'}`;
        statusCode = 400;
      }
      // Other errors
      else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

