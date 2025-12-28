'use client';

import { useState } from 'react';
import { Search, Loader2, RefreshCw, Upload } from 'lucide-react';
import SearchResults from './SearchResults';
import { useRouter } from 'next/navigation';

export default function SearchInterface() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [groupedResults, setGroupedResults] = useState<Record<number, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      setGroupedResults(data.groupedResults || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setGroupedResults({});
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResults([]);
    setGroupedResults({});
    setError(null);
  };

  const handleReupload = () => {
    if (confirm('Upload a new PDF? This will replace the current one.')) {
      router.refresh();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search Medical Textbook
          </h2>
          <button
            onClick={handleReupload}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload New PDF
          </button>
        </div>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter disease name or symptoms (e.g., 'malaria', 'fever headache', 'endemic features')"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isSearching}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <SearchResults results={results} groupedResults={groupedResults} query={query} />
      )}

      {!isSearching && results.length === 0 && query && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No results found. Try different keywords or check your spelling.
          </p>
        </div>
      )}
    </div>
  );
}

