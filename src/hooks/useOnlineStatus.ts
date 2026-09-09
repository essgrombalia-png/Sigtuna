import { useEffect, useState, useCallback } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => {
    return localStorage.getItem('morgonhjulet_last_sync') || new Date().toISOString();
  });
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const now = new Date().toISOString();
      setLastSyncedAt(now);
      localStorage.setItem('morgonhjulet_last_sync', now);
      setPendingSyncCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingSync = useCallback(() => {
    if (!navigator.onLine) {
      setPendingSyncCount((prev) => prev + 1);
    }
  }, []);

  return {
    isOnline,
    lastSyncedAt,
    pendingSyncCount,
    addPendingSync,
  };
}
