import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings } from '../types';

const SETTINGS_KEY = 'morgonhjulet_notification_settings';

export function usePushNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      enabled: false,
      time: '08:30',
      hasPermission: typeof Notification !== 'undefined' && Notification.permission === 'granted',
      soundEnabled: true,
    };
  });

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Sync actual Notification permission
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      const isGranted = Notification.permission === 'granted';
      if (isGranted !== settings.hasPermission) {
        setSettings((prev) => ({ ...prev, hasPermission: isGranted }));
      }
    }
  }, [settings.hasPermission]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      alert('Aviseringar stöds inte i din nuvarande webbläsare.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      setSettings((prev) => ({
        ...prev,
        enabled: granted,
        hasPermission: granted,
      }));
      return granted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: 'morgonhjulet-notification',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) {
        console.warn('Native notification failed, using fallback:', e);
      }
    }
  }, []);

  const testPushNotification = useCallback(() => {
    if (typeof Notification === 'undefined') {
      alert('Den här webbläsaren stöder inte webbnotiser.');
      return;
    }

    if (Notification.permission === 'granted') {
      sendNotification('🎡 Dags att snurra Morgonhjulet!', {
        body: 'Starta din arbetsdag med en positiv energiboost och dagens utmaning.',
      });
    } else {
      requestPermission().then((granted) => {
        if (granted) {
          sendNotification('🎡 Dags att snurra Morgonhjulet!', {
            body: 'Aviseringar är aktiverade! Du får påminnelser varje morgon.',
          });
        }
      });
    }
  }, [requestPermission, sendNotification]);

  // Interval check for scheduled morning notification
  useEffect(() => {
    if (!settings.enabled || !settings.hasPermission) return;

    const checkReminderTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      const lastNotifiedDate = localStorage.getItem('morgonhjulet_last_notified_date');
      const today = now.toDateString();

      if (currentTime === settings.time && lastNotifiedDate !== today) {
        sendNotification('☀️ God morgon! Morgonhjulet väntar', {
          body: 'Ta 30 sekunder och hämta dagens positiva budskap inför arbetsdagen.',
        });
        localStorage.setItem('morgonhjulet_last_notified_date', today);
      }
    };

    const interval = setInterval(checkReminderTime, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [settings.enabled, settings.hasPermission, settings.time, sendNotification]);

  return {
    settings,
    setSettings,
    requestPermission,
    sendNotification,
    testPushNotification,
  };
}
