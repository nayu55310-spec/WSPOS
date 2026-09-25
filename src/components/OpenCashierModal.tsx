import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OpenCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (initialAmount: number) => void;
}

export const OpenCashierModal: React.FC<OpenCashierModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [initialCash, setInitialCash] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(initialCash) || 0;
    onConfirm(amount);
    setInitialCash('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => {
            setInitialCash('');
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Buka Kasir
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Masukkan saldo awal cash drawer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Saldo Awal (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              placeholder="Contoh: 100000 (kosongkan jika 0)"
              className="w-full bg-[#101013] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            BUKA KASIR
          </button>
        </form>
      </div>
    </div>
  );
};
