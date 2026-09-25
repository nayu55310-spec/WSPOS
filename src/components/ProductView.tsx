import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { formatRupiah } from '../utils/format';

interface ProductViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onToggleProductStatus: (productId: string) => void;
}

export const ProductView: React.FC<ProductViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onToggleProductStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: 'v_1', name: '', price: 0 },
  ]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('');
    setVariants([
      { id: `v_${Date.now()}_1`, name: '', price: 0 },
    ]);
    setIsModalOpen(true);
  };

  const handleClearVariants = () => {
    setVariants([
      { id: `v_${Date.now()}_1`, name: '', price: 0 },
    ]);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setVariants(
      product.variants.map((v) => ({ ...v }))
    );
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setVariants([
      ...variants,
      { id: `v_${Date.now()}_${Math.random()}`, name: '', price: 0 },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleVariantChange = (
    index: number,
    field: 'name' | 'price',
    value: string | number
  ) => {
    const updated = [...variants];
    if (field === 'price') {
      updated[index].price = Number(value) || 0;
    } else {
      updated[index].name = String(value);
    }
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    const validVariants = variants
      .filter((v) => v.name.trim().length > 0)
      .map((v, idx) => ({
        id: v.id || `v_${idx}_${Date.now()}`,
        name: v.name.trim(),
        price: Number(v.price) || 0,
      }));

    if (validVariants.length === 0) {
      validVariants.push({ id: `v_${Date.now()}`, name: 'Regular', price: 0 });
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: name.trim(),
        category: category.trim(),
        variants: validVariants,
      });
    } else {
      onAddProduct({
        id: `prod_${Date.now()}`,
        name: name.trim(),
        category: category.trim(),
        status: 'active',
        variants: validVariants,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Produk
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Kelola produk dan varian tanpa stok.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {product.category}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    product.status === 'active'
                      ? 'bg-[#12281b] text-emerald-400 border-emerald-800/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {/* Variants List */}
              <div className="space-y-2.5 my-4 border-t border-b border-zinc-800/50 py-3">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-300">{v.name}</span>
                    <span className="text-white font-bold">
                      {formatRupiah(v.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => openEditModal(product)}
                className="py-2.5 rounded-xl text-xs font-semibold bg-[#101013] hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors text-center cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleProductStatus(product.id)}
                className={`py-2.5 rounded-xl text-xs font-semibold bg-[#101013] hover:bg-zinc-800 border border-zinc-800 transition-colors text-center cursor-pointer ${
                  product.status === 'active'
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                {product.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Satu produk dapat memiliki banyak varian.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Terbul cokelat"
                  className="w-full bg-[#101013] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Terang bulan"
                  className="w-full bg-[#101013] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
                  required
                />
              </div>

              {/* Variants Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Varian Produk & Harga
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearVariants}
                      className="text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Bersihkan
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="text-xs font-bold text-[#f59e0b] hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      + Tambah Varian
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={v.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) =>
                          handleVariantChange(idx, 'name', e.target.value)
                        }
                        placeholder="Nama varian (contoh: Regular, Jumbo, Coklat)"
                        className="flex-1 bg-[#101013] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.price === 0 ? '' : v.price}
                        onChange={(e) =>
                          handleVariantChange(idx, 'price', e.target.value)
                        }
                        placeholder="Harga (Rp)"
                        className="w-32 bg-[#101013] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        disabled={variants.length <= 1}
                        className={`p-2 rounded-xl border border-zinc-800 bg-[#101013] text-zinc-400 hover:text-red-400 ${
                          variants.length <= 1
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                        title="Hapus varian ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
              >
                SIMPAN PRODUK
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
