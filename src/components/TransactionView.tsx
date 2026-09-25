import React, { useState, useMemo } from 'react';
import { FileText, Eye, Download, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, getCurrentDateStr, formatDateIndo } from '../utils/format';

interface TransactionViewProps {
  transactions: Transaction[];
  onViewReceipt: (transaction: Transaction) => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  transactions,
  onViewReceipt,
}) => {
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Semua transaksi yang tersimpan di database.
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

      {/* Transaction Table Card */}
      <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121215] text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Kasir</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {tx.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      {formatDateIndo(tx.date)} {tx.time}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{tx.cashierName}</td>
                    <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">
                      {tx.items
                        .map((i) => `${i.productName} (${i.variantName}) x${i.quantity}`)
                        .join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium text-[10px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#f59e0b] whitespace-nowrap">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(tx)}
                        className="p-2 rounded-lg bg-[#101013] hover:bg-zinc-800 border border-zinc-800 text-[#f59e0b] hover:text-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
