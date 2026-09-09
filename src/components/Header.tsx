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
        <div className="flex items-center gap-1 sm:gap-1.5">
          
          {/* History & Favorites Modal Button */}
          <button
            onClick={onOpenHistory}
            title="Historik & Sparade Favoriter"
            aria-label="Historik och sparade favoriter"
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs relative"
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Customize Wheel Preset Button */}
          <button
            onClick={onOpenEditor}
            title="Anpassa hjulet"
            aria-label="Anpassa hjulet"
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Ljud aktiverat' : 'Ljud avstängt'}
            aria-label={soundEnabled ? 'Ljud aktiverat' : 'Ljud avstängt'}
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Push Notifications Settings */}
          <button
            onClick={onOpenNotifications}
            title={notificationsEnabled ? 'Morgonnotiser aktiverade (Klicka för inställningar)' : 'Påminnelser & Notiser (Klicka för att aktivera)'}
            aria-label="Påminnelser och notiser"
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs relative"
          >
            <Bell className={`w-4 h-4 ${notificationsEnabled ? 'text-amber-500' : ''}`} />
            {notificationsEnabled && (
              <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
            aria-label="Byt färgtema"
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installera</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
