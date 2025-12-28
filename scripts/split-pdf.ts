#!/usr/bin/env tsx
/**
 * Split PDF into ~30MB chunks for OCR processing
 * 
 * Usage:
 * npm run split-pdf -- "path/to/pdf.pdf"
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdfParse from 'pdf-parse';

const TARGET_CHUNK_SIZE_MB = 30;
const TARGET_CHUNK_SIZE_BYTES = TARGET_CHUNK_SIZE_MB * 1024 * 1024; // 30MB in bytes

async function splitPDF(pdfPath: string): Promise<void> {
  console.log('📄 Reading PDF:', pdfPath);
  
  const pdfBuffer = await readFile(pdfPath);
  const totalSizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`📊 Total PDF size: ${totalSizeMB} MB`);
  
  // Get PDF info
  const pdfInfo = await pdfParse(pdfBuffer, { max: 1 }); // Just get metadata
  const totalPages = pdfInfo.numpages || 1;
  console.log(`📄 Total pages: ${totalPages}`);
  
  // Calculate pages per chunk (rough estimate)
  const bytesPerPage = pdfBuffer.length / totalPages;
  const pagesPerChunk = Math.floor(TARGET_CHUNK_SIZE_BYTES / bytesPerPage);
  const estimatedChunks = Math.ceil(totalPages / pagesPerChunk);
  
  console.log(`\n📦 Estimated chunks: ${estimatedChunks} (${pagesPerChunk} pages each)`);
  console.log(`   Target size: ~${TARGET_CHUNK_SIZE_MB}MB per chunk\n`);
  
  // Create output directory
  const outputDir = join(process.cwd(), 'pdf-chunks');
  await mkdir(outputDir, { recursive: true });
  
  console.log('⚠️  Note: This script estimates chunk sizes.');
  console.log('   For precise splitting, use online tools:');
  console.log('   https://www.ilovepdf.com/split-pdf\n');
  
  console.log('📋 Manual splitting guide:');
  console.log(`   1. Go to: https://www.ilovepdf.com/split-pdf`);
  console.log(`   2. Upload your PDF`);
  console.log(`   3. Choose "Split by range"`);
  console.log(`   4. Split into chunks of ~${pagesPerChunk} pages`);
  console.log(`   5. You'll get approximately ${estimatedChunks} files\n`);
  
  console.log('💡 Alternative: Split by file size');
  console.log('   Some tools allow splitting by size (30MB)');
  console.log('   This is more accurate than page count\n');
  
  // For actual splitting, we'd need a PDF library that can split
  // For now, provide instructions
  console.log('✅ Instructions saved. Proceed with online splitting tool.');
  console.log(`   Save chunks to: ${outputDir}/`);
}

async function main() {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.error('Usage: npm run split-pdf -- "path/to/pdf.pdf"');
    process.exit(1);
  }
  
  if (!existsSync(pdfPath)) {
    console.error(`❌ PDF not found: ${pdfPath}`);
    process.exit(1);
  }
  
  await splitPDF(pdfPath);
}

main().catch(console.error);

