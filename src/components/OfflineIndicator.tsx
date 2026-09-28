import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-zinc-950 px-4 py-2.5 text-xs font-semibold shadow-xl shadow-amber-500/20 backdrop-blur border border-amber-400">
      <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
      <span>Mode Offline — Data tersimpan lokal di perangkat</span>
    </div>
  );
};
