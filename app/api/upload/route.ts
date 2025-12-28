import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, TextChunk } from '@/lib/pdfParser';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Use appropriate directory based on deployment environment
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const chunks = await parsePDF(buffer);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No text found in PDF' },
        { status: 400 }
      );
    }

    // Save chunks to file system for persistence
    const dataDir = getDataDir();
    try {
      await mkdir(dataDir, { recursive: true });
      const filePath = join(dataDir, 'index.json');
      await writeFile(filePath, JSON.stringify(chunks, null, 2));
    } catch (error) {
      console.error('Error saving index:', error);
      return NextResponse.json(
        { error: 'Failed to save index' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PDF processed successfully',
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

