import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallModal } from './InstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Download className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">
              {isInstalled ? 'Aplikasi Terpasang' : 'Instal APK / App'}
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
            PWA
          </span>
        </button>

        <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  if (variant === 'settings') {
    return (
      <>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Instalasi Aplikasi POS (APK / PWA)</h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  {isInstalled ? 'Aktif' : 'Bisa Dipasang'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Pasang aplikasi WSPOS di HP Android, iPhone, tablet, atau komputer kasir Anda untuk akses cepat dan mode offline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Lihat Info Terpasang</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Instal Aplikasi Sekarang</span>
              </>
            )}
          </button>
        </div>

        <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Header default variant
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-sm transition-all cursor-pointer group"
      >
        <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">
          {isInstalled ? 'Aplikasi Terpasang' : 'Instal APK'}
        </span>
        <span className="sm:hidden">Instal</span>
      </button>

      <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
