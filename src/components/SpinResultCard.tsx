import React, { useState, useEffect, useRef } from 'react';
import { WheelItem, SpinRecord } from '../types';
import { Sparkles, CheckCircle2, Heart, Share2, Check, RotateCcw, Loader2, X } from 'lucide-react';
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
      <div className="w-full max-w-xl mx-auto py-2.5 px-4 rounded-2xl ios-glass-card text-center border border-amber-400/50 dark:border-amber-400/40 animate-pulse">
        <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500 icon-realistic" />
          <span>Hjulet snurrar fram dagens morgonpepp…</span>
        </div>
      </div>
    );
  }

  // State 2: No result yet (Prompt to spin)
  if (!result) {
    return (
      <div className="w-full max-w-xl mx-auto py-2 px-4 rounded-2xl ios-glass-card text-center border border-blue-200/50 dark:border-blue-900/40">
        <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 icon-realistic animate-pulse" />
          <span>Snurra hjulet för att dra dagens budskap</span>
        </p>
      </div>
    );
  }

  // State 3: Result landed!
  return (
    <div className="w-full max-w-xl mx-auto ios-glass-card rounded-3xl p-3 sm:p-4 border-2 border-blue-500/40 dark:border-blue-500/50 shadow-xl relative overflow-hidden transition-all duration-300 animate-fadeIn">
      
      {/* Background Soft Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-blue-500/15 via-amber-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs border border-white/30">
            <Sparkles className="w-3 h-3 fill-current icon-realistic" />
            <span>Dagens Resultat</span>
          </span>
          {result.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50/80 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
              {result.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleFavorite}
            className={`ios-glass-btn p-1.5 rounded-xl transition-all ${
              isFavorite
                ? 'ios-glass-btn-rose scale-105'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            title={isFavorite ? 'Sparad i favoriter' : 'Spara som favorit'}
          >
            <Heart className={`w-3.5 h-3.5 icon-realistic ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onSpinAgain}
            className="ios-glass-btn p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Dölj / stäng resultat"
            aria-label="Dölj / stäng resultat"
          >
            <X className="w-3.5 h-3.5 icon-realistic" />
          </button>
        </div>
      </div>

      {/* Main Result Heading & Subtext */}
      <div aria-live="polite" className="my-1.5 text-center sm:text-left">
        <h2 className="text-base sm:text-lg font-extrabold font-serif text-slate-900 dark:text-white leading-tight">
          {result.text}
        </h2>
        {result.subtext && (
          <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug font-medium">
            {result.subtext}
          </p>
        )}
      </div>

      {/* Action Controls - iOS Liquid Glass Buttons */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        
        {/* Checkmark Completion Button */}
        <button
          onClick={handleToggleComplete}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
            isCompleted
              ? 'ios-glass-btn-emerald'
              : 'ios-glass-btn text-slate-700 dark:text-slate-200'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 icon-realistic ${isCompleted ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
          <span>{isCompleted ? 'Klar idag!' : 'Markera som klar'}</span>
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Celebrate Confetti Button - iOS Liquid Glass Gold */}
          <button
            onClick={() => triggerMorningConfetti()}
            className="ios-glass-btn-gold flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold"
            title="Fira med konfetti"
          >
            <Sparkles className="w-3.5 h-3.5 icon-realistic" />
            <span>Fira</span>
          </button>

          {/* Share Button - iOS Liquid Glass */}
          <button
            onClick={handleShare}
            className="ios-glass-btn flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200"
            title="Dela budskap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 icon-realistic" />
                <span>Kopierat!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 icon-realistic" />
                <span>Dela</span>
              </>
            )}
          </button>

          {/* Spin Again Button - iOS Liquid Glass */}
          <button
            onClick={onSpinAgain}
            className="ios-glass-btn flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 icon-realistic" />
            <span>Snurra igen</span>
          </button>
        </div>

      </div>

    </div>
  );
};
