# Hugging Face Space + Vercel Quick Start

Get your CommuMed app deployed in 15 minutes!

## 🎯 Architecture

- **Hugging Face Space**: LLM API (chat + embeddings)
- **Vercel**: Frontend + API routes
- **Vercel Blob**: Embeddings storage

## Step 1: Create Hugging Face Space (5 min)

1. **Go to:** https://huggingface.co/spaces
2. **Click:** "New Space"
3. **Configure:**
   - Name: `commumed-llm`
   - SDK: **Gradio**
   - Template: **Blank Space** (or "Minimal Hello World" - we'll replace it)
   - Hardware: **CPU basic** (free)
4. **Get access token:**
   - Go to: https://huggingface.co/settings/tokens
   - Create token with **Write** permissions
   - Copy it (starts with `hf_`)

5. **Clone and upload files:**
   ```bash
   # Replace YOUR_TOKEN with your token
   git clone https://YOUR_TOKEN@huggingface.co/spaces/unwonted-uplift/commumed-llm
   cd commumed-llm
   
   # Windows PowerShell:
   Copy-Item -Path "D:\Work\Projects\Personal\CommuMed\hf-space\*" -Destination . -Recurse
   
   # Mac/Linux:
   cp -r ../CommuMed/hf-space/* .
   
   git add .
   git commit -m "Initial setup"
   git push
   ```
5. **Wait for build** (2-5 minutes)
6. **Copy Space URL:** `https://YOUR_USERNAME-commumed-llm.hf.space`

## Step 2: Upload Embeddings (3 min)

1. **Get Vercel token:**
   - Go to: https://vercel.com/account/tokens
   - Create token → Copy it

2. **Set token and upload:**
   ```bash
   # Windows PowerShell
   $env:VERCEL_TOKEN="vercel_your_token"
   
   # Mac/Linux
   export VERCEL_TOKEN="vercel_your_token"
   
   # Upload
   npm run upload-embeddings
   ```
3. **Copy the URL** from output

## Step 3: Configure Vercel (2 min)

1. **Go to:** Vercel Project → Settings → Environment Variables
2. **Add:**
   ```
   LLM_PROVIDER = huggingface
   HUGGINGFACE_SPACE_URL = https://YOUR_USERNAME-commumed-llm.hf.space
   EMBEDDINGS_URL = https://[hash].public.blob.vercel-storage.com/embeddings-[hash].json
   ```
3. **Redeploy**

## ✅ Done!

Your app is now live! Test it at your Vercel URL.

## 🆘 Quick Troubleshooting

- **503 Error**: Space still building, wait 2-5 min
- **404 Error**: Check Space URL format
- **Slow**: First request takes 30-60s (model loading)

**Full Guide:** See [HF_SPACE_SETUP.md](./HF_SPACE_SETUP.md)

