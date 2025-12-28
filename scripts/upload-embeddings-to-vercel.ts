/**
 * Upload embeddings.json to Vercel Blob Storage
 * 
 * Usage: npm run upload-embeddings
 * 
 * Requires:
 * - VERCEL_TOKEN environment variable (get from https://vercel.com/account/tokens)
 * - @vercel/blob package installed
 */

import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function uploadEmbeddings() {
  try {
    // Check for Vercel token
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      console.error('❌ VERCEL_TOKEN environment variable is required');
      console.log('\n📝 To get your token:');
      console.log('1. Go to https://vercel.com/account/tokens');
      console.log('2. Create a new token');
      console.log('3. Set it: export VERCEL_TOKEN=your_token_here');
      process.exit(1);
    }

    // Find embeddings file
    const embeddingsPath = join(process.cwd(), 'data', 'embeddings.json');
    
    if (!existsSync(embeddingsPath)) {
      console.error(`❌ Embeddings file not found: ${embeddingsPath}`);
      console.log('\n💡 Make sure you have generated embeddings first:');
      console.log('   npm run generate-embeddings-from-text');
      process.exit(1);
    }

    console.log('📤 Reading embeddings file...');
    const fileContent = await readFile(embeddingsPath);
    const fileSizeMB = (fileContent.length / (1024 * 1024)).toFixed(2);
    console.log(`   File size: ${fileSizeMB} MB`);

    console.log('\n☁️  Uploading to Vercel Blob Storage...');
    
    // Try with token first, fallback to environment detection
    const blob = await put('embeddings.json', fileContent, {
      access: 'public',
      ...(vercelToken && { token: vercelToken }),
    });

    console.log('\n✅ Upload successful!');
    console.log('\n📋 Add this to your Vercel environment variables:');
    console.log(`   EMBEDDINGS_URL = ${blob.url}`);
    console.log('\n💡 Or use it directly in your .env.local:');
    console.log(`   EMBEDDINGS_URL=${blob.url}`);

    return blob.url;
  } catch (error) {
    console.error('❌ Error uploading embeddings:', error);
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('\n💡 Your VERCEL_TOKEN might be invalid. Get a new one from:');
        console.error('   https://vercel.com/account/tokens');
      }
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  uploadEmbeddings();
}

export { uploadEmbeddings };

