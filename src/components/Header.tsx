import React from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Volume2, VolumeX, Bell, SlidersHorizontal, History, Download, Laptop } from 'lucide-react';
import { ThemeMode, WheelPreset } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SigtunaLogo } from './SigtunaLogo';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNotifications: () => void;
  notificationsEnabled?: boolean;
  onOpenEditor: () => void;
  onOpenHistory: () => void;
  historyCount?: number;
  presets: WheelPreset[];
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenNotifications,
  notificationsEnabled = false,
  onOpenEditor,
  onOpenHistory,
  historyCount = 0,
  presets,
  activePresetId,
  onSelectPreset,
  isOnline,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="w-full border-b border-blue-100/80 dark:border-blue-950/60 bg-white/90 dark:bg-[#06152d]/90 backdrop-blur-md sticky top-0 z-30 transition-colors shrink-0 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-15 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Official Sigtuna Kommun Logo & Morning Wheel Brand - Full Vector Quality */}
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 sm:gap-3 min-w-0"
        >
          {/* Official Logo with Crest and Sigtuna Kommun typography */}
          <div className="shrink-0 flex items-center">
            <SigtunaLogo className="h-8 sm:h-9 w-auto" mode="auto" />
          </div>

          {/* Elegant divider */}
          <div className="h-6 w-px bg-slate-300/80 dark:bg-blue-800/60 hidden xs:block" />

          {/* App title */}
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              Morgonhjulet
            </h1>
            {!isOnline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Offline
              </span>
            )}
          </div>
        </motion.div>

        {/* Right Controls / Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* History & Favorites Modal Button - iOS Liquid Glass */}
          <button
            onClick={onOpenHistory}
            title="Historik & Sparade Favoriter"
            aria-label="Historik och sparade favoriter"
            className="ios-glass-btn p-2 sm:p-2.5 rounded-2xl relative group"
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400 icon-realistic group-hover:rotate-[-20deg] transition-transform duration-300" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs ring-1 ring-white dark:ring-slate-900 animate-pulse">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Customize Wheel Preset Button - iOS Liquid Glass */}
          <button
            onClick={onOpenEditor}
            title="Anpassa hjulet"
            aria-label="Anpassa hjulet"
            className="ios-glass-btn p-2 sm:p-2.5 rounded-2xl group"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 icon-realistic group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Sound Toggle - iOS Liquid Glass */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Ljud aktiverat' : 'Ljud avstängt'}
            aria-label={soundEnabled ? 'Ljud aktiverat' : 'Ljud avstängt'}
            className="ios-glass-btn p-2 sm:p-2.5 rounded-2xl group"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500 icon-realistic group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500 icon-realistic opacity-70" />
            )}
          </button>

          {/* Push Notifications Settings - iOS Liquid Glass */}
          <button
            onClick={onOpenNotifications}
            title={notificationsEnabled ? 'Morgonnotiser aktiverade (Klicka för inställningar)' : 'Påminnelser & Notiser (Klicka för att aktivera)'}
            aria-label="Påminnelser och notiser"
            className="ios-glass-btn p-2 sm:p-2.5 rounded-2xl relative group"
          >
            <Bell className={`w-4 h-4 icon-realistic transition-transform group-hover:rotate-12 ${notificationsEnabled ? 'text-amber-500 fill-amber-500/20' : 'text-slate-600 dark:text-slate-300'}`} />
            {notificationsEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#06152d] shadow-xs" />
            )}
          </button>

          {/* Sophisticated Dark / Light Mode Celestial Toggle - iOS Liquid Glass */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Växla till mjukt ljust läge' : 'Växla till elegant mörkt läge'}
            aria-label="Byt färgtema"
            className="ios-glass-btn p-2 sm:p-2.5 rounded-2xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              {theme === 'dark' ? (
                <motion.div
                  key="dark-sun"
                  initial={{ rotate: -90, scale: 0.2, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.2, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-4 h-4 text-amber-400 icon-realistic drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="light-moon"
                  initial={{ rotate: 90, scale: 0.2, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4 text-blue-700 dark:text-blue-300 icon-realistic drop-shadow-[0_0_6px_rgba(0,76,152,0.4)]" />
                </motion.div>
              )}
            </div>
          </button>

          {/* PWA Install Button - iOS Liquid Glass */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="hidden md:inline-flex ios-glass-btn-primary items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 icon-realistic" />
              <span>Installera</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
