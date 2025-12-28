# Hugging Face Quick Start

Get up and running with Hugging Face in 5 minutes!

## 🚀 Quick Setup

### 1. Get API Key (2 minutes)

1. Go to https://huggingface.co and sign up (free, no credit card)
2. Go to **Settings → Access Tokens**
3. Click **"New token"** → Name it → Click **"Generate"**
4. **Copy the token** (starts with `hf_`)

### 2. Add to Environment Variables (1 minute)

**Local (.env.local):**
```env
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_token_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_URL=https://your-embeddings-url.json
```

**Vercel:**
- Go to **Settings → Environment Variables**
- Add all variables above
- **Redeploy**

### 3. Test (2 minutes)

```bash
npm run dev
```

Open http://localhost:3000 and ask a question!

## ✅ Done!

That's it! Your app is now using Hugging Face's free API.

## 📊 Free Tier Limits

- ✅ **1000 requests/month** (resets monthly)
- ✅ **No credit card required**
- ⚠️ First request may take 10-30 seconds (model loading)

## 🔄 Switch to Ollama Later

When you're ready for Oracle Cloud:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://your-oracle-cloud-ip:11434
```

The code automatically switches!

---

**Full Guide:** See [HUGGINGFACE_SETUP.md](./HUGGINGFACE_SETUP.md) for detailed instructions.

