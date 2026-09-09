import React, { useState, useMemo, useEffect } from 'react';
import { SpinRecord } from '../types';
import { Flame, History, Heart, CheckCircle2, Circle, Trash2, Calendar, Sparkles, X } from 'lucide-react';

interface HistoryAndFavoritesProps {
  history: SpinRecord[];
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onClose?: () => void;
}

export const HistoryAndFavorites: React.FC<HistoryAndFavoritesProps> = ({
  history,
  onToggleComplete,
  onToggleFavorite,
  onClearHistory,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate streak count (consecutive days with at least one spin)
  const streakDays = useMemo(() => {
    if (history.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(
        history.map((item) => new Date(item.timestamp).toDateString())
      )
    );

    return uniqueDates.length;
  }, [history]);

  const favorites = useMemo(() => {
    return history.filter((item) => item.isFavorite);
  }, [history]);

  const displayList = activeTab === 'history' ? history : favorites;

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all">
      
      {/* Streak & Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <span>Dina Resultat & Minnen</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Följ din morgonrutin och se alla sparade budskap
          </p>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 w-fit">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
          <div className="text-left">
            <div className="text-xs font-extrabold leading-none">{streakDays} Dagars Svit!</div>
            <div className="text-[10px] text-amber-700/80 dark:text-amber-400 font-medium mt-0.5">
              Positiva morgnar
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historik ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'favorites'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favoriter ({favorites.length})</span>
          </button>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition-colors shadow-2xs active:scale-95"
            title="Rensa hela historiken"
            aria-label="Rensa hela historiken"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Rensa historik</span>
          </button>
        )}
      </div>

      {/* List Content */}
      {displayList.length === 0 ? (
        <div className="py-10 text-center text-slate-400 dark:text-slate-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">
            {activeTab === 'history'
              ? 'Inga tidigare snurr ännu. Snurra hjulet för att börja!'
              : 'Inga sparade favoriter. Klicka på hjärtat vid ditt favoritbudskap!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {displayList.map((record) => {
            const dateStr = new Date(record.timestamp).toLocaleDateString('sv-SE', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-start justify-between gap-3 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleComplete(record.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    title={record.completed ? 'Genomförd' : 'Markera som klar'}
                  >
                    {record.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {record.presetTitle}
                      </span>
                      <span className="text-[11px] text-slate-400">· {dateStr}</span>
                    </div>
                    <div className={`text-sm font-bold mt-0.5 ${record.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {record.itemText}
                    </div>
                    {record.itemSubtext && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {record.itemSubtext}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(record.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    record.isFavorite
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                  }`}
                  title={record.isFavorite ? 'Ta bort från favoriter' : 'Spara som favorit'}
                >
                  <Heart className={`w-4 h-4 ${record.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Close Button */}
      {onClose && (
        <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            Stäng
          </button>
        </div>
      )}

    </div>
  );
};
