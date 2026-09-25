import React from 'react';
import { TrendingUp, ReceiptText, Users, Package } from 'lucide-react';
import { Transaction, Product, CashDrawerSession } from '../types';
import { formatRupiah, formatNumber } from '../utils/format';

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
  cashDrawer: CashDrawerSession;
  onOpenCashierClick: () => void;
  onCloseCashierClick?: () => void;
  onNavigateToTab: (tab: any) => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  products,
  cashDrawer,
  onOpenCashierClick,
  onCloseCashierClick,
  onNavigateToTab,
  onSelectTransaction,
}) => {
  // Filter today's transactions
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);

  const todaySales = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  const todayTxCount = todayTransactions.length;
  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const activeCashiersCount = cashDrawer.isOpen ? 1 : 0;

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Ringkasan Hari Ini
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau performa Warung Senja Terang Bulan secara cepat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cashDrawer.isOpen && onCloseCashierClick && (
            <button
              type="button"
              onClick={onCloseCashierClick}
              className="bg-[#241c1c] hover:bg-[#342222] text-rose-300 border border-rose-800/50 font-semibold px-4 py-3 rounded-xl text-sm tracking-wide transition-all active:scale-95 cursor-pointer"
            >
              Tutup Kasir
            </button>
          )}
          <button
            type="button"
            onClick={onOpenCashierClick}
            className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
          >
            {cashDrawer.isOpen ? 'Buka POS Kasir' : 'Buka Kasir'}
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Penjualan Hari Ini */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              PENJUALAN HARI INI
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatRupiah(todaySales)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* Card 2: Transaksi Hari Ini */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              TRANSAKSI HARI INI
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatNumber(todayTxCount)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <ReceiptText className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* Card 3: Kasir Aktif */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              KASIR AKTIF
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {activeCashiersCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* Card 4: Produk Aktif */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              PRODUK AKTIF
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {activeProductsCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru Section */}
      <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
          <div>
            <h2 className="text-base font-bold text-white">Transaksi Terbaru</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              10 transaksi terbaru hari ini
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('transaksi')}
            className="text-xs font-semibold text-[#f59e0b] hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            Lihat semua &rarr;
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50 mt-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                className="py-3.5 flex items-center justify-between hover:bg-zinc-800/30 px-3 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {tx.invoiceNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    {tx.time} &middot; {tx.items.length} item &middot; Kasir: {tx.cashierName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#f59e0b]">
                    {formatRupiah(tx.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
