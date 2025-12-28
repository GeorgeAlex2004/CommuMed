# Troubleshooting 500 Error in Chat API

## Step 1: Check Vercel Logs

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Deployments** → Click on the latest deployment
4. Click **"Functions"** tab
5. Click on `/api/chat` function
6. Check the **"Logs"** tab

Look for error messages like:
- "Cannot connect to Hugging Face"
- "Embeddings not found"
- "Environment variable missing"
- Any stack traces

## Step 2: Verify Environment Variables

Go to **Settings → Environment Variables** and verify these are set:

```
LLM_PROVIDER = huggingface
HUGGINGFACE_SPACE_URL = https://unwonted-uplift-commumed-llm.hf.space
EMBEDDINGS_URL = https://github.com/GeorgeAlex2004/CommuMed/releases/download/v1.0.0/embeddings.json
```

**Important:** After adding/changing environment variables, you MUST redeploy!

## Step 3: Test Hugging Face Space

Test if your Space is accessible:

```bash
# Test Space API
curl https://unwonted-uplift-commumed-llm.hf.space/api/predict -X POST -H "Content-Type: application/json" -d '{"data": ["test"], "fn_index": 1}'
```

Or visit: https://unwonted-uplift-commumed-llm.hf.space

If it shows "Model is loading", wait 30-60 seconds and try again.

## Step 4: Test Embeddings URL

Test if embeddings are accessible:

```bash
# Test embeddings URL
curl -I https://github.com/GeorgeAlex2004/CommuMed/releases/download/v1.0.0/embeddings.json
```

Should return `200 OK`. If it returns `404`, the release might not be public or the URL is wrong.

## Step 5: Common Issues

### Issue: "Cannot connect to Hugging Face Space"
**Solution:**
- Check Space URL is correct
- Make sure Space is running (not sleeping)
- First request may take 30-60 seconds (model loading)

### Issue: "Embeddings not found"
**Solution:**
- Verify `EMBEDDINGS_URL` is correct
- Test the URL in browser - should download JSON
- Make sure release is published (not draft)

### Issue: "Environment variable missing"
**Solution:**
- Add all three environment variables
- **Redeploy** after adding variables
- Check for typos in variable names

### Issue: "Function timeout"
**Solution:**
- Vercel free tier has 10s timeout
- First request to Space takes 30-60s (model loading)
- Consider upgrading to Pro for longer timeouts
- Or wait for model to load, then try again

## Step 6: Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for specific error messages
- Check Network tab for failed requests
- See the actual error response

## Quick Fix Checklist

- [ ] All 3 environment variables set in Vercel
- [ ] Redeployed after setting variables
- [ ] Hugging Face Space is running
- [ ] Embeddings URL is accessible
- [ ] Checked Vercel function logs
- [ ] No typos in environment variable names

