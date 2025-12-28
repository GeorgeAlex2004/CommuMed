# Quick Start Guide - Vector Embeddings Setup

## Overview

The system now uses **vector embeddings** for better search accuracy. Documentation is pre-processed into embeddings - users only search, no uploading needed.

## Setup Steps

### 1. Prepare Your Documentation

Place your PDF in the `docs` folder:
```
docs/documentation.pdf
```

### 2. Pull Embedding Model (if not already done)

```bash
ollama pull nomic-embed-text
```

Or use llama3.2 (already pulled):
```bash
# llama3.2 works as fallback
```

### 3. Generate Embeddings

```bash
npm run generate-embeddings
```

This processes your PDF and creates `data/embeddings.json`.

**Time:** 5-30 minutes depending on PDF size

### 4. Start the Application

```bash
npm run dev
```

### 5. Use the Application

Open http://localhost:3000 and start asking questions!

## What Changed

✅ **Removed**: PDF upload UI  
✅ **Added**: Vector embeddings for semantic search  
✅ **Improved**: Better search accuracy with cosine similarity  
✅ **Simplified**: Users go straight to chat interface  

## File Structure

```
CommuMed/
├── docs/
│   └── documentation.pdf    # Your PDF here
├── data/
│   └── embeddings.json      # Generated embeddings
├── scripts/
│   └── generate-embeddings.ts  # Embedding generation script
└── lib/
    └── vectorStore.ts       # Vector search implementation
```

## Updating Documentation

When you update your PDF:

1. Replace `docs/documentation.pdf`
2. Run: `npm run generate-embeddings`
3. Restart the app

## Troubleshooting

**"Documentation embeddings not found"**
- Run: `npm run generate-embeddings`

**"Cannot connect to Ollama"**
- Start Ollama: `ollama serve`

**"Embedding model not available"**
- Pull model: `ollama pull nomic-embed-text`

For more details, see `SETUP_EMBEDDINGS.md`.

