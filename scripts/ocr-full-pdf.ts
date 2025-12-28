#!/usr/bin/env tsx
/**
 * OCR entire PDF using Tesseract OCR
 * Converts PDF to images, runs OCR on each page, saves all text
 * 
 * Requirements:
 * 1. Install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
 * 2. Install Python dependencies: pip install pdf2image pytesseract pillow
 * 
 * Usage:
 * npm run ocr-full-pdf -- "path/to/pdf.pdf"
 * 
 * Output: Creates a text file with all extracted text
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
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

async function checkPython(): Promise<boolean> {
  try {
    await execAsync('python --version');
    return true;
  } catch {
    try {
      await execAsync('python3 --version');
      return true;
    } catch {
      return false;
    }
  }
}

async function checkPythonPackages(): Promise<boolean> {
  try {
    await execAsync('python -c "import pdf2image, pytesseract, PIL"');
    return true;
  } catch {
    try {
      await execAsync('python3 -c "import pdf2image, pytesseract, PIL"');
      return true;
    } catch {
      return false;
    }
  }
}

async function checkPoppler(): Promise<boolean> {
  try {
    await execAsync('pdftoppm -v');
    return true;
  } catch {
    return false;
  }
}

async function findPopplerPath(): Promise<string | null> {
  const { existsSync } = await import('fs');
  const commonPaths = [
    'C:\\poppler\\Library\\bin\\pdftoppm.exe',
    'C:\\Program Files\\poppler\\Library\\bin\\pdftoppm.exe',
    'C:\\Program Files (x86)\\poppler\\Library\\bin\\pdftoppm.exe',
  ];

  for (const path of commonPaths) {
    if (existsSync(path)) {
      // Return the bin directory, not the exe
      return path.replace('\\pdftoppm.exe', '');
    }
  }
  return null;
}

async function findTesseractPath(): Promise<string | null> {
  const commonPaths = [
    'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
    'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
    process.env.TESSERACT_CMD || '',
  ].filter(p => p);

  for (const path of commonPaths) {
    try {
      const { existsSync } = await import('fs');
      if (existsSync(path)) {
        return path;
      }
    } catch {
      // Continue
    }
  }
  return null;
}

async function createOCRScript(pdfPath: string, outputPath: string, tesseractPath?: string, popplerPath?: string): Promise<string> {
  const tesseractConfig = tesseractPath 
    ? `pytesseract.pytesseract.tesseract_cmd = r'${tesseractPath.replace(/\\/g, '\\\\')}'`
    : '# Using default Tesseract path';
  
  const popplerConfig = popplerPath
    ? `poppler_path = r'${popplerPath.replace(/\\/g, '\\\\')}'`
    : 'poppler_path = None';
    
  const scriptContent = `
# -*- coding: utf-8 -*-
import sys
import io
from pdf2image import convert_from_path
import pytesseract
from pathlib import Path

# Set stdout to UTF-8 to handle Unicode characters and enable unbuffered output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)
else:
    # Force line buffering for real-time progress
    try:
        sys.stdout.reconfigure(line_buffering=True)
    except AttributeError:
        # Python < 3.7 doesn't have reconfigure, use flush=True in print statements
        pass

${tesseractConfig}
${popplerConfig}

def ocr_pdf(pdf_path, output_path):
    print("[INFO] Converting PDF to images...")
    try:
        # First, get page count to show progress
        from pdf2image.pdf2image import pdfinfo_from_path
        if poppler_path:
            info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path)
        else:
            info = pdfinfo_from_path(pdf_path)
        total_pages = info.get('Pages', 0)
        print(f"   PDF has {total_pages} pages")
        print("   Converting pages to images (this may take a few minutes)...")
        
        # Convert PDF pages to images (300 DPI for good quality)
        # Convert in batches to show progress
        convert_kwargs = {'dpi': 300, 'thread_count': 4}
        if poppler_path:
            convert_kwargs['poppler_path'] = poppler_path
        
        # Convert and process in small batches to avoid memory issues
        # Process each batch immediately after conversion to free memory
        batch_size = 10  # Reduced from 100 to avoid MemoryError
        all_text = []
        
        print("\\n[INFO] Converting and processing pages in batches...")
        
        for start_page in range(1, total_pages + 1, batch_size):
            end_page = min(start_page + batch_size - 1, total_pages)
            batch_kwargs = convert_kwargs.copy()
            batch_kwargs['first_page'] = start_page
            batch_kwargs['last_page'] = end_page
            
            # Convert this batch
            batch_images = convert_from_path(pdf_path, **batch_kwargs)
            
            # Process OCR on this batch immediately
            for i, image in enumerate(batch_images):
                page_num = start_page + i
                print(f"   Processing page {page_num}/{total_pages}...", end='\\r', flush=True)
                
                # Run OCR on image
                text = pytesseract.image_to_string(image, lang='eng')
                
                # Add page separator
                all_text.append(f"\\n\\n=== PAGE {page_num} ===\\n\\n")
                all_text.append(text)
            
            # Free memory by clearing the batch
            del batch_images
            
            # Save progress every 50 pages
            if (end_page % 50 == 0 or end_page == total_pages):
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(''.join(all_text))
                print(f"\\n   [SAVED] Progress saved (page {end_page}/{total_pages})")
        
        # Save final text
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(''.join(all_text))
        
        print(f"\\n[OK] OCR complete! Text saved to: {output_path}")
        print(f"   Total pages processed: {total_pages}")
        return total_pages
        
    except Exception as e:
        print(f"\\n[ERROR] Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    pdf_path = "${pdfPath.replace(/\\/g, '/')}"
    output_path = "${outputPath.replace(/\\/g, '/')}"
    ocr_pdf(pdf_path, output_path)
`;

  const scriptPath = join(process.cwd(), 'scripts', 'ocr_temp.py');
  await writeFile(scriptPath, scriptContent);
  return scriptPath;
}

async function main() {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.error('Usage: npm run ocr-full-pdf -- "path/to/pdf.pdf"');
    process.exit(1);
  }
  
  if (!existsSync(pdfPath)) {
    console.error(`❌ PDF not found: ${pdfPath}`);
    process.exit(1);
  }
  
  console.log('🔍 Checking requirements...\n');
  
  // Check Tesseract (try PATH first, then common locations)
  const hasTesseractInPath = await checkTesseract();
  let tesseractPath: string | null = null;
  
  if (!hasTesseractInPath) {
    // Try to find Tesseract in common locations
    tesseractPath = await findTesseractPath();
    if (!tesseractPath) {
      console.error('❌ Tesseract OCR not found!');
      console.error('\nPlease install Tesseract OCR:');
      console.error('  Windows: https://github.com/UB-Mannheim/tesseract/wiki');
      console.error('  Download and install the Windows installer');
      console.error('  Make sure to add Tesseract to PATH during installation\n');
      process.exit(1);
    }
    console.log(`✅ Tesseract OCR found at: ${tesseractPath}`);
    console.log('   (Will configure pytesseract to use this path)');
  } else {
    console.log('✅ Tesseract OCR found in PATH');
  }
  
  // Check Python
  const hasPython = await checkPython();
  if (!hasPython) {
    console.error('❌ Python not found!');
    console.error('\nPlease install Python:');
    console.error('  Download from: https://www.python.org/downloads/');
    console.error('  Make sure to check "Add Python to PATH" during installation\n');
    process.exit(1);
  }
  console.log('✅ Python found');
  
  // Check Python packages
  const hasPackages = await checkPythonPackages();
  if (!hasPackages) {
    console.error('❌ Required Python packages not found!');
    console.error('\nPlease install required packages:');
    console.error('  pip install pdf2image pytesseract pillow');
    console.error('  Or: python -m pip install pdf2image pytesseract pillow\n');
    console.error('Note: You may also need to install poppler:');
    console.error('  Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases');
    console.error('  Extract and add to PATH\n');
    process.exit(1);
  }
  console.log('✅ Python packages found');
  
  // Check Poppler (required for pdf2image)
  const hasPopplerInPath = await checkPoppler();
  let popplerPath: string | null = null;
  
  if (!hasPopplerInPath) {
    popplerPath = await findPopplerPath();
    if (!popplerPath) {
      console.error('\n❌ Poppler not found!');
      console.error('Poppler is required for PDF to image conversion.');
      console.error('\nPlease install Poppler:');
      console.error('  1. Download from: https://github.com/oschwartz10612/poppler-windows/releases');
      console.error('  2. Extract the zip file (e.g., to C:\\poppler)');
      console.error('  3. Add the bin folder to PATH:');
      console.error('     - Add: C:\\poppler\\Library\\bin to your PATH environment variable');
      console.error('     - Or run this command in PowerShell (temporary):');
      console.error('       $env:PATH += ";C:\\poppler\\Library\\bin"');
      console.error('  4. Restart your terminal after adding to PATH\n');
      process.exit(1);
    }
    // Add Poppler to PATH for this session
    const currentPath = process.env.PATH || '';
    process.env.PATH = `${popplerPath};${currentPath}`;
    console.log(`✅ Poppler found at: ${popplerPath}`);
    console.log('   (Added to PATH for this session)');
  } else {
    console.log('✅ Poppler found in PATH');
  }
  console.log('');
  
  // Create output file path
  const outputDir = join(process.cwd(), 'data');
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'ocr-extracted-text.txt');
  
  console.log('📄 PDF:', pdfPath);
  console.log('📝 Output:', outputPath);
  console.log('\n⚠️  This will take a LONG time for 1052 pages!');
  console.log('   Estimated time: 2-4 hours');
  console.log('   Progress will be saved every 50 pages\n');
  
  // Create Python script with Tesseract and Poppler paths (found above)
  const pythonScript = await createOCRScript(pdfPath, outputPath, tesseractPath || undefined, popplerPath || undefined);
  
  console.log('🚀 Starting OCR process...\n');
  console.log('📊 Progress will be shown below:\n');
  console.log('─'.repeat(60));
  
  try {
    // Run Python script with real-time output streaming
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    await new Promise<void>((resolve, reject) => {
      const pythonProcess = spawn(pythonCmd, [pythonScript], {
        stdio: 'inherit', // This will stream output directly to console
        shell: true
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
    
    console.log('\n─'.repeat(60));
    console.log('\n✅ OCR complete!');
    console.log(`📄 Text saved to: ${outputPath}`);
    console.log('\nNext step: Generate embeddings from the text file');
    console.log('Run: npm run generate-embeddings-from-text -- "' + outputPath + '"');
    
  } catch (error: any) {
    console.error('\n─'.repeat(60));
    console.error('\n❌ Error during OCR:', error.message);
    process.exit(1);
  } finally {
    // Clean up temp script
    try {
      const { unlink } = await import('fs/promises');
      await unlink(pythonScript);
    } catch {
      // Ignore cleanup errors
    }
  }
}

main().catch(console.error);

