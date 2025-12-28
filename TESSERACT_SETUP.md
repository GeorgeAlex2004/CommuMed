# Tesseract OCR Setup Guide

## Complete Setup for OCR Processing

### Step 1: Install Tesseract OCR

**Windows:**
1. Download installer: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. **Important:** During installation, check "Add to PATH"
4. Default installation path: `C:\Program Files\Tesseract-OCR`

**Verify Installation:**
```powershell
tesseract --version
```

### Step 2: Install Python (if not already installed)

1. Download: https://www.python.org/downloads/
2. During installation, **check "Add Python to PATH"**
3. Verify:
```powershell
python --version
```

### Step 3: Install Python Packages

```powershell
pip install pdf2image pytesseract pillow
```

**Note:** You may also need **Poppler** for PDF to image conversion:

**Windows Poppler:**
1. Download: https://github.com/oschwartz10612/poppler-windows/releases
2. Extract to a folder (e.g., `C:\poppler`)
3. Add `C:\poppler\Library\bin` to your PATH environment variable
4. Or set environment variable:
   ```powershell
   $env:PATH += ";C:\poppler\Library\bin"
   ```

### Step 4: Run OCR on Your PDF

```powershell
npm run ocr-full-pdf -- "D:\Work\Projects\Personal\CommuMed\Park Textbook of Preventive and Social Medicine.pdf"
```

**What happens:**
1. Converts PDF pages to images (300 DPI)
2. Runs Tesseract OCR on each page
3. Saves all text to `data/ocr-extracted-text.txt`
4. Progress saved every 50 pages

**Time Estimate:**
- 1052 pages × ~10-15 seconds per page = **3-4 hours**
- Progress is saved every 50 pages, so you can resume if interrupted

### Step 5: Generate Embeddings from Text

Once OCR is complete:

```powershell
npm run generate-embeddings-from-text -- "data/ocr-extracted-text.txt"
```

This will:
1. Parse the text file
2. Split into optimal chunks
3. Generate vector embeddings
4. Save to `data/embeddings.json`

## Troubleshooting

### "Tesseract not found"
- Make sure Tesseract is in PATH
- Restart terminal after installation
- Try: `tesseract --version` to verify

### "Python not found"
- Install Python and add to PATH
- Restart terminal
- Try: `python --version`

### "pdf2image not found"
- Run: `pip install pdf2image pytesseract pillow`
- If error about poppler, install poppler (see Step 3)

### "Poppler error"
- Download poppler from GitHub
- Add to PATH or set environment variable
- Restart terminal

### OCR is very slow
- This is normal for 1052 pages
- Each page takes 10-15 seconds
- Total time: 3-4 hours
- Progress is saved every 50 pages

### Low OCR quality
- Ensure PDF images are clear
- Try increasing DPI (modify script: change `dpi=300` to `dpi=400`)
- Check if PDF pages are rotated (may need preprocessing)

## Alternative: Use Online OCR

If Tesseract setup is too complex, use online OCR:
1. Go to: https://www.ilovepdf.com/ocr-pdf
2. Upload PDF (may need to split if too large)
3. Download OCR'd PDF
4. Extract text manually or use a different method

## After OCR Complete

Once you have `data/ocr-extracted-text.txt`:
1. Verify file exists and has content
2. Run: `npm run generate-embeddings-from-text`
3. Wait for embeddings to generate
4. Start using the application!

