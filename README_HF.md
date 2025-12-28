# Deploying CommuMed on Hugging Face Spaces

This guide explains how to deploy CommuMed on Hugging Face Spaces with Ollama.

## Prerequisites

1. A Hugging Face account
2. Git repository with your code

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository has:
- `Dockerfile` (already included)
- `package.json` with all dependencies
- All source files

### 2. Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Fill in:
   - **Space name**: `commumed` (or your choice)
   - **SDK**: Select "Docker"
   - **Hardware**: Choose based on your needs:
     - **CPU basic**: Free, slower
     - **CPU upgrade**: Paid, faster
     - **GPU**: For faster Ollama inference (recommended if available)
   - **Visibility**: Public or Private

### 3. Configure Environment Variables

In your Space settings, add these environment variables:

- `OLLAMA_BASE_URL`: `http://localhost:11434` (default, for local Ollama)
- `OLLAMA_MODEL`: `llama3.2` (or your preferred model like `mistral`, `qwen`, etc.)

### 4. Push Your Code

```bash
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
git push hf main
```

Or use the web interface to upload files.

### 5. Wait for Build

Hugging Face will automatically:
- Build the Docker image
- Install dependencies
- Start Ollama
- Deploy your application

## Important Notes

### Ollama Models

The Dockerfile installs Ollama, but you need to pull models. You can:

1. **Add model download to Dockerfile** (recommended):
   ```dockerfile
   # After installing Ollama, add:
   RUN ollama pull llama3.2
   ```

2. **Or pull models at runtime** (first request will be slower):
   - The first time someone uses the app, it will download the model
   - This can take several minutes

### Persistent Storage

- Hugging Face Spaces provide `/data` directory for persistent storage
- Your PDF indexes will be stored here
- Data persists across restarts

### Port Configuration

- Hugging Face Spaces automatically sets the `PORT` environment variable
- The Dockerfile uses port 7860 as default
- Next.js will automatically use the PORT env var

### Model Selection

Popular Ollama models for medical/technical content:
- `llama3.2` - Good general purpose, fast
- `mistral` - Good for technical content
- `qwen2.5` - Excellent for multilingual and technical
- `llama3.1` - Larger, more capable

Change model in Space settings via `OLLAMA_MODEL` environment variable.

## Troubleshooting

### Build Fails

- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Check build logs in Space settings

### Ollama Not Starting

- Check if Ollama is installed correctly
- Verify model is available: `ollama list`
- Check Space logs

### Slow Responses

- Use GPU hardware if available
- Use smaller models (llama3.2 instead of llama3.1)
- Reduce `maxTokens` in chat route

### Storage Issues

- Ensure `/data` directory exists
- Check permissions on `/data`
- Verify Space has enough storage quota

## Updating Your Space

1. Push changes to your repository
2. Hugging Face will automatically rebuild
3. Or manually trigger rebuild in Space settings

## Cost Considerations

- **CPU basic**: Free
- **CPU upgrade**: ~$0.60/hour
- **GPU**: Varies by GPU type

For production, consider:
- Using smaller models to reduce costs
- Implementing caching
- Using CPU upgrade instead of GPU if model is small enough

## Alternative: External Ollama

If you want to run Ollama separately (e.g., on a different server):

1. Set `OLLAMA_BASE_URL` to your external Ollama server
2. Remove Ollama installation from Dockerfile
3. Update CMD to just start Next.js

Example:
```dockerfile
CMD npm start
```

And set `OLLAMA_BASE_URL=https://your-ollama-server.com` in Space settings.

