# Quick Start: Deploy to Vercel Only

## Prerequisites Checklist

- [ ] Vercel account (free tier works)
- [ ] Ollama running somewhere accessible (VPS, Railway, Render, etc.)
- [ ] Embeddings file uploaded to cloud storage (181 MB)

## Step 1: Upload Embeddings

Upload `data/embeddings.json` to one of these:

**Option A: Vercel Blob Storage** (Recommended)
```bash
npm install -g vercel
vercel blob put data/embeddings.json
# Copy the returned URL
```

**Option B: GitHub Releases**
- Create a new release in your repo
- Attach `embeddings.json` as a file
- Copy the direct download URL

**Option C: Any Public URL**
- Upload to S3, Cloudflare R2, etc.
- Make it publicly accessible
- Copy the URL

## Step 2: Set Up Ollama

Deploy Ollama on a VPS (Railway, Render, DigitalOcean):

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start with public access
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Pull models
ollama pull llama3.2
ollama pull nomic-embed-text
```

Get your Ollama URL: `http://your-server-ip:11434`

## Step 3: Deploy to Vercel

### Via CLI:
```bash
vercel login
vercel

# Set environment variables
vercel env add OLLAMA_BASE_URL
# Enter: http://your-server-ip:11434

vercel env add EMBEDDINGS_URL
# Enter: https://your-embeddings-url.json

vercel env add EMBEDDING_MODEL
# Enter: nomic-embed-text

vercel env add OLLAMA_MODEL
# Enter: llama3.2

# Deploy to production
vercel --prod
```

### Via Dashboard:
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Settings:
   - `OLLAMA_BASE_URL` = `http://your-server:11434`
   - `EMBEDDINGS_URL` = `https://your-embeddings-url.json`
   - `EMBEDDING_MODEL` = `nomic-embed-text`
   - `OLLAMA_MODEL` = `llama3.2`
5. Deploy

## Step 4: Test

Visit your Vercel URL and test the chat interface!

## Troubleshooting

**"Cannot connect to Ollama"**
- Check `OLLAMA_BASE_URL` is correct
- Ensure Ollama is running and accessible
- Test: `curl http://your-server:11434/api/tags`

**"Embeddings not found"**
- Verify `EMBEDDINGS_URL` is accessible
- Test URL in browser - should download JSON
- Check file is publicly accessible

**Function timeout**
- Free tier: 10s limit
- Pro tier: 60s limit
- Configured: 300s in `vercel.json` (requires Pro)

## Cost Estimate

- **Vercel Free**: $0/month (100 GB bandwidth, 100 hours execution)
- **Vercel Pro**: $20/month (unlimited, 60s+ timeout)
- **Ollama VPS**: $5-20/month (Railway, Render, DigitalOcean)

## Full Documentation

See [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) for detailed instructions.

