# Upload Embeddings to GitHub Release

This guide shows you how to upload your embeddings.json file to a GitHub release and get a direct download URL.

## Step 1: Prepare the File

Make sure your embeddings file exists:
```powershell
# Check if file exists
Test-Path "D:\Work\Projects\Personal\CommuMed\data\embeddings.json"
```

## Step 2: Create a GitHub Release

### Method 1: Via GitHub Web Interface (Easiest)

1. **Go to your GitHub repository:**
   - Open your repo in a browser
   - Example: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. **Create a new release:**
   - Click on **"Releases"** (right sidebar, or go to `/releases`)
   - Click **"Create a new release"** or **"Draft a new release"**

3. **Fill in release details:**
   - **Tag version:** `v1.0.0` (or any version like `v1.0`, `embeddings-v1`)
   - **Release title:** `Embeddings Release` (or any title)
   - **Description:** `Medical textbook embeddings for CommuMed` (optional)
   - **Target:** Select your main branch (usually `main` or `master`)

4. **Upload the file:**
   - Scroll down to **"Attach binaries"** section
   - Drag and drop `data/embeddings.json` OR click **"Choose your files"**
   - Select: `D:\Work\Projects\Personal\CommuMed\data\embeddings.json`
   - Wait for upload to complete (may take a few minutes for 181 MB)

5. **Publish the release:**
   - Click **"Publish release"** (or "Publish release" if draft)

6. **Get the download URL:**
   - After publishing, click on the uploaded `embeddings.json` file
   - Right-click → **"Copy link address"**
   - The URL will look like:
     ```
     https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/embeddings.json
     ```

### Method 2: Via GitHub CLI (If you have it installed)

```powershell
# Install GitHub CLI if needed
# winget install GitHub.cli

# Authenticate (one time)
gh auth login

# Create release and upload file
cd D:\Work\Projects\Personal\CommuMed
gh release create v1.0.0 data/embeddings.json --title "Embeddings Release" --notes "Medical textbook embeddings"
```

## Step 3: Use the URL in Vercel

Copy the direct download URL and add it to your Vercel environment variables:

```
EMBEDDINGS_URL=https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/embeddings.json
```

## Important Notes

- ✅ **Free**: GitHub Releases are free
- ✅ **No size limit**: Can upload large files
- ✅ **Direct download**: URLs work for direct downloads
- ⚠️ **Public repo**: File will be public if repo is public
- ⚠️ **Private repo**: If repo is private, you'll need a GitHub token for access

## If Your Repo is Private

If your repository is private, you have two options:

1. **Make the release public** (recommended):
   - The release itself can be public even if the repo is private
   - Check "Public release" when creating

2. **Use a GitHub token** (advanced):
   - Create a GitHub Personal Access Token
   - Use it in the URL: `https://TOKEN@github.com/...`

## Troubleshooting

### "File too large"
- GitHub allows files up to 2GB, so 181 MB should be fine
- If you get this error, try uploading again or use Git LFS

### "Upload failed"
- Check your internet connection
- Try uploading in smaller chunks (not applicable for single file)
- Use GitHub CLI as alternative

### "Can't find download URL"
- Make sure the release is published (not draft)
- Right-click the file in the release
- Copy the direct download link (not the page URL)

