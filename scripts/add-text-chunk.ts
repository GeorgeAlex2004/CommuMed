#!/usr/bin/env tsx
/**
 * Add text chunks from OCR'd PDFs to the embeddings
 * 
 * Usage:
 * npm run add-text-chunk -- "chunk-name" "text content here"
 * 
 * Or provide a text file:
 * npm run add-text-chunk -- "chunk-name" --file "path/to/text.txt"
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateEmbedding, VectorChunk } from '../lib/vectorStore';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'nomic-embed-text';

function getDataDir() {
  if (process.env.SPACE_ID || process.env.HF_SPACE) {
    return '/data';
  }
  if (process.env.VERCEL) {
    return '/tmp/data';
  }
  return join(process.cwd(), 'data');
}

async function loadExistingEmbeddings(): Promise<VectorChunk[]> {
  const dataDir = getDataDir();
  const filePath = join(dataDir, 'embeddings.json');
  
  if (existsSync(filePath)) {
    const data = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  }
  
  return [];
}

async function processTextChunk(chunkName: string, text: string, startPage: number = 1): Promise<VectorChunk[]> {
  console.log(`📝 Processing chunk: ${chunkName}`);
  console.log(`   Text length: ${text.length} characters`);
  
  // Split text into smaller chunks (400-800 chars each)
  const chunks: { text: string; page: number }[] = [];
  const targetChunkSize = 500;
  const minChunkSize = 100;
  const maxChunkSize = 800;
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentPage = startPage;
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    
    if (trimmed.length > maxChunkSize) {
      // Save current chunk
      if (currentChunk.trim().length >= minChunkSize) {
        chunks.push({ text: currentChunk.trim(), page: currentPage });
        currentChunk = '';
      }
      
      // Split large paragraph by sentences
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
      sentences.forEach((sentence) => {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length >= minChunkSize) {
          chunks.push({ text: currentChunk.trim(), page: currentPage });
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      });
    } else if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk.length >= minChunkSize) {
      chunks.push({ text: currentChunk.trim(), page: currentPage });
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  });
  
  if (currentChunk.trim().length >= minChunkSize) {
    chunks.push({ text: currentChunk.trim(), page: currentPage });
  }
  
  console.log(`   Created ${chunks.length} text chunks`);
  
  // Generate embeddings
  console.log('🔄 Generating embeddings...');
  const vectorChunks: VectorChunk[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`\r   Processing ${i + 1}/${chunks.length}...`);
    
    try {
      const embedding = await generateEmbedding(
        chunk.text,
        'ollama',
        {
          baseURL: OLLAMA_BASE_URL,
          model: EMBEDDING_MODEL,
        }
      );
      
      if (embedding.length > 0) {
        vectorChunks.push({
          text: chunk.text,
          page: chunk.page,
          index: -1, // Will be set when merging
          embedding,
        });
      }
    } catch (error) {
      console.error(`\n⚠️  Error processing chunk ${i + 1}:`, error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Generated ${vectorChunks.length} embeddings`);
  return vectorChunks;
}

async function main() {
  const chunkName = process.argv[2];
  const textInput = process.argv[3];
  const fileFlag = process.argv.indexOf('--file');
  const startPageArg = process.argv.indexOf('--start-page');
  
  if (!chunkName) {
    console.error('Usage: npm run add-text-chunk -- "chunk-name" "text content"');
    console.error('   Or: npm run add-text-chunk -- "chunk-name" --file "path/to/text.txt"');
    console.error('   Optional: --start-page 1 (page number to start from)');
    process.exit(1);
  }
  
  let text = '';
  let startPage = 1;
  
  // Get start page if provided
  if (startPageArg !== -1 && process.argv[startPageArg + 1]) {
    startPage = parseInt(process.argv[startPageArg + 1]) || 1;
  }
  
  // Get text from file or argument
  if (fileFlag !== -1 && process.argv[fileFlag + 1]) {
    const filePath = process.argv[fileFlag + 1];
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    text = await readFile(filePath, 'utf-8');
  } else if (textInput && !textInput.startsWith('--')) {
    text = textInput;
  } else {
    console.error('❌ No text provided. Use --file or provide text as argument.');
    process.exit(1);
  }
  
  if (text.trim().length === 0) {
    console.error('❌ Text is empty');
    process.exit(1);
  }
  
  // Check Ollama
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama not responding');
  } catch (error) {
    console.error('❌ Cannot connect to Ollama');
    console.error(`   Make sure Ollama is running at: ${OLLAMA_BASE_URL}`);
    process.exit(1);
  }
  
  // Process the text chunk
  const newChunks = await processTextChunk(chunkName, text, startPage);
  
  // Load existing embeddings
  const existingChunks = await loadExistingEmbeddings();
  console.log(`\n📚 Existing chunks: ${existingChunks.length}`);
  
  // Merge and re-index
  const allChunks = [...existingChunks, ...newChunks];
  allChunks.forEach((chunk, idx) => {
    chunk.index = idx;
  });
  
  // Save
  const dataDir = getDataDir();
  await mkdir(dataDir, { recursive: true });
  const outputPath = join(dataDir, 'embeddings.json');
  
  await writeFile(outputPath, JSON.stringify(allChunks, null, 2));
  console.log(`💾 Saved ${allChunks.length} total chunks to: ${outputPath}`);
  console.log(`\n🎉 Done! Added ${newChunks.length} new chunks from "${chunkName}"`);
}

main().catch(console.error);

