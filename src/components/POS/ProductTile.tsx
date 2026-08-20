import React, { useState } from 'react';
import type { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Plus, Minus, Flame, X } from 'lucide-react';

interface ProductTileProps {
  product: Product;
  quantityInCart: number;
  onTap: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveAll?: (productId: string) => void;
  isPopular?: boolean;
}

export const ProductTile: React.FC<ProductTileProps> = ({
  product,
  quantityInCart,
  onTap,
  onUpdateQty,
  onRemoveAll,
  isPopular
}) => {
  const { language, t } = useLanguage();
  const { formatAmount } = useCurrency();
  const [imageLoaded, setImageLoaded] = useState<boolean>(true);

  const displayName = language === 'ar' ? product.name_ar || product.name : product.name;
  const secondaryName = language === 'ar' ? product.name : product.name_ar;

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onTap(product)}
      className={`relative group flex flex-col justify-between p-3 rounded-2xl transition-all duration-150 cursor-pointer select-none text-right ${
        isOutOfStock
          ? 'bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 opacity-50 cursor-not-allowed'
          : quantityInCart > 0
          ? 'bg-emerald-50/80 dark:bg-slate-800/90 border-2 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]'
          : isPopular
          ? 'bg-white dark:bg-slate-900/80 hover:bg-amber-50/50 dark:hover:bg-slate-800/90 border border-amber-400/50 dark:border-amber-500/30 hover:border-amber-500 shadow-sm'
          : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Popular Glow Badge */}
      {isPopular && quantityInCart === 0 && (
        <div className="absolute top-2 start-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white dark:text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
          <Flame className="w-3 h-3 fill-current" />
          <span>{t.popular}</span>
        </div>
      )}

      {/* 1-Tap Remove All Quantity X Button */}
      {quantityInCart > 0 && onRemoveAll && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveAll(product.id!);
          }}
          className="absolute top-2 start-2 z-20 bg-rose-600 hover:bg-rose-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all active:scale-90 cursor-pointer"
          title="إلغاء وإزالة جميع الكمية من السلة"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>
      )}

      {/* Cart Quantity Badge */}
      {quantityInCart > 0 && (
        <div className="absolute top-2 end-2 z-10 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce-short">
          x{quantityInCart}
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-2 flex items-center justify-center border border-slate-100 dark:border-slate-800">
        {imageLoaded && product.image_url ? (
          <img
            src={product.image_url}
            alt={displayName}
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-lg">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Product Text Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
            {displayName}
          </h3>
          {secondaryName && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {secondaryName}
            </p>
          )}
        </div>

        {/* Price & Quick Stepper Controls */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight dir-ltr">
              {formatAmount(product.price)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {product.stock_quantity} {t.qty}
            </span>
          </div>

          {/* Stepper (+ / -) if item is in cart */}
          {quantityInCart > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-white dark:bg-slate-950/90 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 dir-ltr z-10 shadow-sm"
            >
              <button
                onClick={() => onUpdateQty(product.id!, -1)}
                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Subtract"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold px-1 min-w-[1.25rem] text-center text-emerald-600 dark:text-emerald-400">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQty(product.id!, 1)}
                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-600 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Add"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
