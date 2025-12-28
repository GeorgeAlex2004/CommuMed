---
title: CommuMed LLM API
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.0.0
app_file: app.py
pinned: false
license: mit
---

# CommuMed LLM API

This Hugging Face Space provides LLM and embedding services for the CommuMed medical assistant application.

## Features

- **Chat API**: Text generation using Llama 3.2
- **Embedding API**: Text embeddings using sentence-transformers
- **REST API**: Accessible via HTTP requests through Gradio API

## Setup Instructions

1. **Create a new Space** on Hugging Face:
   - SDK: **Gradio**
   - Template: **Blank Space** (or "Minimal Hello World")
   - Hardware: **CPU basic** (free) or **GPU T4 small** (faster)

2. **Upload these files** to your Space:
   - `app.py` (this file)
   - `requirements.txt`

3. **Wait for build** (2-5 minutes)

4. **Get your Space URL:**
   - Format: `https://YOUR_USERNAME-SPACE-NAME.hf.space`
   - Use this in your Vercel environment variable: `HUGGINGFACE_SPACE_URL`

## API Endpoints

### Chat Endpoint
```
POST /api/predict
{
  "data": [
    [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}],
    0.1,  // temperature
    2000  // max_tokens
  ],
  "fn_index": 0
}
```

### Embedding Endpoint
```
POST /api/predict
{
  "data": ["your text here"],
  "fn_index": 1
}
```

## Usage

This Space is automatically used by the CommuMed Vercel deployment. The Space URL should be set in the Vercel environment variable `HUGGINGFACE_SPACE_URL`.

## Environment Variables

- `CHAT_MODEL`: Chat model (default: `meta-llama/Llama-3.2-3B-Instruct`)
- `EMBEDDING_MODEL`: Embedding model (default: `sentence-transformers/all-MiniLM-L6-v2`)

## Notes

- First request may take 30-60 seconds (model loading)
- Free tier CPU is slower but works fine
- Upgrade to GPU for faster responses
