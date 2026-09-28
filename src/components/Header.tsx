import React from 'react';
import { Bluetooth, Radio } from 'lucide-react';
import { User } from '../types';
import { useBluetoothPrinter } from '../hooks/useBluetoothPrinter';

interface HeaderProps {
  title: string;
  currentUser: User;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currentUser,
}) => {
  const { status, deviceInfo, connectBluetooth, disconnect } = useBluetoothPrinter();

  return (
    <header className="h-16 px-6 border-b border-zinc-800/80 bg-[#121214]/60 backdrop-blur flex items-center justify-between shrink-0">
      <div className="flex flex-col">
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-400">
          Selamat datang kembali, {currentUser.name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {status === 'connected' ? (
          <button
            type="button"
            onClick={disconnect}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title={`Tersambung ke ${deviceInfo?.name || 'Printer Bluetooth'}. Klik untuk putuskan.`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Radio className="w-3.5 h-3.5" />
            <span className="max-w-[130px] truncate">{deviceInfo?.name || 'Printer BT'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={connectBluetooth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-[#f59e0b] hover:bg-amber-500/10 transition-all cursor-pointer"
            title="Klik untuk mencari dan menghubungkan printer Bluetooth thermal"
          >
            <Bluetooth className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>{status === 'connecting' ? 'Menghubungkan...' : 'Printer Bluetooth'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
