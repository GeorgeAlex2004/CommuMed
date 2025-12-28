# Setup Guide for CommuMed with Ollama

## Quick Start

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

**Verify installation:**
```bash
ollama --version
```

### 2. Start Ollama Server

```bash
ollama serve
```

Keep this terminal open. Ollama will run on `http://localhost:11434` by default.

### 3. Pull a Model

In a new terminal, pull a model:

```bash
# Recommended models:
ollama pull llama3.2        # Fast, good general purpose (default)
ollama pull mistral         # Good for technical content
ollama pull qwen2.5         # Excellent for multilingual
ollama pull llama3.1        # Larger, more capable
```

**Note**: First pull will download the model (can be several GB). Subsequent uses are instant.

### 4. Install Project Dependencies

```bash
npm install
```

### 5. Set Up Environment Variables (Optional)

Create a `.env.local` file in the root directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

If you don't create this file, defaults will be used:
- `OLLAMA_BASE_URL`: `http://localhost:11434`
- `OLLAMA_MODEL`: `llama3.2`

### 6. Run Development Server

```bash
npm run dev
```

### 7. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### Architecture

1. **PDF Upload** → Text Extraction → Indexing
   - User uploads a PDF
   - System extracts all text
   - Text is chunked and indexed for fast retrieval

2. **User Question** → Retrieval → AI Response
   - User asks a question (e.g., "What is malaria?")
   - System searches indexed documentation for relevant chunks
   - Top relevant chunks are sent to Ollama as context
   - Ollama generates response using ONLY the provided context
   - Response is streamed back to user in real-time

### Key Features

✅ **Documentation-Only Responses**: AI is strictly instructed to only use information from your PDF
✅ **RAG (Retrieval Augmented Generation)**: Finds relevant information automatically
✅ **ChatGPT-like Interface**: Natural conversation experience
✅ **Real-time Streaming**: Responses appear as they're generated
✅ **Privacy-First**: All processing happens locally with Ollama
✅ **Cost-Free**: No API costs, runs entirely on your hardware

## Model Selection Guide

### llama3.2 (Default - Recommended)
- **Size**: ~2GB
- **Speed**: Very fast
- **Quality**: Good for general purpose
- **Best for**: Quick responses, lower resource usage

### mistral
- **Size**: ~4GB
- **Speed**: Fast
- **Quality**: Excellent for technical/medical content
- **Best for**: Medical documentation, technical queries

### qwen2.5
- **Size**: ~2-5GB (depending on variant)
- **Speed**: Fast
- **Quality**: Excellent multilingual support
- **Best for**: International medical documentation

### llama3.1
- **Size**: ~4-8GB (depending on variant)
- **Speed**: Moderate
- **Quality**: Higher quality responses
- **Best for**: When you need best quality and have resources

## Troubleshooting

### "Cannot connect to Ollama"

**Problem**: Ollama server is not running or not accessible.

**Solution**:
1. Ensure Ollama is installed: `ollama --version`
2. Start Ollama: `ollama serve`
3. Check if it's running: `curl http://localhost:11434/api/tags`
4. Verify `OLLAMA_BASE_URL` in `.env.local` matches your setup

### "Model not found"

**Problem**: The specified model hasn't been pulled.

**Solution**:
1. List available models: `ollama list`
2. Pull the model: `ollama pull llama3.2` (or your chosen model)
3. Update `OLLAMA_MODEL` in `.env.local` if using a different model

### Slow Responses

**Causes and Solutions**:
- **Large model**: Use smaller model (llama3.2 instead of llama3.1)
- **CPU only**: Consider GPU acceleration if available
- **First request**: First request after pull downloads model (one-time)
- **Large context**: Reduce number of chunks in `app/api/chat/route.ts`

### PDF Not Processing

- Ensure PDF has extractable text (not just scanned images)
- Check file size (should be reasonable)
- Verify PDF is not corrupted

### Out of Memory

- Use smaller model (llama3.2)
- Reduce `maxTokens` in chat route
- Close other applications
- Consider upgrading hardware

## Remote Ollama Setup

If you want to run Ollama on a different machine:

1. **On Ollama server**, set environment variable:
   ```bash
   export OLLAMA_HOST=0.0.0.0:11434
   ```

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **In your app**, set `OLLAMA_BASE_URL`:
   ```env
   OLLAMA_BASE_URL=http://your-server-ip:11434
   ```

4. **Security**: Ensure firewall allows connections on port 11434

## Production Deployment

### Hugging Face Spaces

See [README_HF.md](./README_HF.md) for detailed deployment instructions.

### Self-Hosted

1. Set up Ollama on your server
2. Pull required models
3. Deploy Next.js app
4. Set `OLLAMA_BASE_URL` to your Ollama server URL
5. Configure reverse proxy if needed

## Performance Tips

1. **Use appropriate model size** for your hardware
2. **GPU acceleration** significantly speeds up inference
3. **Cache responses** for common queries (future enhancement)
4. **Optimize chunk size** in PDF parsing
5. **Limit maxTokens** to reduce response time

## Security Notes

- Ollama runs locally by default (privacy-preserving)
- For remote Ollama, use HTTPS and authentication
- Keep your PDFs secure (they're stored in `/data` or `./data`)
- Consider encryption for sensitive medical data
