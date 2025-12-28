# PDF Text Extraction Issues

## Problem: Image-Based PDFs

Your PDF appears to be **image-based** (scanned pages) rather than text-based. This means:
- `pdf-parse` can only extract minimal text (~2 characters per page)
- No meaningful chunks can be created for embeddings
- The system cannot search the content

## Solutions

### Option 1: Use a Text-Based PDF (Recommended)

Get a PDF version that has **selectable text**:
- Download from the original source
- Use a PDF with actual text, not scanned images

### Option 2: Use OCR (Optical Character Recognition)

Convert the scanned PDF to text using OCR. Here are detailed steps for different methods:

#### Method A: Online OCR Services (Easiest - No Installation)

**Recommended Services:**
1. **ILovePDF OCR** (Free, up to 50 pages per file)
   - Go to: https://www.ilovepdf.com/ocr-pdf
   - Upload your PDF
   - Click "OCR PDF"
   - Download the converted PDF with selectable text

2. **SmallPDF OCR** (Free, up to 50 pages)
   - Go to: https://smallpdf.com/ocr-pdf
   - Upload your PDF
   - Wait for processing
   - Download the text-based PDF

3. **Adobe Acrobat Online** (Free, limited pages)
   - Go to: https://www.adobe.com/acrobat/online/ocr-pdf.html
   - Upload and convert

**Note:** For 1052 pages, you may need to:
- Split PDF into smaller chunks (50-100 pages each)
- Process each chunk separately
- Merge the results

#### Method B: Adobe Acrobat Pro (If You Have It)

1. Open Adobe Acrobat Pro (not Reader)
2. Open your PDF file
3. Go to **Tools** → **Enhance Scans** → **Recognize Text** → **In This File**
4. Select language (English)
5. Click **Recognize Text**
6. Wait for processing (may take 30-60 minutes for 1052 pages)
7. Save the file (File → Save As)
8. The new PDF will have selectable text

#### Method C: Tesseract OCR (Free, Command Line)

**Installation:**
1. Download Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
2. Install on Windows
3. Install Python package: `pip install pytesseract pdf2image pillow`

**Usage Script:**
```python
# ocr_pdf.py
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import PyPDF2

def ocr_pdf(input_pdf, output_pdf):
    # Convert PDF pages to images
    images = convert_from_path(input_pdf, dpi=300)
    
    # OCR each page
    text_pages = []
    for i, image in enumerate(images):
        print(f"Processing page {i+1}/{len(images)}...")
        text = pytesseract.image_to_string(image, lang='eng')
        text_pages.append(text)
    
    # Create new PDF with text (requires additional library)
    # Or save as text file and convert to PDF
    return text_pages
```

#### Method D: Python Script with OCR (Recommended for Large PDFs)

I can create a script that:
1. Converts PDF pages to images
2. Runs OCR on each page
3. Creates a new text-based PDF

Would you like me to create this script?

#### Quick Test: Verify Your PDF Type

Before OCR, verify it's actually scanned:
1. Open PDF in any viewer
2. Try to **select text** with your mouse
3. If you **CAN select text** → PDF is text-based (different issue)
4. If you **CANNOT select text** → PDF is image-based (needs OCR)

#### After OCR Conversion

Once you have a text-based PDF:
1. Verify you can select text in the new PDF
2. Run: `npm run generate-embeddings -- "path/to/ocr-converted.pdf"`
3. The script should extract thousands of chunks instead of 0

### Option 3: Manual Text Extraction

If the PDF is small or critical:
1. Copy text manually from PDF viewer
2. Save as `.txt` file
3. Modify the script to process `.txt` files instead

## Checking Your PDF

To check if your PDF has extractable text:
1. Open in a PDF viewer
2. Try to select and copy text
3. If you can't select text → It's image-based (scanned)
4. If you can select text → It's text-based (should work)

## Current Status

- **PDF Pages**: 1052
- **Extracted Characters**: ~2185 (only ~2 chars per page)
- **Status**: ❌ Insufficient text for embeddings

## Next Steps

1. **Get a text-based PDF** of the Park Textbook
2. **Or use OCR** to convert the scanned PDF
3. **Then run** `npm run generate-embeddings` again

