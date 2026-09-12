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

  // State 1: Currently spinning or no result - keep view clean and wheel prominent
  if (!result) {
    return null;
  }

  // State 2: Result landed - Display as an elegant celebratory modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg ios-glass-card rounded-3xl p-5 sm:p-6 border-2 border-amber-400/60 dark:border-amber-400/50 shadow-2xl relative overflow-hidden transition-all duration-300 scale-100 animate-scaleUp">
        
        {/* Background Soft Celebration Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-400/25 via-blue-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 via-amber-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm border border-white/30">
              <Heart className="w-3.5 h-3.5 fill-current icon-realistic text-white" />
              <span>Dagens Resultat</span>
            </span>
            {result.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50/90 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                {result.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleFavorite}
              className={`ios-glass-btn p-2 rounded-2xl transition-all ${
                isFavorite
                  ? 'ios-glass-btn-rose scale-105'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={isFavorite ? 'Sparad i favoriter' : 'Spara som favorit'}
            >
              <Heart className={`w-4 h-4 icon-realistic ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onSpinAgain}
              className="ios-glass-btn p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
              title="Stäng resultat"
              aria-label="Stäng resultat"
            >
              <X className="w-4 h-4 icon-realistic" />
            </button>
          </div>
        </div>

        {/* Main Result Heading & Subtext */}
        <div aria-live="polite" className="my-3 text-left">
          <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white leading-tight">
            {result.text}
          </h2>
          {result.subtext && (
            <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {result.subtext}
            </p>
          )}
        </div>

        {/* Action Controls - iOS Liquid Glass Buttons */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Checkmark Completion Button */}
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              isCompleted
                ? 'ios-glass-btn-emerald'
                : 'ios-glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 icon-realistic ${isCompleted ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
            <span>{isCompleted ? 'Klar idag!' : 'Markera som klar'}</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Celebrate Hearts Button */}
            <button
              onClick={() => triggerMorningConfetti()}
              className="ios-glass-btn-gold flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold group"
              title="Fira med hjärtan"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 icon-realistic group-hover:scale-125 transition-transform" />
              <span>Fira</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="ios-glass-btn flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200"
              title="Dela budskap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 icon-realistic" />
                  <span>Kopierat!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-300 icon-realistic" />
                  <span>Dela</span>
                </>
              )}
            </button>

            {/* Spin Again Button */}
            <button
              onClick={onSpinAgain}
              className="ios-glass-btn flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
            >
              <RotateCcw className="w-4 h-4 icon-realistic" />
              <span>Stäng</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
