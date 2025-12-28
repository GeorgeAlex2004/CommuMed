# Embedding Model Switch

## Issue

The router endpoint doesn't support sentence-transformers models (they need `sentences` parameter, but router requires `inputs`).

## Solution Applied

Switched to `intfloat/e5-small-v2` - a feature extraction model that works with the router endpoint.

## ⚠️ IMPORTANT: Regenerate Embeddings

Your existing embeddings were generated with `sentence-transformers/all-MiniLM-L6-v2`. The new model (`e5-small-v2`) produces different embeddings, so you **must regenerate** your embeddings.

### Option 1: Regenerate Embeddings (Recommended)

1. **Set environment variable:**
   ```
   HUGGINGFACE_EMBEDDING_MODEL=intfloat/e5-small-v2
   ```

2. **Regenerate embeddings:**
   ```bash
   npm run generate-embeddings-from-text
   ```

3. **Upload new embeddings to GitHub Releases**

### Option 2: Use Space API (Alternative)

If you want to keep using `sentence-transformers/all-MiniLM-L6-v2`:

1. **Fix Space API** - The Space should work with sentence-transformers models
2. **Set environment variable:**
   ```
   HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   ```
3. **Keep existing embeddings**

## Model Comparison

| Model | Dimensions | Router Compatible | Quality |
|-------|------------|-------------------|---------|
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | ❌ No | Good |
| `intfloat/e5-small-v2` | 384 | ✅ Yes | Good |
| `intfloat/e5-base-v2` | 768 | ✅ Yes | Better |

## Next Steps

1. **Regenerate embeddings** with the new model
2. **Update Vercel** environment variable (optional, new model is default)
3. **Test your app**

The app should work now! 🎉

