import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Header } from './components/Header';
import { WheelCanvas } from './components/WheelCanvas';
import { SpinResultCard } from './components/SpinResultCard';
import { MorningQuoteBanner } from './components/MorningQuoteBanner';
import { HistoryAndFavorites } from './components/HistoryAndFavorites';
import { WheelEditorModal } from './components/WheelEditorModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { OfflineSyncBadge } from './components/OfflineSyncBadge';

import { DEFAULT_PRESETS } from './data/defaultPresets';
import { ThemeMode, WheelPreset, WheelItem, SpinRecord } from './types';

import { useAudioSound } from './hooks/useAudioSound';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePushNotifications } from './hooks/usePushNotifications';

export default function App() {
  // --- Theme Mode State ---
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('morgonhjulet_theme') as ThemeMode;
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark mode if preferred by system or default to dark as requested in earlier turns
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'dark';
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
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
  const PRESET_VERSION = 'v3_nyamorgonpepp';
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

  // Current Date Label formatted in Swedish
  const todayDateFormatted = new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="h-screen max-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500 selection:text-white overflow-y-auto sm:overflow-hidden">
      
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

      {/* Main App Content Layout - Compact single viewport */}
      <main className="flex-1 flex flex-col justify-evenly max-w-4xl w-full mx-auto px-3 sm:px-6 py-1 sm:py-2 min-h-0">
        
        {/* Top Section with Title and Morning Quote */}
        <div className="text-center max-w-2xl mx-auto space-y-1 sm:space-y-1.5 shrink-0">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
              {todayDateFormatted}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
            Snurra hjulet ·{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500">
              Ta med dig morgonenergin
            </span>
          </h2>

          {/* Slumpmässigt utvalt inspirerande morgoncitat */}
          <MorningQuoteBanner />
        </div>

        {/* Centered Wheel & Result Banner Section */}
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-1.5 sm:space-y-2 min-h-0">
          
          {/* Result Display Banner ABOVE the Wheel */}
          <div className="w-full shrink-0">
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
          </div>

          {/* Interactive Wheel */}
          <div className="w-full flex flex-col items-center justify-center min-h-0">
            <WheelCanvas
              items={activePreset.items}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              soundEnabled={soundEnabled}
              onPlayTickSound={playTickSound}
            />
          </div>

        </div>

      </main>

      {/* Footer - Sleek single-line bottom bar */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 py-1.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <span><strong>Sigtuna kommun</strong> · Morgonhjulet för medarbetare & team</span>
          <span className="hidden sm:inline">Offline-stöd med PWA</span>
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
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Stäng"
              aria-label="Stäng historik"
            >
              <X className="w-5 h-5" />
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
