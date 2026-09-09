import React, { useState, useEffect, useRef } from 'react';
import { WheelItem, SpinRecord } from '../types';
import { Sparkles, CheckCircle2, Heart, Share2, Check, RotateCcw, Loader2 } from 'lucide-react';
import { triggerMorningConfetti } from '../utils/confetti';

interface SpinResultCardProps {
  result: WheelItem | null;
  isSpinning: boolean;
  onSpinAgain: () => void;
  presetTitle: string;
  presetId: string;
  presetDescription: string;
  onSaveSpinRecord: (record: SpinRecord) => void;
  soundEnabled: boolean;
  onPlayFanfare: () => void;
}

export const SpinResultCard: React.FC<SpinResultCardProps> = ({
  result,
  isSpinning,
  onSpinAgain,
  presetTitle,
  presetId,
  presetDescription,
  onSaveSpinRecord,
  soundEnabled,
  onPlayFanfare,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const lastProcessedRef = useRef<WheelItem | null>(null);

  useEffect(() => {
    if (!result) {
      lastProcessedRef.current = null;
      return;
    }

    if (result !== lastProcessedRef.current) {
      lastProcessedRef.current = result;

      // Trigger uplifting multi-stage morning confetti
      triggerMorningConfetti();

      if (soundEnabled) {
        onPlayFanfare();
      }

      const recordId = `spin-${Date.now()}`;
      setCurrentRecordId(recordId);
      setIsCompleted(false);
      setIsFavorite(false);

      const record: SpinRecord = {
        id: recordId,
        presetId,
        presetTitle,
        itemText: result.text,
        itemSubtext: result.subtext,
        timestamp: new Date().toISOString(),
        completed: false,
        isFavorite: false,
      };

      onSaveSpinRecord(record);
    }
  }, [result, presetId, presetTitle, soundEnabled, onPlayFanfare, onSaveSpinRecord]);

  const handleToggleComplete = () => {
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);

    if (currentRecordId && result) {
      onSaveSpinRecord({
        id: currentRecordId,
        presetId,
        presetTitle,
        itemText: result.text,
        itemSubtext: result.subtext,
        timestamp: new Date().toISOString(),
        completed: nextCompleted,
        isFavorite,
      });
    }
  };

  const handleToggleFavorite = () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    if (currentRecordId && result) {
      onSaveSpinRecord({
        id: currentRecordId,
        presetId,
        presetTitle,
        itemText: result.text,
        itemSubtext: result.subtext,
        timestamp: new Date().toISOString(),
        completed: isCompleted,
        isFavorite: nextFavorite,
      });
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const shareText = `Dagens budskap från Morgonhjulet: "${result.text}" - ${result.subtext || ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Morgonhjulet - Sigtuna kommun',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Kunde inte kopiera till urklipp');
    }
  };

  // State 1: Currently spinning
  if (isSpinning) {
    return (
      <div className="w-full max-w-xl mx-auto py-2 px-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-center shadow-xs animate-pulse">
        <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
          <span>Hjulet snurrar fram dagens morgonpepp…</span>
        </div>
      </div>
    );
  }

  // State 2: No result yet (Prompt to spin)
  if (!result) {
    return (
      <div className="w-full max-w-xl mx-auto py-1.5 px-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 text-center shadow-xs">
        <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Snurra hjulet för att dra dagens budskap</span>
        </p>
      </div>
    );
  }

  // State 3: Result landed!
  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-emerald-500/80 shadow-lg relative overflow-hidden transition-all duration-300 animate-fadeIn">
      
      {/* Background Soft Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>Dagens Resultat</span>
          </span>
          {result.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/60">
              {result.category}
            </span>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`p-1.5 rounded-lg transition-all ${
            isFavorite
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Sparad i favoriter' : 'Spara som favorit'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Result Heading & Subtext */}
      <div aria-live="polite" className="my-1 text-center sm:text-left">
        <h2 className="text-base sm:text-lg font-extrabold font-serif text-slate-900 dark:text-white leading-tight">
          {result.text}
        </h2>
        {result.subtext && (
          <p className="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug font-medium">
            {result.subtext}
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
        
        {/* Checkmark Completion Button */}
        <button
          onClick={handleToggleComplete}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
          <span>{isCompleted ? 'Klar idag!' : 'Markera som klar'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Celebrate Confetti Button */}
          <button
            onClick={() => triggerMorningConfetti()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
            title="Fira med konfetti"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fira</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Dela budskap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kopierat!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Dela</span>
              </>
            )}
          </button>

          {/* Spin Again Button */}
          <button
            onClick={onSpinAgain}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Snurra igen</span>
          </button>
        </div>

      </div>

    </div>
  );
};
