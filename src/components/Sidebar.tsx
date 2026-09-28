import React from 'react';
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  ReceiptText,
  TrendingUp,
  Settings,
  Store,
} from 'lucide-react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type TabType =
  | 'dashboard'
  | 'pos'
  | 'produk'
  | 'transaksi'
  | 'laporan'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const allNavItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutGrid },
    { id: 'pos' as TabType, label: 'POS / Kasir', icon: ShoppingCart },
    { id: 'produk' as TabType, label: 'Produk', icon: Package },
    { id: 'transaksi' as TabType, label: 'Transaksi', icon: ReceiptText },
    { id: 'laporan' as TabType, label: 'Laporan', icon: TrendingUp },
    { id: 'settings' as TabType, label: 'Pengaturan', icon: Settings },
  ];

  // Kasir role only sees Dashboard, POS, Transaksi, and Laporan
  const navItems =
    currentUser.role === 'Kasir'
      ? allNavItems.filter((item) =>
          ['dashboard', 'pos', 'transaksi', 'laporan'].includes(item.id)
        )
      : allNavItems;

  return (
    <aside className="w-64 bg-[#121214] border-r border-zinc-800/80 flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-zinc-800/40">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b] flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
            <Store className="w-5 h-5 text-black stroke-[2.3]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-tight">
              WS<span className="text-[#f59e0b]">POS</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-normal leading-tight mt-0.5">
              Warung Senja Terang Bulan
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#252217] text-white border border-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#f59e0b]' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* PWA / APK Install Button */}
      <div className="px-3 py-2">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* User Profile & Logout Bottom */}
      <div className="p-4 border-t border-zinc-800/40">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center font-bold text-black text-sm shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate leading-tight">
              {currentUser.name}
            </span>
            <span className="text-xs text-zinc-400 leading-tight mt-0.5">
              {currentUser.role}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full bg-[#161619] hover:bg-zinc-800 border border-zinc-800/90 text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all text-center cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
};
