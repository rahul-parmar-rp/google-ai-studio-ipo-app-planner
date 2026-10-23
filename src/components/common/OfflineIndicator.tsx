import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600/95 border border-amber-500 text-white px-3.5 py-2 text-xs font-medium shadow-xl backdrop-blur-xs">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — All planning and local data saved in browser storage.</span>
    </div>
  );
};
