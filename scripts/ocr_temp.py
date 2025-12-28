
# -*- coding: utf-8 -*-
import sys
import io
from pdf2image import convert_from_path
import pytesseract
from pathlib import Path

# Set stdout to UTF-8 to handle Unicode characters and enable unbuffered output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)
else:
    # Force line buffering for real-time progress
    try:
        sys.stdout.reconfigure(line_buffering=True)
    except AttributeError:
        # Python < 3.7 doesn't have reconfigure, use flush=True in print statements
        pass

pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
poppler_path = None

def ocr_pdf(pdf_path, output_path):
    print("[INFO] Converting PDF to images...")
    try:
        # First, get page count to show progress
        from pdf2image.pdf2image import pdfinfo_from_path
        if poppler_path:
            info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path)
        else:
            info = pdfinfo_from_path(pdf_path)
        total_pages = info.get('Pages', 0)
        print(f"   PDF has {total_pages} pages")
        print("   Converting pages to images (this may take a few minutes)...")
        
        # Convert PDF pages to images (300 DPI for good quality)
        # Convert in batches to show progress
        convert_kwargs = {'dpi': 300, 'thread_count': 4}
        if poppler_path:
            convert_kwargs['poppler_path'] = poppler_path
        
        # Convert and process in small batches to avoid memory issues
        # Process each batch immediately after conversion to free memory
        batch_size = 10  # Reduced from 100 to avoid MemoryError
        all_text = []
        
        print("\n[INFO] Converting and processing pages in batches...")
        
        for start_page in range(1, total_pages + 1, batch_size):
            end_page = min(start_page + batch_size - 1, total_pages)
            batch_kwargs = convert_kwargs.copy()
            batch_kwargs['first_page'] = start_page
            batch_kwargs['last_page'] = end_page
            
            # Convert this batch
            batch_images = convert_from_path(pdf_path, **batch_kwargs)
            
            # Process OCR on this batch immediately
            for i, image in enumerate(batch_images):
                page_num = start_page + i
                print(f"   Processing page {page_num}/{total_pages}...", end='\r', flush=True)
                
                # Run OCR on image
                text = pytesseract.image_to_string(image, lang='eng')
                
                # Add page separator
                all_text.append(f"\n\n=== PAGE {page_num} ===\n\n")
                all_text.append(text)
            
            # Free memory by clearing the batch
            del batch_images
            
            # Save progress every 50 pages
            if (end_page % 50 == 0 or end_page == total_pages):
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(''.join(all_text))
                print(f"\n   [SAVED] Progress saved (page {end_page}/{total_pages})")
        
        # Save final text
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(''.join(all_text))
        
        print(f"\n[OK] OCR complete! Text saved to: {output_path}")
        print(f"   Total pages processed: {len(images)}")
        return len(images)
        
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    pdf_path = "D:/Work/Projects/Personal/CommuMed/Park Textbook of Preventive and Social Medicine.pdf"
    output_path = "D:/Work/Projects/Personal/CommuMed/data/ocr-extracted-text.txt"
    ocr_pdf(pdf_path, output_path)
