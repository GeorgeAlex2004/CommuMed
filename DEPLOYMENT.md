# Deployment Guide for CommuMed

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **That's it!** Your app will be live in minutes.

## How It Works

### Architecture

1. **PDF Upload** (`/api/upload`)
   - Accepts PDF file upload
   - Extracts text using `pdf-parse`
   - Chunks text into searchable segments
   - Stores index in file system (`/tmp` on Vercel)

2. **Search** (`/api/search`)
   - Loads index from storage
   - Uses Fuse.js for fast fuzzy search
   - Returns exact text matches grouped by page
   - Highlights search terms in results

3. **Frontend**
   - React components with Tailwind CSS
   - Real-time search with loading states
   - Structured results display
   - Responsive design

### Search Algorithm

- **Fuzzy Matching**: Uses Fuse.js with threshold 0.4 for flexible matching
- **Multi-term Search**: Splits query into terms and searches for each
- **Score-based Ranking**: Results sorted by relevance
- **Exact Text**: Only returns text from uploaded PDF (no AI generation)

## Performance Optimizations

1. **Chunking**: Text split into manageable chunks (sentences/paragraphs)
2. **Indexing**: Pre-processed index for fast retrieval
3. **Lazy Loading**: Index loaded only when needed
4. **Client-side Search**: Could be enhanced with client-side caching

## Production Considerations

### Current Limitations

- File storage in `/tmp` is ephemeral (may not persist across deployments)
- Index reloaded on each search request
- Single PDF at a time

### Recommended Upgrades

1. **Persistent Storage**
   - Use Vercel Blob Storage
   - Or database (Supabase, MongoDB)
   - Store index with metadata

2. **Caching**
   - Redis for index caching
   - CDN for static assets

3. **Enhanced Search**
   - Vector embeddings (OpenAI, Cohere)
   - Vector database (Pinecone, Weaviate)
   - Better semantic understanding

4. **Multiple PDFs**
   - Database schema for multiple documents
   - Document management UI
   - Search across all documents

## Troubleshooting

### PDF Not Processing
- Check file size (should be < 10MB by default)
- Verify PDF has extractable text (not scanned images)
- Check server logs for errors

### Search Not Working
- Ensure PDF was uploaded successfully
- Check browser console for API errors
- Verify index file exists in storage

### Slow Performance
- Optimize PDF chunking
- Reduce chunk size
- Implement pagination for results
- Add result limits

## Environment Variables

Currently none required, but for enhanced features:

```env
# Optional: For enhanced semantic search
OPENAI_API_KEY=your_key_here

# Optional: For persistent storage
BLOB_STORAGE_URL=your_blob_url
DATABASE_URL=your_database_url
```

## Support

For issues or questions, check:
- Next.js Documentation: https://nextjs.org/docs
- Vercel Documentation: https://vercel.com/docs
- Fuse.js Documentation: https://fusejs.io

