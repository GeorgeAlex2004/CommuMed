# Hugging Face Setup Guide

This guide will help you set up Hugging Face's free Inference API for your medical assistant. **No credit card required!**

## 🎯 Why Hugging Face?

- ✅ **Completely free** (no credit card needed)
- ✅ **1000 requests/month** on free tier
- ✅ **No setup required** - just get an API key
- ✅ **Ready to use** - works immediately
- ✅ **Reliable** - hosted by Hugging Face

## Step 1: Create Hugging Face Account

1. **Go to Hugging Face:**
   - Visit: https://huggingface.co
   - Click **"Sign Up"** (top right)

2. **Create Account:**
   - Enter your email
   - Choose a username and password
   - Verify your email
   - **No credit card required!** ✅

## Step 2: Get Your API Key

1. **Go to Settings:**
   - Click your profile picture (top right)
   - Click **"Settings"**

2. **Create Access Token:**
   - Go to **"Access Tokens"** in the left sidebar
   - Click **"New token"**
   - **Name:** `commumed-api` (or any name)
   - **Type:** `Read` (sufficient for Inference API)
   - Click **"Generate token"**

3. **Copy Your Token:**
   - **IMPORTANT:** Copy the token immediately - you won't see it again!
   - It looks like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe

## Step 3: Configure Your Application

### For Local Development

Create or update `.env.local`:

```env
# Hugging Face Configuration
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Embeddings (hosted elsewhere)
EMBEDDINGS_URL=https://your-embeddings-url.json
```

### For Vercel Deployment

1. **Go to Vercel Dashboard:**
   - Open your project
   - Go to **Settings → Environment Variables**

2. **Add These Variables:**
   ```
   LLM_PROVIDER = huggingface
   HUGGINGFACE_API_KEY = hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   HUGGINGFACE_MODEL = meta-llama/Llama-3.2-3B-Instruct
   HUGGINGFACE_EMBEDDING_MODEL = sentence-transformers/all-MiniLM-L6-v2
   EMBEDDINGS_URL = https://your-embeddings-url.json
   ```

3. **Redeploy:**
   - Go to **Deployments**
   - Click **"Redeploy"** on the latest deployment

## Step 4: Test Your Setup

### Test Locally

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test in the browser:**
   - Open http://localhost:3000
   - Ask a question about your medical textbook
   - You should get a response!

### Test API Directly

```bash
# Test embedding generation
curl -X POST https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "test text"}'

# Test chat model
curl -X POST https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "User: What is diabetes?\n\nAssistant:"}'
```

## 📊 Available Models

### Chat Models (Text Generation)

| Model | Size | Best For |
|-------|------|----------|
| `meta-llama/Llama-3.2-3B-Instruct` | 3B | **Recommended** - Fast, good quality |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7B | Better quality, slower |
| `google/flan-t5-large` | 1B | Very fast, smaller responses |

### Embedding Models

| Model | Dimensions | Best For |
|-------|------------|----------|
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | **Recommended** |
| `sentence-transformers/all-mpnet-base-v2` | 768 | Better quality, slower |

## ⚙️ Configuration Options

### Environment Variables

```env
# Provider selection
LLM_PROVIDER=huggingface  # or 'ollama' to use Ollama instead

# Hugging Face API
HUGGINGFACE_API_KEY=your_api_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Optional: Custom base URL (for enterprise)
# HUGGINGFACE_BASE_URL=https://api-inference.huggingface.co
```

## 🆘 Troubleshooting

### "Model is currently loading"

**Problem:** The model needs to be loaded first (cold start)

**Solution:**
- Wait 10-30 seconds and try again
- The first request may take longer
- Models stay loaded for ~5 minutes after last use

### "Rate limit exceeded"

**Problem:** You've exceeded the free tier limit (1000 requests/month)

**Solutions:**
1. Wait until next month
2. Upgrade to Pro ($9/month) for more requests
3. Switch to Ollama (unlimited, self-hosted)

### "401 Unauthorized"

**Problem:** Invalid or missing API key

**Solution:**
- Check your `HUGGINGFACE_API_KEY` is correct
- Make sure it starts with `hf_`
- Regenerate if needed

### "503 Service Unavailable"

**Problem:** Model is loading or service is temporarily down

**Solution:**
- Wait a few seconds and retry
- Check Hugging Face status: https://status.huggingface.co

### Slow Responses

**Problem:** Free tier has rate limits and cold starts

**Solutions:**
- First request may take 10-30 seconds (model loading)
- Subsequent requests are faster
- Consider using smaller models for faster responses

## 📝 Free Tier Limits

- **1000 requests/month** (resets monthly)
- **Rate limiting:** ~10 requests/minute
- **Cold starts:** Models load on first use (~10-30 seconds)
- **No credit card required**

## 🔄 Switching Between Providers

You can easily switch between Hugging Face and Ollama:

```env
# Use Hugging Face
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_key

# Or use Ollama
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://your-ollama-server:11434
```

The code automatically detects which provider to use!

## ✅ Verification Checklist

- [ ] Hugging Face account created
- [ ] API token generated and copied
- [ ] Environment variables set (local and/or Vercel)
- [ ] Test request successful
- [ ] Chat interface working
- [ ] Embeddings loading correctly

## 🎉 You're Done!

Your application is now using Hugging Face's free Inference API!

**Next Steps:**
1. ✅ Test your chat interface
2. ✅ Monitor your API usage at https://huggingface.co/settings/tokens
3. ✅ Consider upgrading to Pro if you need more requests

## 📚 Additional Resources

- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **Available Models:** https://huggingface.co/models
- **API Status:** https://status.huggingface.co

---

**Need Help?** Check the troubleshooting section or refer to the main documentation.

