import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { Product } from '../../types';
import { syncLocalDBToMongoDB } from '../../services/apiSync';
import { useCurrency } from '../../context/CurrencyContext';
import {
  PackagePlus,
  Search,
  Edit2,
  Trash2,
  X,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const CatalogScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { currencyMode, formatAmount } = useCurrency();
  const [searchTerm, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Product Form State
  const [nameEn, setNameEn] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('pantry');
  const [stock, setStock] = useState<string>('30');
  const [imageUrl, setImageUrl] = useState<string>('');

  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_ar.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setNameEn('');
    setNameAr('');
    setPrice('');
    setCategory('pantry');
    setStock('30');
    setImageUrl('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNameEn(product.name);
    setNameAr(product.name_ar);
    const displayPriceVal = currencyMode === 'RYAL' ? Math.round(product.price * 20) : product.price;
    setPrice(displayPriceVal.toString());
    setCategory(product.category);
    setStock(product.stock_quantity.toString());
    setImageUrl(product.image_url);
    setIsAddModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputPriceVal = parseFloat(price);
    const stockVal = parseInt(stock, 10);

    if (isNaN(inputPriceVal) || inputPriceVal <= 0 || !nameAr.trim()) return;

    // Convert to base MAD for storage if entered in Ryal mode
    const priceVal = currencyMode === 'RYAL' ? inputPriceVal / 20 : inputPriceVal;

    const finalImage =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';

    const finalProduct: Product = editingProduct && editingProduct.id
      ? {
          ...editingProduct,
          name: nameEn.trim() || nameAr.trim(),
          name_ar: nameAr.trim(),
          price: priceVal,
          category,
          stock_quantity: isNaN(stockVal) ? 0 : stockVal,
          image_url: finalImage
        }
      : {
          id: 'prod-' + Date.now(),
          name: nameEn.trim() || nameAr.trim(),
          name_ar: nameAr.trim(),
          price: priceVal,
          category,
          stock_quantity: isNaN(stockVal) ? 30 : stockVal,
          image_url: finalImage,
          times_sold_total: 0,
          times_sold_recent: 0,
          created_at: new Date().toISOString()
        };

    if (editingProduct && editingProduct.id) {
      await db.products.update(editingProduct.id, finalProduct);
    } else {
      await db.products.add(finalProduct);
    }

    // Direct POST to Cloud Server for instant 100% guarantee across all devices
    try {
      await fetch('https://hanut-server.vercel.app/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct)
      });
    } catch (err) {}

    syncLocalDBToMongoDB().catch(() => {});
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm(t.confirm_delete_product)) {
      await db.products.delete(id);
      try {
        await fetch(`https://hanut-server.vercel.app/api/products/${id}`, { method: 'DELETE' });
      } catch (err) {}
      syncLocalDBToMongoDB().catch(() => {});
    }
  };

  const handleQuickRestock = async (id: string, currentStock: number, addAmount: number) => {
    await db.products.update(id, {
      stock_quantity: currentStock + addAmount
    });
  };

  const categories = [
    { id: 'all', label: t.cat_all },
    { id: 'dairy', label: t.cat_dairy },
    { id: 'bakery', label: t.cat_bakery },
    { id: 'drinks', label: t.cat_drinks },
    { id: 'pantry', label: t.cat_pantry },
    { id: 'snacks', label: t.cat_snacks },
    { id: 'hygiene', label: t.cat_hygiene }
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      
      {/* CONTROL BAR */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.search_product}
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Add Product Button */}
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap transition-all"
        >
          <PackagePlus className="w-4 h-4" />
          <span>{t.add_new_product}</span>
        </button>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                : 'bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* PRODUCT CATALOG TABLE / CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
          const name = language === 'ar' ? product.name_ar : product.name;
          const subName = language === 'ar' ? product.name : product.name_ar;

          return (
            <div
              key={product.id}
              className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <img
                  src={product.image_url}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subName}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono dir-ltr">
                      {formatAmount(product.price)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400">{product.stock_quantity} قطعة بالمخزون</span>
                  </div>
                </div>
              </div>

              {/* Quick Restock & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold me-1">تزويد:</span>
                  <button
                    onClick={() => handleQuickRestock(product.id!, product.stock_quantity, 10)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold rounded-lg transition-colors"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => handleQuickRestock(product.id!, product.stock_quantity, 50)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold rounded-lg transition-colors"
                  >
                    +50
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id!)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <PackagePlus className="w-5 h-5" />
                <span>{editingProduct ? t.edit_product : t.add_new_product}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview & Snap/Upload Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative shadow-sm">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                {/* Take Photo Button (Smartphone Camera) */}
                <label className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap">
                  <Camera className="w-4 h-4" />
                  <span>التقاط صورة 📸</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                {/* Upload Photo Button (Gallery) */}
                <label className="flex-1 px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>معرض الصور 📁</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.product_name_ar} *</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: زيت سيوف 5L"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.product_name_en}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Example: SIOF Oil 5L"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  السعر بـ ({currencyMode === 'RYAL' ? 'الريال Ryal' : 'الدرهم MAD'}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="83.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.category}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="pantry">{t.cat_pantry}</option>
                  <option value="dairy">{t.cat_dairy}</option>
                  <option value="bakery">{t.cat_bakery}</option>
                  <option value="drinks">{t.cat_drinks}</option>
                  <option value="snacks">{t.cat_snacks}</option>
                  <option value="hygiene">{t.cat_hygiene}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.stock_quantity}</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">مسار/رابط الصورة (اختياري)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/products/siof_5l.png"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
