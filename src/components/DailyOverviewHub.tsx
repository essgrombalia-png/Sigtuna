import React, { useState, useMemo } from 'react';
import { Quote, Shuffle, Gauge, Zap, Calendar, ChevronRight } from 'lucide-react';
import { MORNING_QUOTES, MorningQuote } from '../data/morningQuotes';
import { SpinRecord } from '../types';

interface DailyOverviewHubProps {
  history: SpinRecord[];
  onOpenHistory?: () => void;
}

export const DailyOverviewHub: React.FC<DailyOverviewHubProps> = ({
  history,
  onOpenHistory,
}) => {
  // Morning Quote state
  const [currentQuote, setCurrentQuote] = useState<MorningQuote>(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return MORNING_QUOTES[dayOfYear % MORNING_QUOTES.length];
  });
  const [isChanging, setIsChanging] = useState(false);

  const getRandomQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Compute spins for today and this week
  const stats = useMemo(() => {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const startOfToday = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0).getTime();
    const endOfToday = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).getTime();

    const currentDayOfWeek = now.getDay();
    const mondayOffset = (currentDayOfWeek + 6) % 7;
    const startOfWeek = new Date(todayYear, todayMonth, todayDate - mondayOffset, 0, 0, 0, 0).getTime();

    let todayCount = 0;
    let weekCount = 0;
    const weekDayCounts = [0, 0, 0, 0, 0, 0, 0];

    history.forEach((record) => {
      const recordTime = new Date(record.timestamp).getTime();
      if (recordTime >= startOfToday && recordTime <= endOfToday) {
        todayCount++;
      }
      if (recordTime >= startOfWeek) {
        weekCount++;
        const recordDate = new Date(record.timestamp);
        const dayIdx = (recordDate.getDay() + 6) % 7;
        if (dayIdx >= 0 && dayIdx < 7) {
          weekDayCounts[dayIdx]++;
        }
      }
    });

    return {
      todayCount,
      weekCount,
      currentDayIdx: mondayOffset,
      weekDayCounts,
    };
  }, [history]);

  // Circular gauge for today
  const dailyTarget = 3;
  const todayProgressPercent = Math.min(100, Math.round((stats.todayCount / dailyTarget) * 100));
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayProgressPercent / 100) * circumference;
  const weekDayLabels = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="ios-glass-card rounded-2xl p-3 sm:p-3.5 shadow-sm border border-blue-200/60 dark:border-blue-900/50 space-y-2.5 transition-all">
        
        {/* Top: Dagens Morgoncitat - Hela meningen syns alltid fullt ut */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <span className="w-6 h-6 rounded-full icon-badge-glass text-blue-700 dark:text-amber-300 shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
              <Quote className="w-3.5 h-3.5 icon-realistic" />
            </span>
            <p
              className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic font-medium leading-relaxed transition-opacity duration-150 text-left ${
                isChanging ? 'opacity-0' : 'opacity-100'
              }`}
            >
              "{currentQuote.quote}"
            </p>
          </div>

          <button
            onClick={getRandomQuote}
            title="Slumpa ett nytt morgoncitat"
            aria-label="Slumpa ett nytt morgoncitat"
            className="shrink-0 ios-glass-btn p-1.5 rounded-xl text-slate-500 hover:text-blue-700 dark:text-slate-300 dark:hover:text-amber-300 group"
          >
            <Shuffle className="w-3.5 h-3.5 icon-realistic group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-200/70 dark:bg-slate-800/80" />

        {/* Bottom: Snurröversikt (Idag & Veckan med mätare) */}
        <div
          onClick={onOpenHistory}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenHistory?.();
          }}
          title="Klicka för att se full historik & favoriter"
          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 cursor-pointer group text-xs hover:opacity-95 transition-opacity pt-0.5"
        >
          {/* Idag Segment */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  className="stroke-slate-200/80 dark:stroke-slate-700/80"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  className="stroke-blue-600 dark:stroke-amber-400 transition-all duration-500 ease-out"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-amber-300">
                {stats.todayCount > 0 ? (
                  <Zap className="w-2.5 h-2.5 icon-realistic fill-current" />
                ) : (
                  <Gauge className="w-2.5 h-2.5 icon-realistic" />
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-1 text-left leading-none">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Idag:</span>
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">
                {stats.todayCount}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">snurr</span>
            </div>
          </div>

          {/* Veckan Segment & 7-dagars aktivitet */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 ml-auto sm:ml-0">
            <div className="flex items-baseline gap-1 text-left leading-none">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Veckan:</span>
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">
                {stats.weekCount}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">snurr</span>
            </div>

            {/* 7-Day Mini-Meter */}
            <div className="flex items-end gap-1 h-5 pb-0.5">
              {stats.weekDayCounts.map((count, idx) => {
                const isToday = idx === stats.currentDayIdx;
                const hasActivity = count > 0;
                const barHeight = hasActivity ? Math.min(14, Math.max(6, count * 4)) : 4;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-0.5"
                    title={`${weekDayLabels[idx]}: ${count} snurr`}
                  >
                    <div
                      style={{ height: `${barHeight}px` }}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        hasActivity
                          ? 'bg-gradient-to-t from-blue-600 to-amber-400 dark:from-blue-500 dark:to-yellow-300 shadow-2xs'
                          : isToday
                          ? 'bg-blue-400/80 dark:bg-amber-400/80'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span className={`text-[8px] font-bold leading-none ${isToday ? 'text-blue-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {weekDayLabels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0 pl-1">
              <span className="hidden sm:inline">Historik</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
