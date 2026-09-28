import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';
import { Transaction, ReceiptTemplate, PrinterSettings } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';

interface ReceiptModalProps {
  transaction: Transaction | null;
  template: ReceiptTemplate;
  printerSettings: PrinterSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  template,
  printerSettings,
  onClose,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[#18181c] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center mx-auto mb-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Transaksi Selesai
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {transaction.invoiceNumber}
          </p>
        </div>

        {/* Thermal Receipt Paper Canvas */}
        <div
          id="printable-receipt"
          className="w-full bg-white text-black p-5 rounded-md font-mono text-[11px] leading-snug shadow-md border border-zinc-300 select-text"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-400">
            <h4 className="font-bold text-xs uppercase tracking-tight">
              {template.storeName}
            </h4>
            <p className="text-[10px] text-zinc-700">{template.tagline}</p>
            <p className="text-[10px] text-zinc-700">{template.address}</p>
            <p className="text-[10px] text-zinc-700">Telp: {template.phone}</p>
          </div>

          {/* Info */}
          <div className="py-2 border-b border-dashed border-zinc-400 text-[10px] text-zinc-700 space-y-0.5">
            <div className="flex justify-between">
              <span>{transaction.invoiceNumber}</span>
              <span>
                {formatDateIndo(transaction.date)} {transaction.time}
              </span>
            </div>
            {template.showCashier && (
              <div className="flex justify-between">
                <span>Kasir: {transaction.cashierName}</span>
                <span>Metode: {transaction.paymentMethod}</span>
              </div>
            )}
            {transaction.bankAccountInfo && (
              <div className="text-[10px] text-zinc-700">
                <span>Tujuan: {transaction.bankAccountInfo}</span>
              </div>
            )}
            {transaction.notes && (
              <div className="text-[10px] text-zinc-700">
                <span>Catatan: {transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="py-2 border-b border-dashed border-zinc-400 space-y-1.5">
            {transaction.items.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-semibold">
                  <span className="truncate pr-2">
                    {item.productName} ({item.variantName})
                  </span>
                  <span>{formatRupiah(item.price * item.quantity)}</span>
                </div>
                <div className="text-[10px] text-zinc-600">
                  {item.quantity} x {formatRupiah(item.price)}
                  {item.note ? ` (${item.note})` : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-zinc-300">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1">
              <span>Bayar ({transaction.paymentMethod})</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </div>

          {/* Footer Note */}
          {template.footerNote && (
            <div className="pt-3 text-center text-[10px] text-zinc-700 whitespace-pre-line">
              {template.footerNote}
            </div>
          )}

          {/* Logo Footer Bawah Struk */}
          {template.footerLogo && template.showFooterLogo !== false && (
            <div className="pt-3 pb-1 flex flex-col items-center justify-center border-t border-dotted border-zinc-300 mt-2">
              <img
                src={template.footerLogo}
                alt="Logo Footer Struk"
                className="max-h-16 max-w-[160px] object-contain filter grayscale contrast-125 mx-auto"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#121215] hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
