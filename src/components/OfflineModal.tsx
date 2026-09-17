import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  Download,
  Smartphone,
  HardDrive,
  Sparkles,
  X,
  Share,
  PlusSquare,
  ShieldCheck,
} from 'lucide-react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl shadow-2xl bg-white dark:bg-[#081b3a] border border-slate-200/90 dark:border-blue-900/80 p-5 sm:p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 ios-glass-btn p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Stäng offline-information"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 text-amber-300 animate-pulse" />}
            </div>
            <div>
              <h2 className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                Använd appen utan internet
              </h2>
              <p className="text-xs text-slate-500 dark:text-blue-200/80 font-medium">
                100% offline-stöd & lokal datalagring
              </p>
            </div>
          </div>

          {/* Connection Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between gap-3 ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-xs sm:text-sm font-bold">
                {isOnline ? 'Du är ansluten till internet' : 'Du är i offline-läge'}
              </span>
            </div>
            <span className="text-[11px] font-semibold opacity-85 px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30">
              {isOnline ? 'Online' : 'Offline redo'}
            </span>
          </div>

          {/* Offline Features Highlights */}
          <div className="space-y-2.5 mb-5 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200/60 dark:border-blue-900/40">
              <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-bold">
                  Allt sparas lokalt i enheten
                </strong>
                <span className="text-slate-600 dark:text-slate-300 text-xs">
                  Dina snurr, favoritbudskap, anpassade hjul och inställningar sparas säkert i webbläsaren. Inget försvinner vid stängning.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200/60 dark:border-blue-900/40">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-bold">
                  Ljud, animationer & grafik
                </strong>
                <span className="text-slate-600 dark:text-slate-300 text-xs">
                  Hjulmotor, klickljud, vinstfanfar och animationer körs direkt på enhetens processor utan externa servrar.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200/60 dark:border-blue-900/40">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-bold">
                  Service Worker precache
                </strong>
                <span className="text-slate-600 dark:text-slate-300 text-xs">
                  Appens kod och grafik har sparats lokalt så att du kan öppna den när du reser, saknar WiFi eller har dålig täckning.
                </span>
              </div>
            </div>
          </div>

          {/* Installation Section */}
          <div className="border-t border-slate-200 dark:border-blue-900/80 pt-4">
            {isInstalled ? (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Appen är installerad på din enhet och klar för offline-bruk!</span>
              </div>
            ) : isInstallable ? (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Installera som app på din hemskärm eller skrivbord för snabbast åtkomst:
                </p>
                <button
                  onClick={async () => {
                    const success = await onInstall();
                    if (success) onClose();
                  }}
                  className="w-full ios-glass-btn-primary py-3 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Installera appen (Spara offline)</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Lägg till på hemskärmen (iPhone/iPad):</span>
                </div>
                <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                  <li>
                    Tryck på <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600 dark:text-blue-400" />
                    <strong>Dela</strong> i Safaris verktygsfält.
                  </li>
                  <li>
                    Skrolla ner och välj{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                      <PlusSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Lägg till på hemskärmen
                    </span>.
                  </li>
                  <li>Appen startar nu som en vanlig app och fungerar helt utan internet!</li>
                </ol>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 text-center">
                💡 Du kan bokmärka eller spara denna sida. Service Workern håller appen cachad och redo offline!
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-blue-950/80 hover:bg-slate-200 dark:hover:bg-blue-900/80 text-slate-800 dark:text-blue-100 font-bold text-xs transition"
          >
            Stäng
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
