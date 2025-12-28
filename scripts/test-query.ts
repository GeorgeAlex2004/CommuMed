#!/usr/bin/env tsx
/**
 * Test script to query the RAG system from terminal
 * 
 * Usage:
 * npm run test-query -- "your question here"
 * 
 * Or run interactively:
 * npm run test-query
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { VectorStore, VectorChunk, generateEmbedding } from '../lib/vectorStore';
import { streamOllamaResponse } from '../lib/ollama-provider';
import * as readline from 'readline';

function getDataDir() {
  if (process.env.SPACE_ID || process.env.HF_SPACE) {
    return '/data';
  }
  if (process.env.VERCEL) {
    return '/tmp/data';
  }
  return join(process.cwd(), 'data');
}

async function loadEmbeddings(): Promise<VectorChunk[] | null> {
  try {
    const dataDir = getDataDir();
    const filePath = join(dataDir, 'embeddings.json');
    
    if (!existsSync(filePath)) {
      return null;
    }

    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data) as VectorChunk[];
  } catch (error) {
    console.error('Error loading embeddings:', error);
    return null;
  }
}

async function askQuestion(query: string): Promise<void> {
  console.log('\n🔍 Processing your question...\n');
  
  // Load embeddings
  const vectorChunks = await loadEmbeddings();
  if (!vectorChunks || vectorChunks.length === 0) {
    console.error('❌ Embeddings not found. Please run: npm run generate-embeddings-from-text');
    process.exit(1);
  }

  console.log(`📚 Loaded ${vectorChunks.length} text chunks from documentation\n`);

  // Get Ollama configuration
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const embeddingModel = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

  // Check if Ollama is running
  try {
    const healthCheck = await fetch(`${ollamaBaseUrl}/api/tags`);
    if (!healthCheck.ok) {
      throw new Error('Ollama not responding');
    }
  } catch (error) {
    console.error('❌ Cannot connect to Ollama!');
    console.error(`   Make sure Ollama is running at ${ollamaBaseUrl}`);
    console.error('   Start Ollama with: ollama serve');
    process.exit(1);
  }

  // Generate embedding for query
  console.log('🔄 Generating query embedding...');
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(query.trim(), ollamaBaseUrl, embeddingModel);
  } catch (error) {
    console.error('⚠️  Error with embedding model, trying fallback...');
    queryEmbedding = await generateEmbedding(query.trim(), ollamaBaseUrl, 'llama3.2');
  }

  // Search for relevant chunks
  console.log('🔎 Searching for relevant content...');
  const vectorStore = new VectorStore();
  vectorStore.addChunks(vectorChunks);
  const searchResults = vectorStore.search(queryEmbedding, 20);

  if (searchResults.length === 0) {
    console.log('\n❌ No relevant information found in the documentation for your query.');
    return;
  }

  console.log(`✅ Found ${searchResults.length} relevant chunks\n`);

  // Show top 3 sources
  console.log('📄 Top sources found:');
  searchResults.slice(0, 3).forEach((result, idx) => {
    const preview = result.text.substring(0, 100).replace(/\n/g, ' ');
    console.log(`   ${idx + 1}. Page ${result.page} (similarity: ${(result.similarity * 100).toFixed(1)}%)`);
    console.log(`      "${preview}..."\n`);
  });

  // Combine relevant chunks into context
  const context = searchResults
    .map((result, idx) => `[Source ${idx + 1}, Page ${result.page}]: ${result.text}`)
    .join('\n\n');

  // Create system prompt - STRICT: Only use provided documentation
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

FORMATTING REQUIREMENTS (for terminal display):
- Use clear section headers in ALL CAPS or with clear separators (e.g., "=== SECTION NAME ===")
- Use UPPERCASE or clear emphasis for important terms, disease names, and key concepts
- Use bullet points (-) for lists of items, types, symptoms, causes, etc.
- Use numbered lists (1., 2., 3.) for sequential information or steps
- Group related information under clear section headers
- Use line breaks between sections for readability
- Format page citations as "(Page X)" at the end of relevant sentences
- Keep paragraphs concise (3-4 sentences max)
- Use clear visual separators between major sections

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

  // Generate response
  console.log('🤖 Generating response from Ollama...\n');
  console.log('─'.repeat(60));
  console.log('ANSWER:\n');

    try {
      let fullResponse = '';
      for await (const chunk of streamOllamaResponse(query, {
        baseURL: ollamaBaseUrl,
        model: ollamaModel,
        system: systemPrompt,
        temperature: 0.1, // Lower temperature for more deterministic, documentation-focused responses
      })) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }
      
      // Automatically append sources if not already present
      const uniquePages = [...new Set(searchResults.map(r => r.page))].sort((a, b) => a - b);
      if (!fullResponse.includes('Sources:') && !fullResponse.includes('**Sources:**') && uniquePages.length > 0) {
        console.log('\n\n---');
        console.log(`\nSources: ${uniquePages.map(p => `Page ${p}`).join(', ')}`);
      }
      
      console.log('\n');
      console.log('─'.repeat(60));
      console.log(`\n📊 Response generated using ${searchResults.length} relevant chunks`);
      console.log(`   Model: ${ollamaModel}`);
      console.log(`   Sources: Pages ${uniquePages.slice(0, 10).join(', ')}${uniquePages.length > 10 ? `... (${uniquePages.length} total)` : ''}`);
  } catch (error: any) {
    console.error('\n❌ Error generating response:', error.message);
    console.error('   Make sure Ollama is running and the model is available');
    console.error(`   Try: ollama pull ${ollamaModel}`);
  }
}

async function main() {
  const query = process.argv[2];

  if (query) {
    // Query provided as argument
    await askQuestion(query);
  } else {
    // Interactive mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = () => {
      rl.question('\n💬 Enter your question (or "exit" to quit): ', async (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('\n👋 Goodbye!');
          rl.close();
          process.exit(0);
        }

        if (input.trim()) {
          await askQuestion(input.trim());
          ask(); // Ask again
        } else {
          ask(); // Ask again if empty
        }
      });
    };

    console.log('🧪 RAG System Test Interface');
    console.log('─'.repeat(60));
    ask();
  }
}

main().catch(console.error);

