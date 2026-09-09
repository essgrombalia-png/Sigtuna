import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '../types';
import { X, Bell, Volume2, Wifi, Send, CheckCircle2, ShieldCheck, Clock, Check } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onRequestPermission: () => Promise<boolean>;
  onTestNotification: () => void;
  isOnline: boolean;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRequestPermission,
  onTestNotification,
  isOnline,
}) => {
  const [testFeedback, setTestFeedback] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (!settings.enabled) {
      const granted = await onRequestPermission();
      if (granted) {
        onUpdateSettings({ ...settings, enabled: true, hasPermission: true });
      }
    } else {
      onUpdateSettings({ ...settings, enabled: false });
    }
  };

  const handleTestClick = () => {
    onTestNotification();
    setTestFeedback(true);
    setTimeout(() => setTestFeedback(false), 3500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ios-glass-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl icon-badge-glass text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5 icon-realistic" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Morgonnotiser & Offline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ställ in dagliga påminnelser och offline-synkronisering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ios-glass-btn p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Stäng"
            aria-label="Stäng"
          >
            <X className="w-4 h-4 icon-realistic" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Daily Reminder Toggle */}
          <div className="p-4 rounded-2xl ios-glass-card flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Daglig Morgonpåminnelse</span>
                {settings.hasPermission && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 icon-realistic" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Få en notis på din enhet varje morgon för att snurra hjulet
              </p>
            </div>

            <button
              onClick={handleTogglePush}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                settings.enabled ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time Picker */}
          {settings.enabled && (
            <div className="flex items-center justify-between p-4 rounded-2xl ios-glass-card border border-blue-200/60 dark:border-blue-800/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 icon-realistic" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Påminnelsetid:
                </span>
              </div>

              <input
                type="time"
                value={settings.time}
                onChange={(e) => onUpdateSettings({ ...settings, time: e.target.value })}
                className="px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white/90 dark:bg-slate-800/90 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none shadow-xs"
              />
            </div>
          )}

          {/* Test Push Notification Button - iOS Liquid Glass Primary */}
          <div className="space-y-2">
            <button
              onClick={handleTestClick}
              className="w-full ios-glass-btn-primary flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm"
            >
              <Send className="w-4 h-4 icon-realistic" />
              <span>Skicka test-push-notis nu</span>
            </button>

            {testFeedback && (
              <div className="p-3 rounded-2xl ios-glass-card text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn border border-emerald-300/50">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 icon-realistic" />
                <span>Testnotis skickad! ”🎡 Dags att snurra Morgonhjulet!”</span>
              </div>
            )}
          </div>

          {/* Offline Sync Status Info */}
          <div className="p-4 rounded-2xl ios-glass-card space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400 icon-realistic" />
              <span>Offline-synkronisering</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Alla dina snurr, anpassade hjul och sparade favoriter sparas automatiskt i din enhets lokala databas och synkroniseras direkt när du har internetanslutning.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="ios-glass-btn px-6 py-2 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
};
