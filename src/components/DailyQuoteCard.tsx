import React, { useState } from 'react';
import { Quote, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { MORNING_QUOTES, MorningQuote, getDailyQuote } from '../data/morningQuotes';

interface DailyQuoteCardProps {
  className?: string;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ className = '' }) => {
  const [quote, setQuote] = useState<MorningQuote>(() => getDailyQuote());
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch / cycle to a new inspirational quote
  const handleFetchNewQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFetching(true);

    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * MORNING_QUOTES.length);
      if (MORNING_QUOTES[nextIndex].id === quote.id) {
        nextIndex = (nextIndex + 1) % MORNING_QUOTES.length;
      }
      setQuote(MORNING_QUOTES[nextIndex]);
      setIsFetching(false);
    }, 180);
  };

  const handleCopyQuote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `"${quote.quote}" — ${quote.author || 'Sigtuna kommun Morgonhjulet'}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto ios-glass-card rounded-2xl p-3 sm:p-3.5 border border-blue-200/70 dark:border-blue-900/60 shadow-xs relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Background subtle light beam */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header bar of the quote card */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500 icon-realistic" />
            <span>Dagens inspirerande citat</span>
          </span>

          {quote.category && (
            <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
              {quote.category}
            </span>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyQuote}
            title="Kopiera citat"
            aria-label="Kopiera citat"
            className="ios-glass-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 icon-realistic" />
            ) : (
              <Copy className="w-3.5 h-3.5 icon-realistic" />
            )}
          </button>

          <button
            onClick={handleFetchNewQuote}
            disabled={isFetching}
            title="Hämta nytt inspirerande citat"
            aria-label="Hämta nytt inspirerande citat"
            className="ios-glass-btn flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold text-blue-700 dark:text-amber-300 group"
          >
            <RefreshCw
              className={`w-3 h-3 icon-realistic transition-transform duration-300 ${
                isFetching ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span className="hidden sm:inline">Nytt citat</span>
          </button>
        </div>
      </div>

      {/* Main Quote Text */}
      <div className="flex items-start gap-2.5 pt-0.5">
        <span className="w-6 h-6 rounded-full icon-badge-glass text-blue-700 dark:text-amber-300 shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
          <Quote className="w-3.5 h-3.5 icon-realistic" />
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium italic leading-relaxed transition-opacity duration-200 text-left ${
              isFetching ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
            }`}
          >
            "{quote.quote}"
          </p>
          {quote.author && (
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 text-right">
              — {quote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
