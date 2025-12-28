# Cloning Your Hugging Face Space

## Step 1: Generate Access Token

1. **Go to:** https://huggingface.co/settings/tokens
2. **Click:** "New token"
3. **Configure:**
   - **Name:** `commumed-space` (or any name)
   - **Type:** **Write** (needed for pushing files)
4. **Click:** "Generate token"
5. **Copy the token** (starts with `hf_`) - you won't see it again!

## Step 2: Clone Using Token

### Windows PowerShell:
```powershell
# Replace YOUR_TOKEN with your actual token
git clone https://YOUR_TOKEN@huggingface.co/spaces/unwonted-uplift/commumed-llm
```

### Mac/Linux:
```bash
# Replace YOUR_TOKEN with your actual token
git clone https://YOUR_TOKEN@huggingface.co/spaces/unwonted-uplift/commumed-llm
```

### Alternative: Use Git Credential Helper

You can also set up the token once:

**Windows:**
```powershell
# Set credential helper
git config --global credential.helper wincred

# Then clone (it will prompt for username and password)
# Username: your_huggingface_username
# Password: YOUR_TOKEN (the hf_ token, not your actual password)
git clone https://huggingface.co/spaces/unwonted-uplift/commumed-llm
```

**Mac/Linux:**
```bash
# Set credential helper
git config --global credential.helper store

# Then clone (it will prompt for username and password)
# Username: your_huggingface_username
# Password: YOUR_TOKEN (the hf_ token, not your actual password)
git clone https://huggingface.co/spaces/unwonted-uplift/commumed-llm
```

## Step 3: Upload Your Files

After cloning, navigate to the directory and copy your files:

```bash
cd commumed-llm

# Copy files from your CommuMed project
# Adjust the path to your CommuMed project location
cp -r D:/Work/Projects/Personal/CommuMed/hf-space/* .

# Or on Windows PowerShell:
Copy-Item -Path "D:\Work\Projects\Personal\CommuMed\hf-space\*" -Destination . -Recurse
```

## Step 4: Commit and Push

```bash
git add .
git commit -m "Add CommuMed LLM API files"
git push
```

The Space will automatically rebuild and deploy!

## Troubleshooting

### "Authentication failed"
- Make sure your token has **Write** permissions
- Check token hasn't expired
- Try regenerating the token

### "Permission denied"
- Verify the token starts with `hf_`
- Make sure you're using the token as the password, not your HF account password
- Check the token has write permissions

### "Repository not found"
- Verify the Space URL is correct
- Make sure the Space exists and you have access to it

