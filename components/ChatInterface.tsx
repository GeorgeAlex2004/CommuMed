'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onError: (error) => {
      setError(error.message || 'An error occurred');
    },
    onResponse: () => {
      setError(null);
    },
  });

  // Clear chat function
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 p-5 sm:p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
                <span>CommuMed Assistant</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse flex-shrink-0" />
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 truncate">
                Medical information from Park Textbook of Preventive and Social Medicine
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium border border-white/30 hover:border-white/50"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative p-5 sm:p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome to CommuMed
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-6 sm:mb-8 text-base sm:text-lg px-4">
              Ask me anything about diseases, symptoms, or medical information from your textbook.
              I'll provide answers based <strong>only</strong> on Park Textbook of Preventive and Social Medicine.
            </p>
            <div className="space-y-3 w-full max-w-2xl px-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Try asking:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'What is malaria?',
                  'Tell me about fever symptoms',
                  'What are the endemic features?',
                  'How is diabetes treated?',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleInputChange({
                        target: { value: example },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left font-medium shadow-sm hover:shadow-md"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                      <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">{message.content}</p>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6 mb-2 sm:mb-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-base sm:text-lg font-semibold mt-3 sm:mt-5 mb-2 text-gray-800 dark:text-gray-200" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic text-gray-700 dark:text-gray-300" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside my-2 sm:my-3 space-y-1 sm:space-y-2 ml-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside my-2 sm:my-3 space-y-1 sm:space-y-2 ml-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="ml-2 text-sm sm:text-base text-gray-700 dark:text-gray-300" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-2 sm:my-3 leading-relaxed text-sm sm:text-base text-gray-700 dark:text-gray-300" {...props} />
                          ),
                          hr: ({ node, ...props }) => (
                            <hr className="my-3 sm:my-4 border-gray-200 dark:border-gray-700" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-3 sm:pl-4 italic my-2 sm:my-3 text-sm sm:text-base text-gray-600 dark:text-gray-400" {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-4 sm:my-6">
                              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-blue-50 dark:bg-gray-700" {...props} />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody className="bg-white dark:bg-gray-800" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600 last:border-r-0" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg ring-2 ring-gray-200 dark:ring-gray-700">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 sm:gap-4 justify-start animate-in fade-in">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm sm:text-base">Error:</span>
              <span className="text-sm sm:text-base break-words">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Form */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about diseases, symptoms, or medical information..."
              className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 shadow-sm focus:shadow-md outline-none text-sm sm:text-base"
              disabled={isLoading}
            />
            {input && (
              <button
                type="button"
                onClick={() => handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl leading-none w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Clear input"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none min-w-[80px] sm:min-w-[120px] justify-center text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 text-center flex items-center justify-center gap-1 flex-wrap">
          <BookOpen className="w-3 h-3 flex-shrink-0" />
          <span>Responses are generated only from Park Textbook of Preventive and Social Medicine</span>
        </p>
      </div>
    </div>
  );
}
