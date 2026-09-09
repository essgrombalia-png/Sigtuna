import React, { useState, useEffect } from 'react';
import { Quote, Shuffle } from 'lucide-react';
import { MORNING_QUOTES, MorningQuote } from '../data/morningQuotes';

export const MorningQuoteBanner: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<MorningQuote>(() => {
    // Pick a deterministic quote based on day or random
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return MORNING_QUOTES[dayOfYear % MORNING_QUOTES.length];
  });
  const [isChanging, setIsChanging] = useState(false);

  const getRandomQuote = () => {
    setIsChanging(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * MORNING_QUOTES.length);
      if (MORNING_QUOTES[nextIndex].id === currentQuote.id) {
        nextIndex = (nextIndex + 1) % MORNING_QUOTES.length;
      }
      setCurrentQuote(MORNING_QUOTES[nextIndex]);
      setIsChanging(false);
    }, 150);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <div className="flex items-center justify-between gap-3 px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-blue-500/10 via-amber-400/15 to-blue-600/10 dark:from-blue-500/20 dark:via-amber-400/15 dark:to-blue-600/20 border border-blue-200/60 dark:border-blue-800/50 backdrop-blur-sm shadow-xs transition-all">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="p-1 rounded-lg bg-blue-600/15 text-blue-700 dark:text-amber-300 shrink-0">
            <Quote className="w-3.5 h-3.5" />
          </span>
          <p
            className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic truncate font-medium transition-opacity duration-150 ${
              isChanging ? 'opacity-0' : 'opacity-100'
            }`}
            title={`"${currentQuote.quote}"`}
          >
            "{currentQuote.quote}"
          </p>
        </div>

        <button
          onClick={getRandomQuote}
          title="Slumpa ett nytt morgoncitat"
          aria-label="Slumpa ett nytt morgoncitat"
          className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-blue-500/15 transition-all active:rotate-180"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
