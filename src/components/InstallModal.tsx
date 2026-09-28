import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Laptop,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'android'
  );
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // QR code image URL using public QR code API for quick phone scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=12-12-14&color=f5-9e-0b&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141417] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="WSPOS"
                className="w-9 h-9 rounded-lg object-contain shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Instal Aplikasi WSPOS</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  APK / PWA
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Warung Senja Terang Bulan Point of Sale
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Aplikasi Sudah Terpasang!
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  WSPOS sedang berjalan dalam mode aplikasi mandiri (*standalone*).
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Siap Dipasang Langsung</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Klik tombol di samping untuk menginstal langsung ke perangkat Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                {isInstalling ? 'Memproses...' : 'Pasang Sekarang'}
              </button>
            </div>
          ) : null}

          {/* Platform Tab Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Panduan Pemasangan Berdasarkan Perangkat:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android (APK)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptop / PC</span>
              </button>
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-4.5 space-y-3.5">
            {activeTab === 'android' && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span>Cara Pasang di HP Android (Chrome / WebAPK):</span>
                </div>
                <ol className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Buka link aplikasi ini di browser <strong>Google Chrome</strong> pada HP Android Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tekan tombol <strong>menu titik tiga (⋮)</strong> di sudut kanan atas layar Chrome.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Pilih opsi <strong>&quot;Instal aplikasi&quot;</strong> atau{' '}
                      <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Tekan <strong>&quot;Instal&quot;</strong>. Sistem Android akan otomatis memasang aplikasi (APK) dengan ikon <strong>WSPOS</strong> di layar utama dan daftar aplikasi Anda tanpa perlu buka browser lagi!
                    </span>
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'ios' && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Share2 className="w-4 h-4" />
                  <span>Cara Pasang di Apple iPhone / iPad (Safari):</span>
                </div>
                <ol className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Buka tautan aplikasi ini di browser bawaan <strong>Safari</strong> di iPhone/iPad Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas di bagian bawah).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Gulir ke bawah dan ketuk opsi <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Ketuk <strong>&quot;Tambah&quot;</strong> di pojok kanan atas. Ikon WSPOS akan muncul di layar iPhone Anda dan terbuka seperti aplikasi asli.
                    </span>
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'desktop' && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Laptop className="w-4 h-4" />
                  <span>Cara Pasang di Komputer / Laptop (Chrome / Edge):</span>
                </div>
                <ol className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Gunakan browser Google Chrome, Edge, atau Brave di PC/Laptop Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Klik <strong>ikon komputer/install (📥)</strong> di bagian kanan address bar (bilah tautan atas), atau menu titik tiga &gt; <strong>&quot;Instal WSPOS&quot;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Aplikasi akan terbuka di jendela tersendiri layaknya software desktop dan tersedia di Start Menu / Desktop.
                    </span>
                  </li>
                </ol>
              </>
            )}
          </div>

          {/* QR Code & Share Link Section */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 bg-[#121214] border border-amber-500/20 rounded-xl p-1.5 flex items-center justify-center shrink-0">
              <img
                src={qrCodeUrl}
                alt="Scan QR untuk Pasang di HP"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-white">Scan QR untuk Pasang di HP</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Scan dengan kamera HP untuk langsung membuka dan memasang WSPOS di smartphone kasir Anda.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-black/50 border border-zinc-700 text-zinc-400 text-[11px] rounded-lg px-2.5 py-1.5 w-full select-all font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  title="Salin Tautan"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Mendukung mode offline & printer Bluetooth/USB</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
