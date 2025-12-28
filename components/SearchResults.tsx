'use client';

import { FileText, BookOpen } from 'lucide-react';

interface SearchResultsProps {
  results: any[];
  groupedResults: Record<number, any[]>;
  query: string;
}

export default function SearchResults({ results, groupedResults, query }: SearchResultsProps) {
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    });

    const parts = highlightedText.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 px-1 rounded"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }
      return part;
    });
  };

  const pages = Object.keys(groupedResults)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Search Results
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {pages.map((page) => (
          <div
            key={page}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-semibold">
              <FileText className="w-5 h-5" />
              <span>Page {page}</span>
            </div>

            <div className="space-y-4">
              {groupedResults[page].map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {highlightText(result.text, query)}
                  </p>
                  {result.highlights && result.highlights.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.highlights.slice(0, 5).map((highlight: string, hIndex: number) => (
                        <span
                          key={hIndex}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          Search Summary
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Found {results.length} relevant text segments</li>
          <li>• Results span across {pages.length} page{pages.length !== 1 ? 's' : ''}</li>
          <li>• All results are exact text from your uploaded document</li>
        </ul>
      </div>
    </div>
  );
}

