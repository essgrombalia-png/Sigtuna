import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Header } from './components/Header';
import { WheelCanvas } from './components/WheelCanvas';
import { SpinResultCard } from './components/SpinResultCard';
import { HistoryAndFavorites } from './components/HistoryAndFavorites';
import { WheelEditorModal } from './components/WheelEditorModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { OfflineSyncBadge } from './components/OfflineSyncBadge';
import { OfflineModal } from './components/OfflineModal';

import { DEFAULT_PRESETS } from './data/defaultPresets';
import { getTodayGreeting } from './data/dailyGreetings';
import { ThemeMode, WheelPreset, WheelItem, SpinRecord } from './types';

import { useAudioSound } from './hooks/useAudioSound';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePushNotifications } from './hooks/usePushNotifications';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  // --- Theme Mode State ---
  // Standard är alltid ljust läge tills användaren aktivt väljer mörkt läge
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('morgonhjulet_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('morgonhjulet_theme', theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    if ('startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      });
    } else {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }
  };

  const { playTickSound, playFanfare, playChime } = useAudioSound();

  // --- Sound FX State ---
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('morgonhjulet_sound') !== 'false';
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('morgonhjulet_sound', String(next));
      if (next) {
        playChime();
      }
      return next;
    });
  };

  // --- Online / Offline Sync Hook ---
  const { isOnline, pendingSyncCount, addPendingSync } = useOnlineStatus();

  // --- Push Notifications Hook ---
  const {
    settings: notificationSettings,
    setSettings: setNotificationSettings,
    requestPermission,
    testPushNotification,
  } = usePushNotifications();

  // --- Presets & Active Wheel State ---
  const PRESET_VERSION = 'v5_blue_yellow_white';
  const [presets, setPresets] = useState<WheelPreset[]>(() => {
    try {
      const savedVersion = localStorage.getItem('morgonhjulet_presets_version');
      const saved = localStorage.getItem('morgonhjulet_presets');
      if (saved && savedVersion === PRESET_VERSION) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem('morgonhjulet_presets_version', PRESET_VERSION);
    return DEFAULT_PRESETS;
  });

  const [activePresetId, setActivePresetId] = useState<string>(() => {
    const saved = localStorage.getItem('morgonhjulet_active_preset');
    return saved || DEFAULT_PRESETS[0].id;
  });

  useEffect(() => {
    localStorage.setItem('morgonhjulet_presets', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem('morgonhjulet_active_preset', activePresetId);
  }, [activePresetId]);

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  // --- Spin State & Results ---
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentSpinResult, setCurrentSpinResult] = useState<WheelItem | null>(null);
  const [spinDuration, setSpinDuration] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('morgonhjulet_spin_duration');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 2 && parsed <= 10) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return 4.5;
  });

  useEffect(() => {
    localStorage.setItem('morgonhjulet_spin_duration', String(spinDuration));
  }, [spinDuration]);

  // --- Spin History & Favorites ---
  const [history, setHistory] = useState<SpinRecord[]>(() => {
    try {
      const saved = localStorage.getItem('morgonhjulet_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('morgonhjulet_history', JSON.stringify(history));
  }, [history]);

  const handleSpinEnd = (selectedItem: WheelItem) => {
    setCurrentSpinResult(selectedItem);
    addPendingSync();
  };

  const handleSaveSpinRecord = useCallback((record: SpinRecord) => {
    setHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === record.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = record;
        return updated;
      } else {
        return [record, ...prev];
      }
    });
  }, []);

  const handleToggleCompleteRecord = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleToggleFavoriteRecord = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.setItem('morgonhjulet_history', JSON.stringify([]));
    } catch {
      // Fallback
    }
  };

  // --- Modals State ---
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);

  // --- PWA Installation Hook ---
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Preset Editor handlers
  const handleUpdatePreset = (updated: WheelPreset) => {
    setPresets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCreateNewPreset = (title: string, description: string) => {
    const newPreset: WheelPreset = {
      id: `custom-preset-${Date.now()}`,
      title,
      description,
      category: 'Egna Hjul',
      isCustom: true,
      items: [
        { id: '1', text: 'TILLSAMMANS', subtext: 'Tillsammans når vi längre.', color: '#10b981' },
        { id: '2', text: 'POSITIV KRAFT', subtext: 'Sprid glädje i teamet.', color: '#3b82f6' },
        { id: '3', text: 'BRA JOBBAT', subtext: 'Var stolt över dina insatser.', color: '#f59e0b' },
        { id: '4', text: 'KAFFEPAUS', subtext: 'Ta en välförtjänt pausa.', color: '#ec4899' },
      ],
    };

    setPresets((prev) => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
  };

  const handleResetDefaults = () => {
    if (confirm('Återställ alla hjul till standardinställningarna?')) {
      setPresets(DEFAULT_PRESETS);
      setActivePresetId(DEFAULT_PRESETS[0].id);
    }
  };

  // Saved counter reset timestamp
  const [counterResetAt, setCounterResetAt] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sigtuna_wheel_counter_reset_at');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleResetCounter = () => {
    const now = Date.now();
    setCounterResetAt(now);
    try {
      localStorage.setItem('sigtuna_wheel_counter_reset_at', now.toString());
    } catch {
      // ignore
    }
  };

  // Current Date Label formatted in Swedish
  const todayDateFormatted = new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Today's greeting / motivational quote
  const todayGreeting = useMemo(() => getTodayGreeting(), []);

  // Today's total spins count (respects reset button)
  const todaySpinCount = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const effectiveStart = Math.max(startOfToday, counterResetAt);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

    return history.filter((record) => {
      const time = new Date(record.timestamp).getTime();
      return time >= effectiveStart && time <= endOfToday;
    }).length;
  }, [history, counterResetAt]);

  return (
    <div className="min-h-[100dvh] h-[100dvh] flex flex-col justify-between bg-premium-theme text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white overflow-y-auto relative">
      
      {/* Decorative subtle ambient lights: Royal Blue, Warm Gold & Pure White */}
      <div className="absolute top-0 left-1/4 w-96 h-96 -translate-y-1/2 -translate-x-1/2 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-400/15 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-96 h-64 bg-yellow-300/10 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Navigation */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        notificationsEnabled={notificationSettings.enabled}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={(id) => {
          setActivePresetId(id);
          setCurrentSpinResult(null);
        }}
        isOnline={isOnline}
        onOpenOfflineInfo={() => setIsOfflineModalOpen(true)}
      />

      {/* Main App Content Layout - Centered cohesive layout with quote and title directly above wheel */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto px-3 sm:px-6 py-1.5 sm:py-2.5 min-h-0 gap-2.5 sm:gap-3.5 my-auto">
        
        {/* Daily Greeting / Inspirational Quote Banner - Premium prominent styling */}
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl sm:max-w-2xl mx-auto px-5 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-50/95 via-amber-50/90 to-blue-50/95 dark:from-[#0b214a]/95 dark:via-[#162a4a]/90 dark:to-[#0b214a]/95 border border-blue-200/80 dark:border-amber-400/35 shadow-[0_6px_24px_rgba(0,76,152,0.08)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.45)] text-center select-none backdrop-blur-md"
        >
          <p className="text-sm sm:text-base md:text-lg font-black tracking-tight font-display text-slate-900 dark:text-amber-200 drop-shadow-2xs">
            {todayGreeting.headline}
          </p>
          <p className="text-xs sm:text-sm md:text-[14.5px] font-semibold text-slate-700 dark:text-blue-100/90 mt-1 leading-relaxed">
            {todayGreeting.subtext}
          </p>
        </motion.div>

        {/* Title Section placed directly above wheel */}
        <div className="text-center w-full space-y-1 sm:space-y-1.5 shrink-0 max-w-2xl">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs sm:text-[13px] font-extrabold tracking-wider bg-blue-100/90 dark:bg-blue-950/80 text-blue-950 dark:text-amber-300 border border-blue-300/80 dark:border-amber-400/30 capitalize shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
              {todayDateFormatted}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
            Snurra hjulet ·{' '}
            <span className="text-amber-500 dark:text-[#ffd744] font-black drop-shadow-[0_2px_10px_rgba(255,215,68,0.25)]">
              Ta med dig morgonenergin
            </span>
          </h2>
        </div>

        {/* Centered Wheel Canvas Section */}
        <div className="w-full flex flex-col items-center justify-center min-h-0">
          <WheelCanvas
            items={activePreset.items}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
            soundEnabled={soundEnabled}
            onPlayTickSound={playTickSound}
            spinCount={todaySpinCount}
            spinDuration={spinDuration}
          />
        </div>

      </main>

      {/* Celebratory Spin Result Modal */}
      <SpinResultCard
        result={currentSpinResult}
        isSpinning={isSpinning}
        onSpinAgain={() => setCurrentSpinResult(null)}
        presetTitle={activePreset.title}
        presetId={activePreset.id}
        presetDescription={activePreset.description}
        onSaveSpinRecord={handleSaveSpinRecord}
        soundEnabled={soundEnabled}
        onPlayFanfare={playFanfare}
      />

      {/* Footer - Sleek single-line bottom bar */}
      <footer className="border-t border-blue-100/70 dark:border-blue-950/60 bg-white/80 dark:bg-[#06152d]/80 backdrop-blur-xs py-1.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-amber-400" />
            <span><strong className="text-slate-700 dark:text-slate-200">Sigtuna kommun</strong> · Internservice för medarbetare</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
          <button
            type="button"
            onClick={() => setIsOfflineModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 cursor-pointer transition"
            title="Information om hur appen fungerar helt offline"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fungerar offline utan internet</span>
          </button>
        </div>
      </footer>

      {/* Modals & Offline Toast */}
      <WheelEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        preset={activePreset}
        presets={presets}
        onSelectPreset={(id) => {
          setActivePresetId(id);
          setCurrentSpinResult(null);
        }}
        onUpdatePreset={handleUpdatePreset}
        onCreateNewPreset={handleCreateNewPreset}
        onResetDefaults={handleResetDefaults}
        onResetCounter={handleResetCounter}
        todaySpinCount={todaySpinCount}
        spinDuration={spinDuration}
        onUpdateSpinDuration={setSpinDuration}
      />

      <NotificationSettingsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        onRequestPermission={requestPermission}
        onTestNotification={testPushNotification}
        isOnline={isOnline}
      />

      <OfflineSyncBadge
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onOpenOfflineInfo={() => setIsOfflineModalOpen(true)}
      />

      <OfflineModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
      />

      {/* History & Favorites Modal */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-scaleUp"
          >
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-4 right-4 z-20 ios-glass-btn p-2 rounded-full shadow-md text-slate-600 dark:text-slate-300"
              title="Stäng"
              aria-label="Stäng historik"
            >
              <X className="w-4 h-4 icon-realistic" />
            </button>
            <HistoryAndFavorites
              history={history}
              onToggleComplete={handleToggleCompleteRecord}
              onToggleFavorite={handleToggleFavoriteRecord}
              onClearHistory={handleClearHistory}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
