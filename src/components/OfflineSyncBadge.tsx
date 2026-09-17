import React from 'react';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';

interface OfflineSyncBadgeProps {
  isOnline: boolean;
  pendingSyncCount: number;
  onOpenOfflineInfo?: () => void;
}

export const OfflineSyncBadge: React.FC<OfflineSyncBadgeProps> = ({
  isOnline,
  pendingSyncCount,
  onOpenOfflineInfo,
}) => {
  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {!isOnline ? (
        <button
          type="button"
          onClick={onOpenOfflineInfo}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-xl text-xs font-bold animate-slideUp text-left cursor-pointer transition active:scale-98"
          title="Tryck för mer information om offline-läget"
        >
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span>Offline-läge aktivt</span>
              <span className="text-[9px] bg-amber-700/60 px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold">Redo</span>
            </div>
            <div className="text-[10px] font-medium opacity-90">Allt fungerar utan internet · Tryck för info</div>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold animate-fadeOut">
          <CheckCircle className="w-4 h-4" />
          <span>Anslutning aktiv! Allt sparat lokalt.</span>
        </div>
      )}
    </div>
  );
};
