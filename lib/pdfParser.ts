import pdfParse from 'pdf-parse';

export interface TextChunk {
  text: string;
  page: number;
  index: number;
}

export async function parsePDF(buffer: Buffer): Promise<TextChunk[]> {
  try {
    const data = await pdfParse(buffer, {
      max: 0, // No limit on pages
    });
    
    const chunks: TextChunk[] = [];
    const fullText = data.text;
    const numPages = data.numpages || 1;
    
    console.log(`PDF Info: ${numPages} pages, ${fullText.length} characters`);
    
    // Try multiple methods to split pages
    let pages: string[] = [];
    
    // Method 1: Split by form feed characters
    if (fullText.includes('\f')) {
      pages = fullText.split(/\f/).filter(p => p.trim().length > 0);
      console.log(`Method 1: Split by form feed - ${pages.length} pages`);
    }
    // Method 2: Use page info and estimate page boundaries
    else if (numPages > 1) {
      // Estimate page size
      const estimatedPageSize = Math.ceil(fullText.length / numPages);
      console.log(`Method 2: Using page count - estimated ${estimatedPageSize} chars per page`);
      
      // Try to find natural break points (paragraphs, headings)
      const paragraphBreaks = fullText.split(/\n\s*\n/);
      const breaksPerPage = Math.ceil(paragraphBreaks.length / numPages);
      
      let currentPage = '';
      let pageNum = 1;
      
      paragraphBreaks.forEach((para, idx) => {
        currentPage += (currentPage ? '\n\n' : '') + para;
        
        // If we've accumulated enough paragraphs for a page, or reached end
        if ((idx + 1) % breaksPerPage === 0 || idx === paragraphBreaks.length - 1) {
          if (currentPage.trim().length > 0) {
            pages.push(currentPage);
            currentPage = '';
            pageNum++;
          }
        }
      });
      
      // If we didn't get enough pages, fall back to fixed size
      if (pages.length < numPages * 0.8) {
        pages = [];
        for (let i = 0; i < numPages; i++) {
          const start = i * estimatedPageSize;
          const end = (i + 1) * estimatedPageSize;
          pages.push(fullText.substring(start, end));
        }
      }
      
      console.log(`Created ${pages.length} page segments`);
    }
    // Method 3: Split into fixed-size chunks based on estimated pages
    else {
      // Assume ~2000 characters per page for medical textbooks
      const charsPerPage = 2000;
      const estimatedPages = Math.ceil(fullText.length / charsPerPage);
      console.log(`Method 3: Fixed size - estimating ${estimatedPages} pages`);
      
      for (let i = 0; i < fullText.length; i += charsPerPage) {
        pages.push(fullText.substring(i, i + charsPerPage));
      }
    }
    
    // Check if PDF has very little text (likely image-based/scanned)
    if (fullText.length < numPages * 10) {
      console.warn(`⚠️  Warning: PDF appears to be image-based (only ${fullText.length} chars for ${numPages} pages)`);
      console.warn('   pdf-parse cannot extract text from scanned images. You may need OCR.');
      console.warn('   Attempting to extract whatever text is available...');
    }
    
    // Process each page into chunks
    pages.forEach((pageText: string, pageIndex: number) => {
      if (!pageText || pageText.trim().length === 0) {
        return;
      }
      
      // For sparse text, use smaller minimum chunk size
      const minChunkSize = fullText.length < numPages * 10 ? 10 : 100;
      const targetChunkSize = 400;
      const maxChunkSize = 800;
      
      // For very sparse text, just use the page text as-is
      if (pageText.trim().length < 50) {
        if (pageText.trim().length >= minChunkSize) {
          chunks.push({
            text: pageText.trim(),
            page: pageIndex + 1,
            index: chunks.length,
          });
        }
        return;
      }
      
      // Split by paragraphs first
      const paragraphs = pageText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      
      // If no paragraphs found, try splitting by single newlines
      const textParts = paragraphs.length > 0 ? paragraphs : pageText.split(/\n/).filter(p => p.trim().length > 0);
      
      let currentChunk = '';
      
      textParts.forEach((textPart) => {
        const trimmedPart = textPart.trim();
        
        // If part alone is too large, split it by sentences
        if (trimmedPart.length > maxChunkSize) {
          // Save current chunk if it exists
          if (currentChunk.trim().length >= minChunkSize) {
            chunks.push({
              text: currentChunk.trim(),
              page: pageIndex + 1,
              index: chunks.length,
            });
            currentChunk = '';
          }
          
          // Split large part by sentences
          const sentences = trimmedPart
            .split(/(?<=[.!?])\s+/)
            .filter(s => s.trim().length > 10);
          
          if (sentences.length === 0) {
            // No sentences found, split by words
            const words = trimmedPart.split(/\s+/);
            const wordsPerChunk = Math.ceil(maxChunkSize / 10); // Rough estimate
            
            for (let i = 0; i < words.length; i += wordsPerChunk) {
              const wordChunk = words.slice(i, i + wordsPerChunk).join(' ');
              if (wordChunk.trim().length >= minChunkSize) {
                chunks.push({
                  text: wordChunk.trim(),
                  page: pageIndex + 1,
                  index: chunks.length,
                });
              }
            }
            return;
          }
          
          sentences.forEach((sentence) => {
            if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length >= minChunkSize) {
              chunks.push({
                text: currentChunk.trim(),
                page: pageIndex + 1,
                index: chunks.length,
              });
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          });
        }
        // If adding part would exceed max size, save current chunk
        else if (currentChunk.length + trimmedPart.length > maxChunkSize && currentChunk.length >= minChunkSize) {
          chunks.push({
            text: currentChunk.trim(),
            page: pageIndex + 1,
            index: chunks.length,
          });
          currentChunk = trimmedPart;
        }
        // Add part to current chunk
        else {
          currentChunk += (currentChunk ? (paragraphs.length > 0 ? '\n\n' : ' ') : '') + trimmedPart;
        }
      });
      
      // Save remaining chunk from this page
      if (currentChunk.trim().length >= minChunkSize) {
        chunks.push({
          text: currentChunk.trim(),
          page: pageIndex + 1,
          index: chunks.length,
        });
      }
    });
    
    console.log(`Parsed PDF: ${numPages} pages, created ${chunks.length} chunks (avg ${Math.round(fullText.length / chunks.length)} chars per chunk)`);
    
    return chunks;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

