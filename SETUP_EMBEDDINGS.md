# Setting Up Vector Embeddings

This guide explains how to prepare your documentation for vector-based search.

## Overview

Instead of uploading PDFs through the UI, you'll pre-process your documentation into vector embeddings. This provides:
- ✅ **Better search accuracy** - Semantic similarity instead of keyword matching
- ✅ **Faster retrieval** - Pre-computed embeddings
- ✅ **No user uploads** - Documentation is pre-loaded

## Step 1: Prepare Your Documentation

1. Place your PDF file in the `docs` folder:
   ```
   docs/documentation.pdf
   ```

2. Or keep it anywhere and provide the path when generating embeddings.

## Step 2: Install Embedding Model

Pull an embedding model for Ollama:

```bash
# Recommended: nomic-embed-text (small, fast, good quality)
ollama pull nomic-embed-text

# Or use llama3.2 (if nomic-embed-text is not available)
# llama3.2 is already pulled if you followed the setup
```

## Step 3: Generate Embeddings

Run the embedding generation script:

```bash
npm run generate-embeddings
```

This will:
1. Extract text from your PDF
2. Split it into chunks
3. Generate vector embeddings for each chunk
4. Save to `data/embeddings.json`

**Time estimate:**
- Small PDF (< 50 pages): 5-10 minutes
- Medium PDF (50-200 pages): 15-30 minutes
- Large PDF (> 200 pages): 30+ minutes

## Step 4: Verify Embeddings

Check that embeddings were created:

```bash
# On Windows
dir data\embeddings.json

# On Linux/Mac
ls -lh data/embeddings.json
```

The file should exist and have a reasonable size (depends on PDF size).

## Step 5: Start the Application

```bash
npm run dev
```

The application will automatically load the embeddings and use them for search.

## Updating Documentation

When you update your documentation:

1. Replace the PDF in `docs/documentation.pdf`
2. Regenerate embeddings:
   ```bash
   npm run generate-embeddings
   ```
3. Restart the application (if running)

## Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama serve`
- Check the URL: `http://localhost:11434`

### "Embedding model not available"
- Pull the model: `ollama pull nomic-embed-text`
- Or set `EMBEDDING_MODEL=llama3.2` in your environment

### "PDF not found"
- Check the path in `docs/documentation.pdf`
- Or provide full path: `npm run generate-embeddings -- C:\path\to\file.pdf`

### Slow embedding generation
- This is normal for large PDFs
- Consider using a GPU for faster processing
- The script shows progress as it processes chunks

## Environment Variables

Optional environment variables:

```env
# Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434

# Embedding model to use
EMBEDDING_MODEL=nomic-embed-text

# Data directory (auto-detected)
# DATA_DIR=./data
```

## How It Works

1. **PDF Parsing**: Extracts text and splits into chunks
2. **Embedding Generation**: Each chunk is converted to a vector using Ollama
3. **Vector Storage**: Embeddings saved to `data/embeddings.json`
4. **Search**: User queries are embedded and matched using cosine similarity
5. **Retrieval**: Top matching chunks are sent to LLM as context

## Benefits of Vector Embeddings

- **Semantic Search**: Finds relevant content even if exact keywords don't match
- **Better Context**: Retrieves conceptually similar information
- **Accuracy**: More precise than keyword-based search
- **Scalability**: Fast retrieval even with large documentation

