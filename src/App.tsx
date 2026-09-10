import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { Header } from './components/Header';
import { WheelCanvas } from './components/WheelCanvas';
import { SpinResultCard } from './components/SpinResultCard';
import { HistoryAndFavorites } from './components/HistoryAndFavorites';
import { WheelEditorModal } from './components/WheelEditorModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { OfflineSyncBadge } from './components/OfflineSyncBadge';

import { DEFAULT_PRESETS } from './data/defaultPresets';
import { getTodayGreeting } from './data/dailyGreetings';
import { ThemeMode, WheelPreset, WheelItem, SpinRecord } from './types';

import { useAudioSound } from './hooks/useAudioSound';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePushNotifications } from './hooks/usePushNotifications';

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
  const PRESET_VERSION = 'v4_cleantypography';
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
      />

      {/* Main App Content Layout - Centered spacious wheel layout */}
      <main className="flex-1 flex flex-col items-center justify-between max-w-2xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-3 min-h-0">
        
        {/* Top Section with Title */}
        <div className="text-center w-full space-y-1 sm:space-y-1.5 shrink-0 max-w-xl">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 capitalize shadow-2xs">
              {todayDateFormatted}
            </span>
            <span className="inline-flex sm:hidden items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800/60 shadow-2xs">
              {getTodayGreeting().headline}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
            Snurra hjulet ·{' '}
            <span className="text-amber-600 dark:text-amber-400">
              Ta med dig morgonenergin
            </span>
          </h2>
        </div>

        {/* Centered Wheel Canvas Section */}
        <div className="w-full flex-1 flex flex-col items-center justify-center my-auto min-h-0 py-1 sm:py-2">
          <WheelCanvas
            items={activePreset.items}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
            soundEnabled={soundEnabled}
            onPlayTickSound={playTickSound}
            spinCount={todaySpinCount}
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
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-amber-400" />
            <span><strong className="text-slate-700 dark:text-slate-200">Sigtuna kommun</strong> · Internservice för medarbetare & team</span>
          </span>
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
