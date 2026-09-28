import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Clock,
  UserCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ChevronDown,
  ChevronUp,
  Bluetooth,
  Check,
} from 'lucide-react';
import {
  CashDrawerSession,
  Transaction,
  ReceiptTemplate,
  PrinterSettings,
  ShiftSummaryReport,
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import { useBluetoothPrinter } from '../hooks/useBluetoothPrinter';

interface CloseCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: (report: ShiftSummaryReport) => void;
  cashDrawer: CashDrawerSession;
  transactions: Transaction[];
  template: ReceiptTemplate;
  printerSettings?: PrinterSettings;
}

export const CloseCashierModal: React.FC<CloseCashierModalProps> = ({
  isOpen,
  onClose,
  onConfirmClose,
  cashDrawer,
  transactions,
  template,
  printerSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'receipt'>('summary');
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [isTxListExpanded, setIsTxListExpanded] = useState(false);
  const [btFeedback, setBtFeedback] = useState<string | null>(null);

  const {
    status: btStatus,
    deviceInfo: btDeviceInfo,
    isPrinting,
    connectBluetooth,
    printShiftReport,
  } = useBluetoothPrinter();

  const activePrinterSettings: PrinterSettings = printerSettings || {
    printerName: 'Thermal Bluetooth POS',
    connectionType: 'Bluetooth',
    paperWidth: '58 mm',
    orientation: 'Portrait',
    copies: 1,
    margin: '0 mm',
    autoPrint: true,
    autoCut: true,
    beepAfterPrint: true,
    ipAddress: '',
    port: '',
  };

  // Filter transactions created during this active cashier session
  const sessionTransactions = useMemo(() => {
    if (!cashDrawer.isOpen) return [];

    const openedTimestamp = cashDrawer.openedTimestamp || 
      (cashDrawer.openedAt ? new Date(cashDrawer.openedAt).getTime() : 0);

    // If we have openedTimestamp, filter transactions that occurred after drawer opened
    if (openedTimestamp > 0) {
      const filtered = transactions.filter((tx) => {
        // Parse transaction timestamp
        const txTimestamp = Number(tx.id.replace('tx_', '')) || 
          new Date(`${tx.date}T${tx.time}`).getTime();
        
        // Include transaction if it occurred within 1 minute before/after opened or afterwards
        return txTimestamp >= openedTimestamp - 60000;
      });

      // If no transactions matched by timestamp (e.g. initial demo data or clock discrepancy),
      // match all transactions with today's date so user still sees full data in this demo session
      if (filtered.length === 0 && transactions.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTxs = transactions.filter((tx) => tx.date === todayStr);
        return todayTxs.length > 0 ? todayTxs : transactions;
      }
      return filtered;
    }

    return transactions;
  }, [cashDrawer, transactions]);

  // Aggregate metrics
  const totalSales = useMemo(() => {
    return sessionTransactions.reduce((acc, tx) => acc + tx.total, 0);
  }, [sessionTransactions]);

  const totalItemsSold = useMemo(() => {
    return sessionTransactions.reduce((acc, tx) => {
      const itemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc + itemsCount;
    }, 0);
  }, [sessionTransactions]);

  const cashSales = useMemo(() => {
    return sessionTransactions
      .filter((tx) => tx.paymentMethod === 'CASH')
      .reduce((acc, tx) => acc + tx.total, 0);
  }, [sessionTransactions]);

  const cashTxCount = useMemo(() => {
    return sessionTransactions.filter((tx) => tx.paymentMethod === 'CASH').length;
  }, [sessionTransactions]);

  const qrisSales = useMemo(() => {
    return sessionTransactions
      .filter((tx) => tx.paymentMethod === 'QRIS')
      .reduce((acc, tx) => acc + tx.total, 0);
  }, [sessionTransactions]);

  const qrisTxCount = useMemo(() => {
    return sessionTransactions.filter((tx) => tx.paymentMethod === 'QRIS').length;
  }, [sessionTransactions]);

  const transferSales = useMemo(() => {
    return sessionTransactions
      .filter((tx) => tx.paymentMethod === 'TRANSFER')
      .reduce((acc, tx) => acc + tx.total, 0);
  }, [sessionTransactions]);

  const transferTxCount = useMemo(() => {
    return sessionTransactions.filter((tx) => tx.paymentMethod === 'TRANSFER').length;
  }, [sessionTransactions]);

  const otherSales = useMemo(() => {
    return sessionTransactions
      .filter((tx) => tx.paymentMethod === 'LAINNYA')
      .reduce((acc, tx) => acc + tx.total, 0);
  }, [sessionTransactions]);

  const otherTxCount = useMemo(() => {
    return sessionTransactions.filter((tx) => tx.paymentMethod === 'LAINNYA').length;
  }, [sessionTransactions]);

  const initialCash = cashDrawer.initialCash || 0;
  const expectedCashInDrawer = initialCash + cashSales;

  // Actual physical cash count entered by cashier
  const actualCashInDrawer = actualCashInput === '' 
    ? expectedCashInDrawer 
    : Number(actualCashInput) || 0;

  const cashDifference = actualCashInDrawer - expectedCashInDrawer;

  const openedAtFormatted = useMemo(() => {
    if (!cashDrawer.openedAt) return '-';
    try {
      const d = new Date(cashDrawer.openedAt);
      return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return cashDrawer.openedAt;
    }
  }, [cashDrawer.openedAt]);

  const closedAtFormatted = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  if (!isOpen) return null;

  const generateShiftReportData = (): ShiftSummaryReport => ({
    openedAt: cashDrawer.openedAt || new Date().toISOString(),
    closedAt: new Date().toISOString(),
    openedBy: cashDrawer.openedBy || 'Kasir',
    initialCash,
    totalTransactions: sessionTransactions.length,
    totalItemsSold,
    cashSales,
    qrisSales,
    transferSales,
    otherSales,
    totalSales,
    expectedCashInDrawer,
    actualCashInDrawer,
    cashDifference,
    transactions: sessionTransactions,
  });

  const handlePrintBluetooth = async () => {
    setBtFeedback(null);
    if (btStatus !== 'connected') {
      const ok = await connectBluetooth();
      if (!ok) {
        setBtFeedback('Printer Bluetooth belum tersambung.');
        return;
      }
    }
    const report = generateShiftReportData();
    const success = await printShiftReport(report, template, activePrinterSettings);
    if (success) {
      setBtFeedback('Struk rekap shift berhasil dicetak via Bluetooth!');
      setTimeout(() => setBtFeedback(null), 4000);
    } else {
      setBtFeedback('Gagal mencetak. Coba cek kertas atau gunakan cetak browser.');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleFinalClose = () => {
    const report = generateShiftReportData();
    onConfirmClose(report);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#141417] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#18181d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f59e0b]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Tutup Kasir & Rekap Shift
              </h3>
              <p className="text-xs text-zinc-400">
                Selesaikan sesi kasir dan verifikasi ringkasan seluruh transaksi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-1 border-b border-zinc-800/80 bg-[#121215] flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Ringkasan & Kas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Daftar Transaksi ({sessionTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'receipt'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Pratinjau Struk Rekap
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'summary' && (
            <>
              {/* Session Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#18181c] border border-zinc-800/80 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-zinc-500 font-medium">Kasir Bertugas</div>
                    <div className="text-zinc-200 font-semibold">{cashDrawer.openedBy || 'Kasir'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-zinc-500 font-medium">Waktu Buka</div>
                    <div className="text-zinc-200 font-semibold">{openedAtFormatted}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <div>
                    <div className="text-zinc-500 font-medium">Waktu Tutup</div>
                    <div className="text-zinc-200 font-semibold">{closedAtFormatted}</div>
                  </div>
                </div>
              </div>

              {/* Main KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 font-medium mb-1">Total Transaksi</div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    {sessionTransactions.length} <span className="text-xs font-normal text-zinc-400">nota</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{totalItemsSold} item terjual</div>
                </div>

                <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 font-medium mb-1">Total Omset</div>
                  <div className="text-xl font-bold text-[#f59e0b] tracking-tight">
                    {formatRupiah(totalSales)}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Semua metode bayar</div>
                </div>

                <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 font-medium mb-1">Saldo Awal Kas</div>
                  <div className="text-xl font-bold text-zinc-200 tracking-tight">
                    {formatRupiah(initialCash)}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Modal kas di laci</div>
                </div>

                <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 font-medium mb-1">Target Kas di Laci</div>
                  <div className="text-xl font-bold text-emerald-400 tracking-tight">
                    {formatRupiah(expectedCashInDrawer)}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Modal + Tunai Masuk</div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Rincian Penjualan per Metode Pembayaran
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CASH */}
                  <div className="bg-[#111114] border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Tunai (Cash)</div>
                        <div className="text-[11px] text-zinc-500">{cashTxCount} transaksi</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      {formatRupiah(cashSales)}
                    </div>
                  </div>

                  {/* QRIS */}
                  <div className="bg-[#111114] border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">QRIS</div>
                        <div className="text-[11px] text-zinc-500">{qrisTxCount} transaksi</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      {formatRupiah(qrisSales)}
                    </div>
                  </div>

                  {/* TRANSFER */}
                  <div className="bg-[#111114] border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Transfer Bank</div>
                        <div className="text-[11px] text-zinc-500">{transferTxCount} transaksi</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      {formatRupiah(transferSales)}
                    </div>
                  </div>

                  {/* LAINNYA */}
                  <div className="bg-[#111114] border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#f59e0b] flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Lainnya</div>
                        <div className="text-[11px] text-zinc-500">{otherTxCount} transaksi</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      {formatRupiah(otherSales)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Cash Reconciliation Card */}
              <div className="bg-gradient-to-br from-[#1b1914] to-[#18181c] border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#f59e0b]" />
                      Verifikasi Uang Kas Fisik di Laci
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Hitung uang fisik di laci kasir untuk mencocokkan dengan target sistem
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Target Kas</div>
                    <div className="text-sm font-bold text-[#f59e0b]">{formatRupiah(expectedCashInDrawer)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Jumlah Uang Fisik Aktual (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={actualCashInput}
                      onChange={(e) => setActualCashInput(e.target.value)}
                      placeholder={expectedCashInDrawer.toString()}
                      className="w-full bg-[#101013] border border-zinc-700 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Kosongkan jika uang fisik pas {formatRupiah(expectedCashInDrawer)}
                    </span>
                  </div>

                  <div className="bg-[#121215] border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
                    <div className="text-xs text-zinc-400 font-medium">Status Selisih Kas:</div>
                    <div className="mt-1 flex items-center gap-2">
                      {cashDifference === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sesuai / Pas (Rp 0)
                        </span>
                      ) : cashDifference > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Lebih {formatRupiah(cashDifference)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Kurang {formatRupiah(Math.abs(cashDifference))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                <span>Daftar {sessionTransactions.length} transaksi dalam sesi ini</span>
                <span className="font-semibold text-white">Total: {formatRupiah(totalSales)}</span>
              </div>

              {sessionTransactions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Belum ada transaksi dalam sesi buka kasir ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {sessionTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between hover:border-zinc-700 transition-colors text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white font-mono">{tx.invoiceNumber}</div>
                        <div className="text-zinc-400">
                          {formatDateIndo(tx.date)} {tx.time} &middot; Kasir: {tx.cashierName}
                        </div>
                        <div className="text-zinc-500 text-[11px]">
                          {tx.items.length} jenis item ({tx.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-bold text-[#f59e0b] font-mono text-sm">
                          {formatRupiah(tx.total)}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.paymentMethod === 'CASH'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.paymentMethod === 'QRIS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="flex flex-col items-center">
              <div
                id="printable-shift-receipt"
                className="w-full max-w-sm bg-white text-black p-5 rounded-lg font-mono text-[11px] leading-relaxed shadow-lg border border-zinc-300 select-text"
              >
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-zinc-400">
                  <h4 className="font-bold text-xs uppercase tracking-tight">
                    {template.storeName}
                  </h4>
                  <p className="text-[10px] text-zinc-700">{template.tagline}</p>
                  <p className="text-[10px] text-zinc-700">{template.address}</p>
                  <p className="text-[10px] text-zinc-700">Telp: {template.phone}</p>
                  <div className="mt-2 pt-1 border-t border-dashed border-zinc-300 font-bold uppercase text-xs">
                    REKAP PENUTUPAN KASIR (SHIFT)
                  </div>
                </div>

                {/* Info */}
                <div className="py-2 border-b border-dashed border-zinc-400 text-[10px] text-zinc-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Kasir Bertugas:</span>
                    <span className="font-bold">{cashDrawer.openedBy || 'Kasir'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu Buka:</span>
                    <span>{openedAtFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu Tutup:</span>
                    <span>{closedAtFormatted}</span>
                  </div>
                </div>

                {/* Sales Totals */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Total Transaksi:</span>
                    <span>{sessionTransactions.length} Struk ({totalItemsSold} item)</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Saldo Awal Kas:</span>
                    <span>{formatRupiah(initialCash)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Penjualan Tunai (Cash):</span>
                    <span>{formatRupiah(cashSales)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Penjualan QRIS:</span>
                    <span>{formatRupiah(qrisSales)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Penjualan Transfer:</span>
                    <span>{formatRupiah(transferSales)}</span>
                  </div>
                  {otherSales > 0 && (
                    <div className="flex justify-between text-zinc-700">
                      <span>Penjualan Lainnya:</span>
                      <span>{formatRupiah(otherSales)}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-dashed border-zinc-300 flex justify-between font-bold text-xs">
                    <span>TOTAL OMSET:</span>
                    <span>{formatRupiah(totalSales)}</span>
                  </div>
                </div>

                {/* Cash Drawer Balance */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Target Kas di Laci:</span>
                    <span>{formatRupiah(expectedCashInDrawer)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Kas Fisik Aktual:</span>
                    <span>{formatRupiah(actualCashInDrawer)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Selisih Kas:</span>
                    <span>
                      {cashDifference === 0
                        ? 'Rp 0 (PAS)'
                        : cashDifference > 0
                        ? `+${formatRupiah(cashDifference)} (LEBIH)`
                        : `-${formatRupiah(Math.abs(cashDifference))} (KURANG)`}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-4 pb-2 text-center text-[10px] text-zinc-700">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div>Kasir,</div>
                      <div className="h-10"></div>
                      <div className="font-bold">({cashDrawer.openedBy || 'Kasir'})</div>
                    </div>
                    <div>
                      <div>Supervisor/Owner,</div>
                      <div className="h-10"></div>
                      <div className="font-bold">( .................... )</div>
                    </div>
                  </div>
                  <p className="mt-4 text-[9px] text-zinc-500">
                    Dicetak otomatis pada {new Date().toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#18181d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintBluetooth}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#f59e0b] hover:bg-[#e09107] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bluetooth className="w-4 h-4" />
              <span>
                {isPrinting
                  ? 'Mencetak...'
                  : btStatus === 'connected'
                  ? 'Cetak Rekap via Bluetooth'
                  : 'Hubungkan & Cetak Bluetooth'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#222228] border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
              title="Cetak lewat dialog cetak browser atau simpan PDF"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Dialog Browser</span>
            </button>

            {btFeedback && (
              <span className="text-[11px] font-semibold text-emerald-400 ml-1">
                {btFeedback}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-transparent border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleFinalClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi & Tutup Kasir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
