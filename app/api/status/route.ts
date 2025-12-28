import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

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

export async function GET() {
  try {
    const dataDir = getDataDir();
    const filePath = join(dataDir, 'index.json');
    const exists = existsSync(filePath);

    if (exists) {
      const { readFile } = await import('fs/promises');
      const data = await readFile(filePath, 'utf-8');
      const chunks = JSON.parse(data);
      return NextResponse.json({
        uploaded: true,
        chunkCount: chunks.length,
      });
    }

    return NextResponse.json({
      uploaded: false,
      chunkCount: 0,
    });
  } catch (error) {
    return NextResponse.json({
      uploaded: false,
      chunkCount: 0,
    });
  }
}

