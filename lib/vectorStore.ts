// Vector store for embeddings
export interface VectorChunk {
  text: string;
  page: number;
  index: number;
  embedding: number[];
}

export interface VectorSearchResult {
  text: string;
  page: number;
  index: number;
  similarity: number;
}

export class VectorStore {
  private chunks: VectorChunk[] = [];

  addChunks(chunks: VectorChunk[]) {
    this.chunks = chunks;
  }

  getChunks(): VectorChunk[] {
    return this.chunks;
  }

  // Cosine similarity calculation
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  // Search using vector similarity
  search(queryEmbedding: number[], limit: number = 20): VectorSearchResult[] {
    if (this.chunks.length === 0) {
      return [];
    }

    const results: VectorSearchResult[] = this.chunks.map((chunk) => ({
      text: chunk.text,
      page: chunk.page,
      index: chunk.index,
      similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by similarity (highest first) and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter((r) => r.similarity > 0.3); // Filter out low similarity results
  }
}

// Generate embeddings - supports both Hugging Face and Ollama
export async function generateEmbedding(
  text: string,
  provider: 'huggingface' | 'ollama' = 'huggingface',
  config?: {
    model?: string;
    baseURL?: string;
    apiKey?: string;
  }
): Promise<number[]> {
  if (provider === 'huggingface') {
    const { generateEmbedding: hfGenerateEmbedding } = await import('./huggingface-provider');
    return hfGenerateEmbedding(
      text,
      config?.model || process.env.HUGGINGFACE_EMBEDDING_MODEL || 'intfloat/e5-small-v2',
      { 
        spaceURL: process.env.HUGGINGFACE_SPACE_URL,
        apiKey: config?.apiKey || process.env.HUGGINGFACE_API_KEY,
      }
    );
  } else {
    // Ollama fallback
    const baseURL = config?.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = config?.model || process.env.EMBEDDING_MODEL || 'nomic-embed-text';
    
    try {
      const response = await fetch(`${baseURL}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama embeddings API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding || [];
    } catch (error) {
      console.error('Error generating embedding with Ollama:', error);
      throw error;
    }
  }
}

