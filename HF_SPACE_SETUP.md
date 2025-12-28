# Hugging Face Space Setup Guide

This guide will help you deploy a Hugging Face Space that serves as the LLM API for CommuMed.

## 🎯 Overview

- **Hugging Face Space**: Hosts the LLM models (chat + embeddings)
- **Vercel**: Hosts the Next.js frontend and API routes
- **Vercel Blob**: Stores the embeddings.json file

## Step 1: Create Hugging Face Space

### 1.1 Create New Space

1. **Go to Hugging Face:**
   - Visit: https://huggingface.co
   - Sign up or log in (free, no credit card)

2. **Create New Space:**
   - Click your profile → **"New Space"**
   - **Space name:** `commumed-llm` (or any name)
   - **SDK:** Select **"Gradio"**
   - **Template:** Select **"Blank Space"** (or "Minimal Hello World" - we'll replace it anyway)
   - **Hardware:** Select **"CPU basic"** (free tier) or **"GPU T4 small"** (if you have Pro)
   - **Visibility:** Public or Private (your choice)
   - Click **"Create Space"**

### 1.2 Upload Space Files

1. **Get your access token:**
   - Go to: https://huggingface.co/settings/tokens
   - Click **"New token"**
   - **Name:** `commumed-space`
   - **Type:** **Write** (needed for pushing)
   - Click **"Generate"** and **copy the token** (starts with `hf_`)

2. **Clone your space:**
   
   **Windows PowerShell:**
   ```powershell
   # Replace YOUR_TOKEN with your actual token
   git clone https://YOUR_TOKEN@huggingface.co/spaces/unwonted-uplift/commumed-llm
   cd commumed-llm
   ```
   
   **Mac/Linux:**
   ```bash
   # Replace YOUR_TOKEN with your actual token
   git clone https://YOUR_TOKEN@huggingface.co/spaces/unwonted-uplift/commumed-llm
   cd commumed-llm
   ```
   
   **Alternative (will prompt for credentials):**
   ```bash
   git clone https://huggingface.co/spaces/unwonted-uplift/commumed-llm
   cd commumed-llm
   # When prompted:
   # Username: your_huggingface_username
   # Password: YOUR_TOKEN (the hf_ token, not your password)
   ```

3. **Copy files from this repo:**
   
   **Windows PowerShell:**
   ```powershell
   # Adjust path to your CommuMed project
   Copy-Item -Path "D:\Work\Projects\Personal\CommuMed\hf-space\*" -Destination . -Recurse
   ```
   
   **Mac/Linux:**
   ```bash
   # Copy the Space files
   cp -r ../CommuMed/hf-space/* .
   # Or specify full path:
   # cp -r /path/to/CommuMed/hf-space/* .
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial Space setup - CommuMed LLM API"
   git push
   ```

   The Space will automatically build and deploy!

### 1.3 Get Your Space URL

After deployment, your Space will be available at:
```
https://YOUR_USERNAME-commumed-llm.hf.space
```

**Copy this URL** - you'll need it for Vercel!

## Step 2: Upload Embeddings to Vercel Blob

### 2.1 Get Vercel Token

1. **Go to Vercel:**
   - Visit: https://vercel.com/account/tokens
   - Click **"Create Token"**
   - **Name:** `commumed-upload`
   - **Scope:** Full Account
   - Click **"Create"**
   - **Copy the token** (starts with `vercel_`)

### 2.2 Install Vercel Blob Package

```bash
npm install @vercel/blob
```

### 2.3 Upload Embeddings

1. **Set your token:**
   ```bash
   # Windows PowerShell
   $env:VERCEL_TOKEN="vercel_your_token_here"
   
   # Mac/Linux
   export VERCEL_TOKEN="vercel_your_token_here"
   ```

2. **Run upload script:**
   ```bash
   npm run upload-embeddings
   ```

3. **Copy the URL:**
   The script will output a URL like:
   ```
   https://[hash].public.blob.vercel-storage.com/embeddings-[hash].json
   ```
   
   **Copy this URL** - you'll need it for Vercel environment variables!

## Step 3: Configure Vercel

### 3.1 Set Environment Variables

Go to your Vercel project → **Settings → Environment Variables**

Add these variables:

```env
# LLM Provider
LLM_PROVIDER=huggingface

# Hugging Face Space URL (from Step 1.3)
HUGGINGFACE_SPACE_URL=https://YOUR_USERNAME-commumed-llm.hf.space

# Optional: API key if Space is private
# HUGGINGFACE_API_KEY=hf_your_key_here

# Embeddings URL (from Step 2.3)
EMBEDDINGS_URL=https://[hash].public.blob.vercel-storage.com/embeddings-[hash].json

# Optional: Model names (defaults work fine)
# HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
# HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 3.2 Redeploy

1. Go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete

## Step 4: Test Your Setup

1. **Visit your Vercel URL:**
   - Open: `https://your-app.vercel.app`
   - You should see the CommuMed interface

2. **Test the chat:**
   - Ask a question about your medical textbook
   - The app should:
     - Load embeddings from Vercel Blob ✅
     - Generate query embedding via Space ✅
     - Get chat response from Space ✅

3. **Check logs:**
   - Vercel Dashboard → Your Project → Functions → View logs
   - Hugging Face Space → Logs tab

## 🆘 Troubleshooting

### "Space API error: 503"

**Problem:** Space is still building or model is loading

**Solution:**
- Wait 2-5 minutes for first build
- Check Space logs for errors
- First request may take 30-60 seconds (model loading)

### "Space API error: 404"

**Problem:** Space URL is incorrect

**Solution:**
- Verify your Space URL format: `https://USERNAME-SPACE-NAME.hf.space`
- Make sure Space is deployed (check Space page)
- Try accessing Space URL in browser

### "Cannot load embeddings"

**Problem:** Embeddings URL is incorrect or file not uploaded

**Solution:**
- Verify `EMBEDDINGS_URL` is correct
- Test URL in browser - should download JSON
- Re-upload embeddings: `npm run upload-embeddings`

### "Rate limit exceeded"

**Problem:** Free tier has limits

**Solution:**
- Free tier: Limited requests
- Upgrade to Pro for more resources
- Or use Inference API as fallback (see code)

### Slow Responses

**Problem:** Free tier CPU is slow

**Solutions:**
- First request: 30-60 seconds (model loading)
- Subsequent requests: 5-15 seconds
- Upgrade to GPU for faster responses
- Or use Inference API (faster but rate-limited)

## 📊 Free Tier Limits

### Hugging Face Space (Free)
- **CPU basic**: Limited compute time
- **Model loading**: 30-60 seconds first time
- **Response time**: 5-15 seconds per request
- **Uptime**: May sleep after inactivity

### Vercel Blob (Free)
- **Storage**: 1 GB free
- **Bandwidth**: Generous free tier
- **Your embeddings**: ~182 MB ✅

## 🔄 Upgrading

### Hugging Face Space
- **GPU T4 small**: $0.60/hour (pay as you go)
- **GPU T4 medium**: $1.05/hour
- Much faster responses!

### Vercel
- **Pro**: $20/month
- Longer function timeouts
- More bandwidth

## ✅ Verification Checklist

- [ ] Hugging Face Space created and deployed
- [ ] Space URL copied
- [ ] Embeddings uploaded to Vercel Blob
- [ ] Embeddings URL copied
- [ ] Vercel environment variables set
- [ ] Vercel app redeployed
- [ ] Test chat working
- [ ] Check logs for errors

## 🎉 You're Done!

Your CommuMed app is now fully deployed:
- ✅ **LLM**: Hugging Face Space
- ✅ **Frontend**: Vercel
- ✅ **Embeddings**: Vercel Blob

## 📚 Next Steps

1. **Monitor usage:**
   - Hugging Face: Space → Settings → Usage
   - Vercel: Dashboard → Usage

2. **Optimize:**
   - Use smaller models for faster responses
   - Cache common queries (future enhancement)
   - Upgrade to GPU for production

3. **Scale:**
   - Upgrade Space to GPU
   - Add more embeddings if needed
   - Monitor costs

---

**Need Help?** Check the troubleshooting section or refer to the main documentation.

