'use client';

import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="h-full flex flex-col container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex-shrink-0 text-center mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            CommuMed
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium px-2">
            Medical Information Assistant • Powered by Vector Embeddings & RAG
          </p>
        </div>

        <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
