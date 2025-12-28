# Workflow: Processing PDF Chunks as Text

## Overview

Your 259MB PDF will be split into **~9 chunks** of ~121 pages each (~30MB per chunk).

## Step-by-Step Process

### Step 1: Split the PDF

1. Go to: **https://www.ilovepdf.com/split-pdf**
2. Upload: `Park Textbook of Preventive and Social Medicine.pdf`
3. Choose: **"Split by range"**
4. Split into **9 chunks**:
   - Chunk 1: Pages 1-121
   - Chunk 2: Pages 122-242
   - Chunk 3: Pages 243-363
   - Chunk 4: Pages 364-484
   - Chunk 5: Pages 485-605
   - Chunk 6: Pages 606-726
   - Chunk 7: Pages 727-847
   - Chunk 8: Pages 848-968
   - Chunk 9: Pages 969-1052
5. Download all 9 chunks

### Step 2: OCR Each Chunk

For each chunk:

1. Go to: **https://www.ilovepdf.com/ocr-pdf**
2. Upload one chunk
3. Select language: **English**
4. Click **"OCR PDF"**
5. Wait for processing (2-5 minutes)
6. Download the OCR'd PDF

### Step 3: Extract Text from OCR'd PDF

For each OCR'd PDF:

1. Open the OCR'd PDF
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. The text is now in your clipboard

### Step 4: Send Text to Me

**Option A: Send text directly in chat**
- Just paste the text and tell me which chunk number it is
- I'll process it immediately

**Option B: Save as text file**
- Paste into a `.txt` file
- Name it: `chunk-1.txt`, `chunk-2.txt`, etc.
- Send me the file path

### Step 5: I'll Process Each Chunk

When you send me text, I'll run:
```bash
npm run add-text-chunk -- "chunk-1" "your pasted text here" --start-page 1
```

Or if you saved as file:
```bash
npm run add-text-chunk -- "chunk-1" --file "chunk-1.txt" --start-page 1
```

## Chunk Reference

| Chunk | Pages | Start Page | Expected Size |
|-------|-------|------------|---------------|
| 1 | 1-121 | 1 | ~30MB |
| 2 | 122-242 | 122 | ~30MB |
| 3 | 243-363 | 243 | ~30MB |
| 4 | 364-484 | 364 | ~30MB |
| 5 | 485-605 | 485 | ~30MB |
| 6 | 606-726 | 606 | ~30MB |
| 7 | 727-847 | 727 | ~30MB |
| 8 | 848-968 | 848 | ~30MB |
| 9 | 969-1052 | 969 | ~28MB |

## What Happens When You Send Text

1. I'll split your text into optimal chunks (400-800 chars each)
2. Generate vector embeddings for each chunk
3. Add to the existing embeddings database
4. Update `data/embeddings.json`

## Tips

- **Start with Chunk 1** - I'll process it and verify it works
- **Include chunk number** when sending text
- **Check text quality** - Make sure OCR captured text correctly
- **If text is garbled** - Try OCR again with different settings

## After All Chunks Are Processed

Once all 9 chunks are added:
1. You'll have a complete embeddings database
2. Run: `npm run dev`
3. Start asking questions!

## Quick Commands Reference

```bash
# Add text chunk (direct text)
npm run add-text-chunk -- "chunk-1" "your text here" --start-page 1

# Add text chunk (from file)
npm run add-text-chunk -- "chunk-1" --file "chunk-1.txt" --start-page 1

# Check current embeddings
# (I'll check for you)
```

## Ready to Start?

1. **Split your PDF** into 9 chunks
2. **OCR the first chunk**
3. **Copy the text** and send it to me with "This is chunk 1, pages 1-121"
4. I'll process it and confirm it worked
5. Continue with remaining chunks!

