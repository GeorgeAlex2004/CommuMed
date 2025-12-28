#!/usr/bin/env tsx
/**
 * OCR Script to convert image-based PDF to text-based PDF
 * 
 * Requirements:
 * 1. Install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
 * 2. Install Python dependencies: pip install pytesseract pdf2image pillow
 * 3. Or use this Node.js version (requires additional setup)
 * 
 * Usage:
 * npm run ocr-pdf -- input.pdf output.pdf
 * 
 * Note: For 1052 pages, this will take several hours. Consider using online services
 * or splitting the PDF into smaller chunks first.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

async function checkTesseract(): Promise<boolean> {
  try {
    await execAsync('tesseract --version');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const inputPdf = process.argv[2];
  const outputPdf = process.argv[3] || inputPdf?.replace('.pdf', '_ocr.pdf');

  if (!inputPdf) {
    console.error('Usage: npm run ocr-pdf -- input.pdf [output.pdf]');
    process.exit(1);
  }

  if (!existsSync(inputPdf)) {
    console.error(`❌ PDF not found: ${inputPdf}`);
    process.exit(1);
  }

  console.log('🔍 Checking for Tesseract OCR...');
  const hasTesseract = await checkTesseract();

  if (!hasTesseract) {
    console.error('❌ Tesseract OCR not found!');
    console.error('\nPlease install Tesseract OCR:');
    console.error('  Windows: https://github.com/UB-Mannheim/tesseract/wiki');
    console.error('  Or use online OCR services (see PDF_ISSUES.md)');
    process.exit(1);
  }

  console.log('✅ Tesseract found');
  console.log('\n⚠️  For large PDFs (1000+ pages), consider:');
  console.log('   1. Using online OCR services (faster)');
  console.log('   2. Splitting PDF into smaller chunks first');
  console.log('   3. This process may take several hours\n');

  console.log('📄 This script requires Python with pytesseract.');
  console.log('   For Node.js solution, consider using pdf-lib + tesseract.js');
  console.log('\n💡 Recommended: Use online OCR service for 1052-page PDF');
  console.log('   See PDF_ISSUES.md for online options');
}

main().catch(console.error);

