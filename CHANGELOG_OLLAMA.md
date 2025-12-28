# Changelog - Ollama Integration & Hugging Face Spaces Support

## Major Update: Ollama Integration

### What Changed

The system has been updated to use **Ollama** instead of OpenAI for LLM inference, making it:
- ✅ **Privacy-first**: All processing happens locally
- ✅ **Cost-free**: No API costs
- ✅ **Self-hosted**: Full control over your LLM
- ✅ **Hugging Face Spaces ready**: Optimized for deployment on HF Spaces

### New Features

1. **🦙 Ollama Integration**
   - Uses local/self-hosted Ollama for LLM inference
   - Supports multiple models (llama3.2, mistral, qwen, etc.)
   - Configurable via environment variables

2. **🚀 Hugging Face Spaces Support**
   - Complete Dockerfile for HF Spaces deployment
   - Automatic Ollama installation in container
   - Persistent storage at `/data` directory
   - Port configuration for HF Spaces

3. **⚙️ Environment Detection**
   - Automatically detects deployment environment
   - Uses appropriate storage paths:
     - Hugging Face: `/data`
     - Vercel: `/tmp/data`
     - Local: `./data`

### Technical Changes

#### Updated Files
- `app/api/chat/route.ts` - Now uses Ollama instead of OpenAI
- `app/api/upload/route.ts` - Updated storage paths for HF Spaces
- `app/api/search/route.ts` - Updated storage paths for HF Spaces
- `app/api/status/route.ts` - Updated storage paths for HF Spaces
- `package.json` - Replaced `@ai-sdk/openai` with `@ai-sdk/ollama`
- `next.config.js` - Added standalone output for Docker

#### New Files
- `Dockerfile` - Complete Docker setup for Hugging Face Spaces
- `.dockerignore` - Docker ignore patterns
- `README_HF.md` - Detailed Hugging Face Spaces deployment guide
- `CHANGELOG_OLLAMA.md` - This file

#### Modified Documentation
- `README.md` - Updated with Ollama setup instructions
- `SETUP.md` - Complete Ollama setup guide

### Migration from OpenAI

**Before:**
```env
OPENAI_API_KEY=sk-...
```

**After:**
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Setup Requirements

**New Requirements:**
1. **Ollama installed** on your system or server
2. **Model pulled** (e.g., `ollama pull llama3.2`)
3. **Ollama server running** (`ollama serve`)

**Optional Environment Variables:**
- `OLLAMA_BASE_URL` - Default: `http://localhost:11434`
- `OLLAMA_MODEL` - Default: `llama3.2`

### Deployment Changes

#### Hugging Face Spaces

1. Create Space with Docker SDK
2. Push code (Dockerfile included)
3. Set environment variables
4. Deploy!

See `README_HF.md` for detailed instructions.

#### Local Development

1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
2. Start Ollama: `ollama serve`
3. Pull model: `ollama pull llama3.2`
4. Run app: `npm run dev`

### Model Recommendations

- **llama3.2** (Default) - Fast, good quality, ~2GB
- **mistral** - Excellent for technical/medical content, ~4GB
- **qwen2.5** - Great multilingual support, ~2-5GB
- **llama3.1** - Higher quality, larger size, ~4-8GB

### Benefits

✅ **No API Costs**: Run entirely on your hardware
✅ **Privacy**: All data stays local
✅ **Control**: Choose your model and configuration
✅ **Offline**: Works without internet (after model download)
✅ **Customizable**: Easy to switch models or fine-tune

### Breaking Changes

- **Removed**: OpenAI API key requirement
- **Changed**: Environment variable names
- **Changed**: Storage paths for different deployment environments

### Performance Notes

- **First request**: May be slower as model loads
- **CPU vs GPU**: GPU significantly faster (if available)
- **Model size**: Larger models = better quality but slower
- **Context size**: Adjustable in chat route

### Troubleshooting

See `SETUP.md` for detailed troubleshooting guide.

Common issues:
- Ollama not running → Start with `ollama serve`
- Model not found → Pull with `ollama pull <model>`
- Connection refused → Check `OLLAMA_BASE_URL`
- Slow responses → Use smaller model or GPU

