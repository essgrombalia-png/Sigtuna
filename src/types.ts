export interface WheelItem {
  id: string;
  text: string;
  wheelLabel?: string;
  subtext?: string;
  category?: string;
  color: string;
  textColor?: string;
  icon?: string;
}

export interface WheelPreset {
  id: string;
  title: string;
  description: string;
  category: string;
  isCustom?: boolean;
  items: WheelItem[];
}

export interface SpinRecord {
  id: string;
  presetId: string;
  presetTitle: string;
  itemText: string;
  itemSubtext?: string;
  timestamp: string; // ISO String
  completed?: boolean;
  isFavorite?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // e.g. "08:30"
  hasPermission: boolean;
  soundEnabled: boolean;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncedAt?: string;
  pendingChangesCount: number;
}
