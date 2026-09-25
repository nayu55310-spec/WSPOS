import React, { useState, useMemo } from 'react';
import { TrendingUp, ReceiptText, Banknote, QrCode } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatNumber, getCurrentDateStr } from '../utils/format';

interface ReportViewProps {
  transactions: Transaction[];
}

export const ReportView: React.FC<ReportViewProps> = ({ transactions }) => {
  const [fromDate, setFromDate] = useState<string>(getCurrentDateStr());
  const [toDate, setToDate] = useState<string>(getCurrentDateStr());
  const [appliedFilter, setAppliedFilter] = useState({
    from: getCurrentDateStr(),
    to: getCurrentDateStr(),
  });

  const handleApplyFilter = () => {
    setAppliedFilter({
      from: fromDate,
      to: toDate,
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      return tx.date >= appliedFilter.from && tx.date <= appliedFilter.to;
    });
  }, [transactions, appliedFilter]);

  // Aggregate metrics
  const totalSales = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalTxCount = filteredTransactions.length;

  const cashSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((acc, t) => acc + t.total, 0);

  const nonCashSales = filteredTransactions
    .filter((t) => t.paymentMethod !== 'CASH')
    .reduce((acc, t) => acc + t.total, 0);

  const transferSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'TRANSFER')
    .reduce((acc, t) => acc + t.total, 0);

  const qrisSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((acc, t) => acc + t.total, 0);

  const lainnyaSales = filteredTransactions
    .filter((t) => t.paymentMethod === 'LAINNYA')
    .reduce((acc, t) => acc + t.total, 0);

  // Rekap Kasir
  const cashierSummary = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    filteredTransactions.forEach((tx) => {
      const current = map.get(tx.cashierName) || { count: 0, total: 0 };
      map.set(tx.cashierName, {
        count: current.count + 1,
        total: current.total + tx.total,
      });
    });
    return Array.from(map.entries()).map(([cashier, data]) => ({
      cashier,
      count: data.count,
      total: data.total,
    }));
  }, [filteredTransactions]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Laporan Penjualan
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Rekap berdasarkan periode.
        </p>
      </div>

      {/* Date Filter Card */}
      <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Dari tanggal
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-[#101013] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#f59e0b] min-w-[180px] cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Sampai tanggal
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-[#101013] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#f59e0b] min-w-[180px] cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={handleApplyFilter}
          className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-7 py-2.5 rounded-xl text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer h-[38px]"
        >
          Tampilkan
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PENJUALAN */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              TOTAL PENJUALAN
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatRupiah(totalSales)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* TRANSAKSI */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              TRANSAKSI
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatNumber(totalTxCount)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <ReceiptText className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* CASH */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              CASH
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatRupiah(cashSales)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>

        {/* NON-CASH */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              NON-CASH
            </span>
            <span className="text-2xl font-black text-white mt-1.5 block">
              {formatRupiah(nonCashSales)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-[#f59e0b]" />
          </div>
        </div>
      </div>

      {/* Two Columns: Metode Pembayaran & Rekap Kasir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Metode Pembayaran */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">
            Metode Pembayaran
          </h2>

          <div className="space-y-4 text-xs divide-y divide-zinc-800/50">
            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-400 font-medium">TRANSFER</span>
              <span className="text-white font-bold">
                {formatRupiah(transferSales)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-400 font-medium">CASH</span>
              <span className="text-white font-bold">
                {formatRupiah(cashSales)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-400 font-medium">LAINNYA</span>
              <span className="text-white font-bold">
                {formatRupiah(lainnyaSales)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-400 font-medium">QRIS</span>
              <span className="text-white font-bold">
                {formatRupiah(qrisSales)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Rekap Kasir */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-bold text-white mb-4">Rekap Kasir</h2>

          {cashierSummary.length === 0 ? (
            <div className="flex-1 min-h-[160px] flex items-center justify-center text-center">
              <p className="text-sm text-zinc-500">Belum ada data.</p>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-zinc-800/50 text-xs">
              {cashierSummary.map((item) => (
                <div
                  key={item.cashier}
                  className="flex items-center justify-between pt-2"
                >
                  <div>
                    <span className="font-bold text-white">{item.cashier}</span>
                    <span className="text-zinc-500 block text-[11px]">
                      {item.count} transaksi
                    </span>
                  </div>
                  <span className="font-bold text-[#f59e0b]">
                    {formatRupiah(item.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
