import { NextRequest, NextResponse } from 'next/server';
import { SearchEngine } from '@/lib/searchEngine';
import { TextChunk } from '@/lib/pdfParser';
import { readFile } from 'fs/promises';
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

async function loadIndex(): Promise<TextChunk[] | null> {
  try {
    const dataDir = getDataDir();
    const filePath = join(dataDir, 'index.json');
    
    if (!existsSync(filePath)) {
      return null;
    }

    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data) as TextChunk[];
  } catch (error) {
    console.error('Error loading index:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Load index from file system
    const chunks = await loadIndex();

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No PDF has been uploaded yet. Please upload a PDF first.' },
        { status: 400 }
      );
    }

    // Create search engine and index chunks
    const searchEngine = new SearchEngine();
    searchEngine.indexChunks(chunks);

    // Perform search
    const results = searchEngine.searchDisease(query.trim(), 50);

    // Group results by page for better organization
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.page]) {
        acc[result.page] = [];
      }
      acc[result.page].push(result);
      return acc;
    }, {} as Record<number, typeof results>);

    return NextResponse.json({
      success: true,
      results,
      groupedResults,
      count: results.length,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

