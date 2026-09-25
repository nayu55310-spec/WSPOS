import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Search,
  Coffee,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Building2,
  Copy,
  Check,
  FileText,
  Eye,
  Info,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  CartItem,
  CashDrawerSession,
  Transaction,
  PaymentMethod,
  User,
  PaymentSettings,
} from '../types';
import { formatRupiah, generateInvoiceNumber } from '../utils/format';

interface PosViewProps {
  products: Product[];
  cashDrawer: CashDrawerSession;
  currentUser: User;
  paymentSettings: PaymentSettings;
  onOpenCashierClick: () => void;
  onCloseCashierClick: () => void;
  onCompleteTransaction: (transaction: Transaction) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  cashDrawer,
  currentUser,
  paymentSettings,
  onOpenCashierClick,
  onCloseCashierClick,
  onCompleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Variant selection modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNote, setModalNote] = useState('');

  // Payment checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number | string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isZoomingQr, setIsZoomingQr] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['Semua', ...cats];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      const matchesCategory =
        selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const total = subtotal;

  // Change / kembalian calculation
  const numericCashGiven = Number(cashGiven) || 0;
  const change = Math.max(0, numericCashGiven - total);
  const isCashSufficient = paymentMethod !== 'CASH' || numericCashGiven >= total;

  // Open variant modal
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    if (product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setModalQuantity(1);
    setModalNote('');
  };

  // Add to cart from modal
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) return;

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === selectedProduct.id &&
        item.variantId === selectedVariant.id &&
        (item.note || '') === modalNote.trim()
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += modalQuantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        quantity: modalQuantity,
        note: modalNote.trim() || undefined,
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCart(updated);
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashGiven(total);
    const defaultBank =
      paymentSettings.transfer.accounts.find((a) => a.isDefault) ||
      paymentSettings.transfer.accounts[0];
    setSelectedBankId(defaultBank?.id || '');
    setPaymentNote(paymentSettings.other.defaultNote || '');
    setIsCheckoutOpen(true);
  };

  const handleCopyPosBank = (accNumber: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const handleProcessTransaction = () => {
    if (!isCashSufficient) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    let bankAccountInfo: string | undefined = undefined;
    if (paymentMethod === 'TRANSFER') {
      const bank =
        paymentSettings.transfer.accounts.find((a) => a.id === selectedBankId) ||
        paymentSettings.transfer.accounts[0];
      if (bank) {
        bankAccountInfo = `${bank.bankName} ${bank.accountNumber} a/n ${bank.accountHolder}`;
      }
    }

    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      date: dateStr,
      time: timeStr,
      cashierName: currentUser.name,
      cashierUsername: currentUser.username,
      items: [...cart],
      subtotal,
      discount: 0,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'CASH' ? numericCashGiven : total,
      change: paymentMethod === 'CASH' ? change : 0,
      bankAccountInfo,
      notes: paymentNote.trim() || undefined,
    };

    onCompleteTransaction(transaction);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // If cashier is closed, render Image 3 (Kasir Belum Dibuka)
  if (!cashDrawer.isOpen) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-[#18181c] border border-zinc-800/90 rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-[#f59e0b] flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8 text-black stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Kasir Belum Dibuka
          </h2>
          <p className="text-sm text-zinc-400 mt-2 mb-8 max-w-xs">
            Masukkan saldo awal untuk memulai transaksi.
          </p>

          <button
            type="button"
            onClick={onOpenCashierClick}
            className="w-full max-w-xs bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
          >
            BUKA KASIR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Products Column */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-zinc-800/80">
        {/* Search & Category Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-[#18181c] border border-zinc-800/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#f59e0b] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#18181c] text-white border border-zinc-700'
                    : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-zinc-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onCloseCashierClick}
            title="Tutup Sesi Kasir & Rekap Transaksi"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition-colors whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Tutup Kasir</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const minPrice = Math.min(...product.variants.map((v) => v.price));
            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-[#18181c] hover:bg-[#202026] border border-zinc-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#282417] border border-amber-500/20 flex items-center justify-center mb-3.5 group-hover:bg-[#f59e0b] group-hover:text-black transition-colors">
                  <Coffee className="w-5 h-5 text-[#f59e0b] group-hover:text-black transition-colors" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight group-hover:text-[#f59e0b] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {product.category} &middot; {product.variants.length} varian
                  </p>
                  <p className="text-xs text-zinc-300 font-semibold mt-2">
                    Mulai {formatRupiah(minPrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center text-zinc-500 text-sm">
            Tidak ada produk ditemukan.
          </div>
        )}
      </div>

      {/* Cart Column (Right) */}
      <div className="w-80 lg:w-96 bg-[#18181c] flex flex-col justify-between shrink-0">
        {/* Cart Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Keranjang</h2>
            <span className="text-xs text-zinc-400">{totalItemsCount} item</span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <p className="text-sm font-semibold text-zinc-400">
                Keranjang masih kosong.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Pilih produk untuk mulai.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#121215] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {item.productName}
                    </h4>
                    <span className="text-xs text-[#f59e0b] font-medium">
                      {item.variantName} &middot; {formatRupiah(item.price)}
                    </span>
                    {item.note && (
                      <p className="text-[11px] text-zinc-400 italic mt-0.5">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCartItem(idx)}
                    className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                  <span className="text-xs font-bold text-white">
                    {formatRupiah(item.price * item.quantity)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, -1)}
                      className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, 1)}
                      className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom / Pay */}
        <div className="p-5 border-t border-zinc-800/80 bg-[#141417]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-black text-white mb-4">
            <span>Total</span>
            <span className="text-[#f59e0b]">{formatRupiah(total)}</span>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
              cart.length > 0
                ? 'bg-[#f59e0b] hover:bg-[#e09107] text-black active:scale-[0.98]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            BAYAR
          </button>
        </div>
      </div>

      {/* Modal Variant Selector */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedProduct.category} &middot; Pilih varian dan jumlah
              </p>
            </div>

            {/* Variants Grid */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-semibold text-zinc-300">
                Pilih Varian
              </label>
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#282417] border-[#f59e0b] text-white'
                          : 'bg-[#101013] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.name}</div>
                      <div className="text-xs text-[#f59e0b] font-semibold mt-1">
                        {formatRupiah(v.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Jumlah
              </label>
              <div className="flex items-center gap-4 bg-[#101013] border border-zinc-800 rounded-xl p-2 w-fit">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white w-8 text-center">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="Contoh: Kurang manis, tanpa meses, dll."
                className="w-full bg-[#101013] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
            >
              TAMBAH KE KERANJANG &middot;{' '}
              {formatRupiah((selectedVariant?.price || 0) * modalQuantity)}
            </button>
          </div>
        </div>
      )}

      {/* Checkout / Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Pembayaran
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Total Tagihan:{' '}
                <span className="text-[#f59e0b] font-bold">
                  {formatRupiah(total)}
                </span>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {(['CASH', 'QRIS', 'TRANSFER', 'LAINNYA'] as PaymentMethod[]).map(
                (method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#f59e0b] text-black shadow-md'
                          : 'bg-[#101013] text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  );
                }
              )}
            </div>

            {/* Cash Payment Flow */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Uang Diterima
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#101013] border border-zinc-800 rounded-xl px-4 py-3 text-base font-bold text-white focus:outline-none focus:border-[#f59e0b]"
                    autoFocus
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashGiven(total)}
                    className="py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000, 150000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashGiven(amt)}
                      className="py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>

                {/* Change */}
                <div className="p-3 bg-[#101013] border border-zinc-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">
                    Kembalian
                  </span>
                  <span
                    className={`text-base font-black ${
                      change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatRupiah(change)}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS Payment Flow */}
            {paymentMethod === 'QRIS' && (
              <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 mb-5 text-center space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#f59e0b]" />
                      {paymentSettings.qris.merchantName || 'QRIS Dinamis / Statis'}
                    </h4>
                    {paymentSettings.qris.nmid && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        NMID: {paymentSettings.qris.nmid}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    Siap Scan
                  </span>
                </div>

                {paymentSettings.qris.qrImageUrl ? (
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => setIsZoomingQr(true)}
                      className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group relative"
                      title="Klik untuk memperbesar Barcode QRIS"
                    >
                      <img
                        src={paymentSettings.qris.qrImageUrl}
                        alt="QRIS Barcode"
                        className="w-40 h-40 object-contain mx-auto rounded"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                        <Eye className="w-4 h-4" />
                        Perbesar
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Arahkan kamera pelanggan ke barcode di atas
                    </p>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-[#f59e0b]">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-semibold text-zinc-300">
                      Barcode QRIS Belum Diunggah
                    </div>
                    <p className="text-[11px] text-zinc-500 max-w-xs leading-normal">
                      Anda dapat mengunggah foto / file barcode QRIS toko Anda melalui menu{' '}
                      <strong className="text-zinc-400">Pengaturan &gt; Jenis Transaksi</strong>.
                    </p>
                  </div>
                )}

                {paymentSettings.qris.instructions && (
                  <p className="text-[10px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60 text-left">
                    {paymentSettings.qris.instructions}
                  </p>
                )}
              </div>
            )}

            {/* Transfer Bank Flow */}
            {paymentMethod === 'TRANSFER' && (
              <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#f59e0b]" />
                    Transfer Bank / E-Wallet
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {paymentSettings.transfer.accounts.length} Rekening
                  </span>
                </div>

                {paymentSettings.transfer.accounts.length > 0 ? (
                  <>
                    {paymentSettings.transfer.accounts.length > 1 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Pilih Rekening Tujuan:
                        </label>
                        <select
                          value={selectedBankId}
                          onChange={(e) => setSelectedBankId(e.target.value)}
                          className="w-full bg-[#18181c] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          {paymentSettings.transfer.accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.bankName} - {acc.accountNumber} ({acc.accountHolder})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(() => {
                      const currentBank =
                        paymentSettings.transfer.accounts.find(
                          (a) => a.id === selectedBankId
                        ) || paymentSettings.transfer.accounts[0];
                      if (!currentBank) return null;

                      return (
                        <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-zinc-400">
                              Bank / E-Wallet:
                            </span>
                            <span className="text-xs font-bold text-[#f59e0b] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {currentBank.bankName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[#121215] p-2.5 rounded-lg border border-zinc-800">
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                Nomor Rekening
                              </div>
                              <div className="text-sm font-mono font-bold text-white tracking-wide">
                                {currentBank.accountNumber}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPosBank(currentBank.accountNumber)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedBank ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 text-[11px]">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                  <span className="text-[11px]">Salin</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-zinc-500">Atas Nama:</span>
                            <span className="font-bold text-zinc-200">
                              {currentBank.accountHolder}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {paymentSettings.transfer.instructions && (
                      <p className="text-[10px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                        {paymentSettings.transfer.instructions}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-zinc-400">
                    Belum ada rekening bank yang dikonfigurasi. Anda dapat menambahkannya di menu Pengaturan.
                  </div>
                )}

                {/* Optional Note / Reference */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#f59e0b]" />
                    Nomor Referensi / Catatan Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Contoh: Ref# 9823901 / Nama Pengirim"
                    className="w-full bg-[#18181c] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Lainnya Payment Flow */}
            {paymentMethod === 'LAINNYA' && (
              <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#f59e0b]" />
                    Pembayaran Lainnya & Catatan
                  </div>
                  <span className="text-[10px] font-semibold text-[#f59e0b] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Kustom
                  </span>
                </div>

                {paymentSettings.other.instructions && (
                  <p className="text-[10px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                    {paymentSettings.other.instructions}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Catatan Transaksi / Keterangan Pembayaran</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Wajib/Opsional</span>
                  </label>
                  <textarea
                    rows={3}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder={
                      paymentSettings.other.notePlaceholder ||
                      'Contoh: Pesanan GrabFood #GF-8821 / GoFood / EDC Mandiri / Piutang'
                    }
                    className="w-full bg-[#18181c] border border-zinc-800 focus:border-[#f59e0b] rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Catatan ini akan disimpan ke data transaksi dan tercetak pada struk thermal.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Transaction */}
            <button
              type="button"
              disabled={!isCashSufficient}
              onClick={handleProcessTransaction}
              className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                isCashSufficient
                  ? 'bg-[#f59e0b] hover:bg-[#e09107] text-black active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              PROSES TRANSAKSI
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen QR Code Preview from POS */}
      {isZoomingQr && paymentSettings.qris.qrImageUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#18181c] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#f59e0b]" />
                {paymentSettings.qris.merchantName || 'Barcode QRIS'}
              </h3>
              <button
                type="button"
                onClick={() => setIsZoomingQr(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
              <img
                src={paymentSettings.qris.qrImageUrl}
                alt="Barcode QRIS"
                className="w-64 h-64 object-contain mx-auto rounded"
              />
            </div>

            <div className="text-xs text-zinc-300 font-medium">
              Total Tagihan:{' '}
              <strong className="text-[#f59e0b]">{formatRupiah(total)}</strong>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomingQr(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#e09107] text-black transition-colors cursor-pointer"
            >
              Tutup Barcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
