# Deploying CommuMed on Vercel

This guide explains how to deploy CommuMed entirely on Vercel without a separate backend server.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **LLM Provider** - Choose one:
   - **Option A (Recommended)**: Hugging Face Space (free, no credit card) - See [HF_SPACE_QUICK_START.md](./HF_SPACE_QUICK_START.md)
   - **Option B**: Hugging Face Inference API (free, rate-limited) - See [HUGGINGFACE_QUICK_START.md](./HUGGINGFACE_QUICK_START.md)
   - **Option C**: Self-hosted Ollama on a VPS (Railway, Render, DigitalOcean, Oracle Cloud, etc.)
   - **Option D**: Run Ollama locally and expose it via ngrok/tunneling (for testing only)

3. **Embeddings Storage** - Store your `embeddings.json` file (181 MB) in cloud storage:
   - **Option A**: Vercel Blob Storage (recommended)
   - **Option B**: Public URL (GitHub Releases, S3, etc.)
   - **Option C**: Include in build (not recommended due to size)

## Step 1: Prepare Embeddings for Cloud Storage

### Option A: Upload to Vercel Blob Storage (Recommended)

1. Get your Vercel token:
   - Go to: https://vercel.com/account/tokens
   - Create a new token
   - Copy it

2. Set token and upload:
   ```bash
   # Windows PowerShell
   $env:VERCEL_TOKEN="vercel_your_token_here"
   
   # Mac/Linux
   export VERCEL_TOKEN="vercel_your_token_here"
   
   # Upload embeddings
   npm run upload-embeddings
   ```
   
   This will return a URL like: `https://[hash].public.blob.vercel-storage.com/embeddings-[hash].json`

3. Copy the URL - you'll need it for environment variables.

### Option B: Upload to GitHub Release (Recommended Alternative)

1. **Go to your GitHub repository:**
   - Open your repo in browser
   - Click **"Releases"** → **"Create a new release"**

2. **Create release:**
   - **Tag:** `v1.0.0` (or any version)
   - **Title:** `Embeddings Release`
   - **Upload file:** Drag and drop `data/embeddings.json`
   - Click **"Publish release"**

3. **Get download URL:**
   - Click on the uploaded `embeddings.json` file
   - Right-click → Copy link address
   - URL format: `https://github.com/USER/REPO/releases/download/v1.0.0/embeddings.json`

4. **Use in Vercel:**
   - Add as `EMBEDDINGS_URL` environment variable

See [GITHUB_RELEASE_GUIDE.md](./GITHUB_RELEASE_GUIDE.md) for detailed steps.

### Option C: Upload to Other Public Storage

Upload `data/embeddings.json` to:
- AWS S3 (make it public)
- Cloudflare R2
- Any public file hosting service

Copy the public URL.

## Step 2: Set Up LLM Service

### Option A: Hugging Face Space (Recommended - No Credit Card)

See [HF_SPACE_QUICK_START.md](./HF_SPACE_QUICK_START.md) for complete setup.

**Quick steps:**
1. Create Space at https://huggingface.co/spaces
2. Upload files from `hf-space/` directory
3. Get Space URL: `https://YOUR_USERNAME-SPACE-NAME.hf.space`
4. Use this URL in `HUGGINGFACE_SPACE_URL` environment variable

### Option B: Hugging Face Inference API

See [HUGGINGFACE_QUICK_START.md](./HUGGINGFACE_QUICK_START.md) for setup.

**Quick steps:**
1. Get API key from https://huggingface.co/settings/tokens
2. Use in `HUGGINGFACE_API_KEY` environment variable

### Option C: Self-Hosted Ollama

1. **Deploy Ollama on a VPS** (Railway, Render, DigitalOcean, etc.):

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama (make it accessible)
   OLLAMA_HOST=0.0.0.0:11434 ollama serve
   
   # Pull required models
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

2. **Expose Ollama**:
   - Ensure port 11434 is open
   - Use your server's public IP or domain
   - Example: `http://your-server-ip:11434` or `https://ollama.yourdomain.com`

3. **Security** (Production):
   - Use HTTPS with reverse proxy (nginx, Caddy)
   - Add authentication if needed
   - Restrict access to your Vercel domain only

### Using ngrok (Testing Only)

For local testing:
```bash
# Install ngrok
# Start Ollama locally
ollama serve

# In another terminal, expose it
ngrok http 11434

# Use the ngrok URL (e.g., https://abc123.ngrok.io)
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add OLLAMA_BASE_URL
   # Enter your Ollama URL (e.g., http://your-server-ip:11434)
   
   vercel env add EMBEDDINGS_URL
   # Enter your embeddings URL (from Step 1)
   
   vercel env add EMBEDDING_MODEL
   # Enter: nomic-embed-text (or llama3.2)
   
   vercel env add OLLAMA_MODEL
   # Enter: llama3.2
   ```

5. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following based on your provider:

   **For Hugging Face Space (Recommended - No Credit Card):**
     ```
     LLM_PROVIDER = huggingface
     HUGGINGFACE_SPACE_URL = https://YOUR_USERNAME-commumed-llm.hf.space
     EMBEDDINGS_URL = https://your-embeddings-url.json
     ```
     See [HF_SPACE_QUICK_START.md](./HF_SPACE_QUICK_START.md) for setup

   **For Hugging Face Inference API (Alternative):**
     ```
     LLM_PROVIDER = huggingface
     HUGGINGFACE_API_KEY = hf_your_api_key_here
     HUGGINGFACE_MODEL = meta-llama/Llama-3.2-3B-Instruct
     HUGGINGFACE_EMBEDDING_MODEL = sentence-transformers/all-MiniLM-L6-v2
     EMBEDDINGS_URL = https://your-embeddings-url.json
     ```
     Get your API key: https://huggingface.co/settings/tokens

   **For Ollama (Self-Hosted):**
     ```
     LLM_PROVIDER = ollama
     OLLAMA_BASE_URL = http://your-ollama-server:11434
     EMBEDDINGS_URL = https://your-embeddings-url.json
     EMBEDDING_MODEL = nomic-embed-text
     OLLAMA_MODEL = llama3.2
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

## Step 4: Verify Deployment

1. **Check Vercel Deployment**:
   - Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
   - You should see the CommuMed interface

2. **Test the Chat**:
   - Ask a question about your documentation
   - Verify it connects to Ollama and loads embeddings

3. **Check Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any errors in the logs

## Environment Variables Reference

### Hugging Face (Recommended)

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_PROVIDER` | Set to `huggingface` | `huggingface` |
| `HUGGINGFACE_API_KEY` | Your HF API token | `hf_xxxxxxxxxxxxx` |
| `HUGGINGFACE_MODEL` | Chat model | `meta-llama/Llama-3.2-3B-Instruct` |
| `HUGGINGFACE_EMBEDDING_MODEL` | Embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| `EMBEDDINGS_URL` | Public URL to embeddings.json | `https://blob.vercel-storage.com/...` |

### Ollama (Self-Hosted)

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_PROVIDER` | Set to `ollama` | `ollama` |
| `OLLAMA_BASE_URL` | URL of your Ollama service | `http://your-server:11434` |
| `EMBEDDINGS_URL` | Public URL to embeddings.json | `https://blob.vercel-storage.com/...` |
| `EMBEDDING_MODEL` | Model for generating embeddings | `nomic-embed-text` |
| `OLLAMA_MODEL` | Model for chat responses | `llama3.2` |

## Troubleshooting

### "Cannot connect to Ollama" (Ollama only)
- Verify `OLLAMA_BASE_URL` is correct
- Ensure Ollama is running and accessible
- Check firewall/security group settings
- Test Ollama URL in browser: `http://your-server:11434/api/tags`

### "Hugging Face API error" (Hugging Face only)
- Verify `HUGGINGFACE_API_KEY` is correct and starts with `hf_`
- Check your API usage at https://huggingface.co/settings/tokens
- Free tier: 1000 requests/month
- First request may take 10-30 seconds (model loading)

### "Embeddings not found"
- Verify `EMBEDDINGS_URL` is correct and accessible
- Test the URL in browser - should download JSON
- Check CORS if loading from different domain

### "Function timeout"
- Vercel free tier has 10s timeout
- Upgrade to Pro for 60s timeout
- Or use Vercel Pro for 300s timeout (configured in `vercel.json`)

### "Out of memory"
- Embeddings file is 181 MB - ensure Vercel function has enough memory
- Consider splitting embeddings or using Edge Functions (future enhancement)

## Cost Considerations

- **Vercel Free Tier**:
  - 100 GB bandwidth/month
  - 100 hours serverless function execution
  - 10s function timeout

- **Vercel Pro** ($20/month):
  - Unlimited bandwidth
  - 1000 hours execution
  - 60s function timeout (or 300s with config)

- **Ollama Hosting**:
  - VPS: $5-20/month (Railway, Render, DigitalOcean)
  - Requires GPU for good performance (adds cost)

## Security Best Practices

1. **Ollama Access**:
   - Use HTTPS with reverse proxy
   - Restrict access to Vercel domain only
   - Consider adding authentication

2. **Embeddings URL**:
   - Use signed URLs if possible
   - Don't expose sensitive data in embeddings

3. **Environment Variables**:
   - Never commit `.env` files
   - Use Vercel's environment variable management

## Updating Embeddings

When you update your documentation:

1. Regenerate embeddings locally:
   ```bash
   npm run generate-embeddings-from-text -- data/ocr-extracted-text.txt
   ```

2. Upload new `embeddings.json` to cloud storage

3. Update `EMBEDDINGS_URL` environment variable in Vercel

4. Redeploy (or wait for next deployment)

## Next Steps

- Monitor usage and performance
- Set up error tracking (Sentry, etc.)
- Consider caching frequently asked questions
- Optimize embeddings size if needed

