import React, { useMemo } from 'react';
import { Gauge, Calendar, ChevronRight, Zap } from 'lucide-react';
import { SpinRecord } from '../types';

interface SpinStatsOverviewProps {
  history: SpinRecord[];
  onOpenHistory?: () => void;
}

export const SpinStatsOverview: React.FC<SpinStatsOverviewProps> = ({
  history,
  onOpenHistory,
}) => {
  // Compute spins for today and this week
  const stats = useMemo(() => {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    // Start and end of today
    const startOfToday = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0).getTime();
    const endOfToday = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).getTime();

    // Monday as start of current week
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = (currentDayOfWeek + 6) % 7; // Monday = 0 ... Sunday = 6
    const startOfWeek = new Date(todayYear, todayMonth, todayDate - mondayOffset, 0, 0, 0, 0).getTime();

    let todayCount = 0;
    let weekCount = 0;
    const weekDayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon (0) to Sun (6)

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

  // Target for daily meter (e.g. 1-3 spins is a healthy morning energizer)
  const dailyTarget = 3;
  const todayProgressPercent = Math.min(100, Math.round((stats.todayCount / dailyTarget) * 100));

  // Circular gauge parameters
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayProgressPercent / 100) * circumference;

  const weekDayLabels = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <div
        onClick={onOpenHistory}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onOpenHistory?.();
          }
        }}
        title="Klicka för att öppna historik & detaljer"
        className="ios-glass-card rounded-2xl px-3.5 py-1.5 sm:py-2 flex items-center justify-between gap-3 sm:gap-6 cursor-pointer hover:border-blue-400/50 dark:hover:border-amber-400/50 transition-all group"
      >
        {/* Left Segment: Idag (Today) with Circular Gauge & Big Number */}
        <div className="flex items-center gap-2.5">
          {/* Circular SVG Gauge */}
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="stroke-slate-200/80 dark:stroke-slate-700/80"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="stroke-blue-600 dark:stroke-amber-400 transition-all duration-500 ease-out"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-amber-300">
              {stats.todayCount > 0 ? (
                <Zap className="w-3.5 h-3.5 icon-realistic fill-current" />
              ) : (
                <Gauge className="w-3.5 h-3.5 icon-realistic" />
              )}
            </div>
          </div>

          <div className="text-left leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {stats.todayCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {stats.todayCount === 1 ? 'snurr' : 'snurr'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Idag
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200/80 dark:bg-slate-700/80 shrink-0" />

        {/* Right Segment: Denna Vecka (This Week) with 7-day mini meter & Count */}
        <div className="flex items-center gap-3">
          <div className="text-left leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {stats.weekCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {stats.weekCount === 1 ? 'snurr' : 'snurr'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 inline-block icon-realistic" />
              <span>Denna vecka</span>
            </div>
          </div>

          {/* 7-Day Activity Mini-Meter */}
          <div className="flex items-end gap-1 h-6 pt-1">
            {stats.weekDayCounts.map((count, idx) => {
              const isToday = idx === stats.currentDayIdx;
              const hasActivity = count > 0;
              // Height scales with count (min 6px, max 18px)
              const barHeight = hasActivity ? Math.min(18, Math.max(8, count * 5)) : 5;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-0.5 group/bar"
                  title={`${weekDayLabels[idx]}: ${count} snurr ${isToday ? '(idag)' : ''}`}
                >
                  <div
                    style={{ height: `${barHeight}px` }}
                    className={`w-1.5 sm:w-2 rounded-full transition-all duration-300 ${
                      hasActivity
                        ? 'bg-gradient-to-t from-blue-600 to-amber-400 dark:from-blue-500 dark:to-yellow-300 shadow-xs'
                        : isToday
                        ? 'bg-blue-300 dark:bg-slate-600'
                        : 'bg-slate-200 dark:bg-slate-800'
                    } ${isToday ? 'ring-1 ring-blue-500 dark:ring-amber-400' : ''}`}
                  />
                  <span
                    className={`text-[8px] font-bold leading-none ${
                      isToday
                        ? 'text-blue-700 dark:text-amber-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {weekDayLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle arrow to view history */}
        <div className="hidden sm:flex items-center text-slate-400 group-hover:text-blue-600 dark:group-hover:text-amber-300 transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 icon-realistic group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
