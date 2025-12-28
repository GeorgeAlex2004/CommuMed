#!/usr/bin/env tsx
/**
 * Generate embeddings from OCR-extracted text file
 * 
 * Usage:
 * npm run generate-embeddings-from-text -- "path/to/ocr-extracted-text.txt"
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

function parseTextFile(text: string): { text: string; page: number }[] {
  const chunks: { text: string; page: number }[] = [];
  
  // Split by page markers
  const pagePattern = /=== PAGE (\d+) ===/g;
  const pages = text.split(pagePattern);
  
  let currentPage = 1;
  let currentText = '';
  
  for (let i = 0; i < pages.length; i++) {
    const part = pages[i].trim();
    
    // Check if this is a page number
    if (/^\d+$/.test(part)) {
      // Save previous page's text
      if (currentText.trim().length > 0) {
        chunks.push({ text: currentText.trim(), page: currentPage });
      }
      currentPage = parseInt(part);
      currentText = '';
    } else if (part.length > 0) {
      currentText += (currentText ? '\n\n' : '') + part;
    }
  }
  
  // Save last page
  if (currentText.trim().length > 0) {
    chunks.push({ text: currentText.trim(), page: currentPage });
  }
  
  // If no page markers found, split by paragraphs and estimate pages
  if (chunks.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphsPerPage = Math.max(1, Math.floor(paragraphs.length / 1000)); // Estimate 1000 pages
    
    let pageNum = 1;
    let pageText = '';
    
    paragraphs.forEach((para, idx) => {
      pageText += (pageText ? '\n\n' : '') + para;
      
      if ((idx + 1) % paragraphsPerPage === 0 || idx === paragraphs.length - 1) {
        if (pageText.trim().length > 0) {
          chunks.push({ text: pageText.trim(), page: pageNum });
          pageText = '';
          pageNum++;
        }
      }
    });
  }
  
  return chunks;
}

function splitIntoOptimalChunks(pageChunks: { text: string; page: number }[]): { text: string; page: number }[] {
  const optimalChunks: { text: string; page: number }[] = [];
  const targetSize = 500;
  const minSize = 100;
  const maxSize = 800;
  
  pageChunks.forEach((pageChunk) => {
    const text = pageChunk.text;
    const page = pageChunk.page;
    
    // If chunk is small enough, use as-is
    if (text.length <= maxSize && text.length >= minSize) {
      optimalChunks.push({ text, page });
      return;
    }
    
    // Split large chunks
    if (text.length > maxSize) {
      // Split by paragraphs
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      
      let currentChunk = '';
      paragraphs.forEach((para) => {
        if (currentChunk.length + para.length > maxSize && currentChunk.length >= minSize) {
          optimalChunks.push({ text: currentChunk.trim(), page });
          currentChunk = para;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
      });
      
      if (currentChunk.trim().length >= minSize) {
        optimalChunks.push({ text: currentChunk.trim(), page });
      }
    }
  });
  
  return optimalChunks;
}

async function main() {
  const textFilePath = process.argv[2] || join(process.cwd(), 'data', 'ocr-extracted-text.txt');
  
  if (!existsSync(textFilePath)) {
    console.error(`❌ Text file not found: ${textFilePath}`);
    console.error('\nUsage: npm run generate-embeddings-from-text -- "path/to/text.txt"');
    process.exit(1);
  }
  
  console.log('📄 Reading text file:', textFilePath);
  const fullText = await readFile(textFilePath, 'utf-8');
  console.log(`📊 Text file size: ${(fullText.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Parse text into page chunks
  console.log('\n📑 Parsing text into pages...');
  const pageChunks = parseTextFile(fullText);
  console.log(`✅ Found ${pageChunks.length} page chunks`);
  
  // Split into optimal chunks
  console.log('✂️  Splitting into optimal chunk sizes...');
  const optimalChunks = splitIntoOptimalChunks(pageChunks);
  console.log(`✅ Created ${optimalChunks.length} optimal chunks`);
  
  // Check Ollama
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama not responding');
  } catch (error) {
    console.error('❌ Cannot connect to Ollama');
    console.error(`   Make sure Ollama is running at: ${OLLAMA_BASE_URL}`);
    process.exit(1);
  }
  
  // Generate embeddings
  console.log('\n🔄 Generating embeddings...');
  const vectorChunks: VectorChunk[] = [];
  
  for (let i = 0; i < optimalChunks.length; i++) {
    const chunk = optimalChunks[i];
    process.stdout.write(`\r   Processing ${i + 1}/${optimalChunks.length}...`);
    
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
          index: vectorChunks.length,
          embedding,
        });
      }
    } catch (error) {
      console.error(`\n⚠️  Error processing chunk ${i + 1}:`, error);
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Generated ${vectorChunks.length} embeddings`);
  
  // Save embeddings
  const dataDir = getDataDir();
  await mkdir(dataDir, { recursive: true });
  const outputPath = join(dataDir, 'embeddings.json');
  
  await writeFile(outputPath, JSON.stringify(vectorChunks, null, 2));
  console.log(`💾 Saved embeddings to: ${outputPath}`);
  console.log(`\n🎉 Done! Your documentation is ready for search.`);
  console.log(`   Total chunks: ${vectorChunks.length}`);
  console.log(`   Pages covered: ${Math.max(...vectorChunks.map(c => c.page))}`);
}

main().catch(console.error);

