import Fuse from 'fuse.js';
import { TextChunk } from './pdfParser';

export interface SearchResult {
  text: string;
  page: number;
  index: number;
  score?: number;
  highlights?: string[];
}

export class SearchEngine {
  private fuse: Fuse<TextChunk> | null = null;
  private chunks: TextChunk[] = [];

  indexChunks(chunks: TextChunk[]) {
    this.chunks = chunks;
    this.fuse = new Fuse(chunks, {
      keys: ['text'],
      threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
      ignoreLocation: false,
      findAllMatches: true,
    });
  }

  search(query: string, limit: number = 50): SearchResult[] {
    if (!this.fuse || this.chunks.length === 0) {
      return [];
    }

    const results = this.fuse.search(query, { limit });
    
    return results.map((result) => {
      const item = result.item;
      const matches = result.matches || [];
      
      // Extract highlighted terms
      const highlights = matches
        .flatMap(m => m.indices || [])
        .map(([start, end]) => item.text.substring(start, end + 1))
        .filter((h, i, arr) => arr.indexOf(h) === i); // Remove duplicates

      return {
        text: item.text,
        page: item.page,
        index: item.index,
        score: result.score,
        highlights,
      };
    });
  }

  // Enhanced search that looks for disease names and symptoms
  searchDisease(query: string, limit: number = 50): SearchResult[] {
    if (!this.fuse) {
      return [];
    }

    // Normalize query - split into terms
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2);

    // Search for each term and combine results
    const allResults = new Map<number, SearchResult>();
    
    queryTerms.forEach(term => {
      const termResults = this.fuse!.search(term, { limit: limit * 2 });
      
      termResults.forEach((result) => {
        const item = result.item;
        const existing = allResults.get(item.index);
        
        if (!existing || (result.score && result.score < (existing.score || 1))) {
          const matches = result.matches || [];
          const highlights = matches
            .flatMap(m => m.indices || [])
            .map(([start, end]) => item.text.substring(start, end + 1))
            .filter((h, i, arr) => arr.indexOf(h) === i);

          allResults.set(item.index, {
            text: item.text,
            page: item.page,
            index: item.index,
            score: result.score,
            highlights,
          });
        }
      });
    });

    // Sort by score and return top results
    return Array.from(allResults.values())
      .sort((a, b) => (a.score || 1) - (b.score || 1))
      .slice(0, limit);
  }

  getChunkCount(): number {
    return this.chunks.length;
  }
}

