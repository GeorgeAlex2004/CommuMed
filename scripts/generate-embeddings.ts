#!/usr/bin/env ts-node
/**
 * Script to generate vector embeddings from documentation
 * 
 * Usage:
 * 1. Place your PDF in the 'docs' folder
 * 2. Run: npm run generate-embeddings
 * 
 * Or provide the PDF path:
 * npm run generate-embeddings -- path/to/documentation.pdf
 */

import { parsePDF, TextChunk } from '../lib/pdfParser';
import { generateEmbedding, VectorChunk } from '../lib/vectorStore';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdfParse from 'pdf-parse';

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

async function processDocumentation(pdfPath: string): Promise<void> {
  console.log('📄 Processing PDF:', pdfPath);
  
  // Read PDF
  const pdfBuffer = await readFile(pdfPath);
  console.log(`📊 PDF file size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  const chunks = await parsePDF(pdfBuffer);
  
  console.log(`✅ Extracted ${chunks.length} text chunks`);
  
  if (chunks.length === 0) {
    console.error('❌ No chunks extracted! The PDF might be image-based or have no extractable text.');
    console.error('   Please verify the PDF has selectable text (not just scanned images).');
    process.exit(1);
  }
  
  // Show sample chunks
  console.log('\n📝 Sample chunks:');
  chunks.slice(0, 3).forEach((chunk, idx) => {
    console.log(`   Chunk ${idx + 1} (Page ${chunk.page}, ${chunk.text.length} chars): ${chunk.text.substring(0, 100)}...`);
  });
  
  // Generate embeddings for each chunk
  console.log('🔄 Generating embeddings (this may take a while)...');
  const vectorChunks: VectorChunk[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`\r   Processing chunk ${i + 1}/${chunks.length}...`);
    
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
          index: chunk.index,
          embedding,
        });
      }
    } catch (error) {
      console.error(`\n⚠️  Error processing chunk ${i + 1}:`, error);
      // Continue with other chunks
    }
    
    // Small delay to avoid overwhelming Ollama
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Generated ${vectorChunks.length} embeddings`);
  
  // Save to file
  const dataDir = getDataDir();
  await mkdir(dataDir, { recursive: true });
  const outputPath = join(dataDir, 'embeddings.json');
  
  await writeFile(outputPath, JSON.stringify(vectorChunks, null, 2));
  console.log(`💾 Saved embeddings to: ${outputPath}`);
  console.log(`\n🎉 Done! Your documentation is ready for search.`);
}

async function main() {
  const pdfPath = process.argv[2] || join(process.cwd(), 'docs', 'documentation.pdf');
  
  if (!existsSync(pdfPath)) {
    console.error(`❌ PDF not found: ${pdfPath}`);
    console.error('\nPlease provide a PDF path:');
    console.error('  npm run generate-embeddings -- path/to/documentation.pdf');
    console.error('\nOr place your PDF in: docs/documentation.pdf');
    process.exit(1);
  }
  
  // Check if Ollama is running
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
  } catch (error) {
    console.error('❌ Cannot connect to Ollama');
    console.error(`   Make sure Ollama is running at: ${OLLAMA_BASE_URL}`);
    console.error('   Start Ollama with: ollama serve');
    process.exit(1);
  }
  
  // Check if embedding model is available
  try {
    await generateEmbedding('test', 'ollama', {
      baseURL: OLLAMA_BASE_URL,
      model: EMBEDDING_MODEL,
    });
  } catch (error) {
    console.error(`❌ Embedding model "${EMBEDDING_MODEL}" not available`);
    console.error(`   Pull the model with: ollama pull ${EMBEDDING_MODEL}`);
    console.error('   Or use llama3.2 by setting EMBEDDING_MODEL=llama3.2');
    process.exit(1);
  }
  
  await processDocumentation(pdfPath);
}

main().catch(console.error);

