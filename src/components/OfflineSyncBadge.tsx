import React from 'react';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';

interface OfflineSyncBadgeProps {
  isOnline: boolean;
  pendingSyncCount: number;
}

export const OfflineSyncBadge: React.FC<OfflineSyncBadgeProps> = ({
  isOnline,
  pendingSyncCount,
}) => {
  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500 text-white shadow-xl text-xs font-bold animate-slideUp">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <div>
            <div>Offline-läge aktivt</div>
            <div className="text-[10px] font-medium opacity-90">Dina resultat sparas tryggt i enheten.</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold animate-fadeOut">
          <CheckCircle className="w-4 h-4" />
          <span>Anslutning återställd! Data synkroniserad.</span>
        </div>
      )}
    </div>
  );
};
