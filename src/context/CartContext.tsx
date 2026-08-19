import React, { createContext, useContext, useState } from 'react';
import type { CartItem, Product } from '../types';

interface TapHistoryEntry {
  cartId: string;
  productId: string;
}

interface CartContextType {
  activeCartId: string;
  setActiveCartId: (id: string) => void;
  carts: Record<string, CartItem[]>;
  activeCart: CartItem[];
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  undoLastTap: () => void;
  clearActiveCart: () => void;
  clearAllCarts: () => void;
  activeCartTotal: number;
  activeCartItemCount: number;
  canUndo: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCartId, setActiveCartId] = useState<string>('cart-1');
  const [carts, setCarts] = useState<Record<string, CartItem[]>>({
    'cart-1': [],
    'cart-2': [],
    'cart-3': []
  });

  // Tap history stack for Undo feature
  const [historyStack, setHistoryStack] = useState<TapHistoryEntry[]>([]);

  const activeCart = carts[activeCartId] || [];

  const addItem = (product: Product) => {
    if (!product.id) return;
    const productId = product.id;

    setCarts((prev) => {
      const currentCart = prev[activeCartId] || [];
      const existingIndex = currentCart.findIndex((item) => item.product.id === productId);

      let updatedCart: CartItem[];
      if (existingIndex >= 0) {
        updatedCart = currentCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...currentCart, { product, quantity: 1 }];
      }

      return { ...prev, [activeCartId]: updatedCart };
    });

    setHistoryStack((prev) => [...prev, { cartId: activeCartId, productId }]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCarts((prev) => {
      const currentCart = prev[activeCartId] || [];
      const updatedCart = currentCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { ...prev, [activeCartId]: updatedCart };
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setCarts((prev) => {
      const currentCart = prev[activeCartId] || [];
      if (quantity <= 0) {
        return {
          ...prev,
          [activeCartId]: currentCart.filter((item) => item.product.id !== productId)
        };
      }
      return {
        ...prev,
        [activeCartId]: currentCart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      };
    });
  };

  const removeItem = (productId: string) => {
    setCarts((prev) => ({
      ...prev,
      [activeCartId]: (prev[activeCartId] || []).filter((item) => item.product.id !== productId)
    }));
  };

  const undoLastTap = () => {
    if (historyStack.length === 0) return;

    const lastTap = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setCarts((prev) => {
      const targetCart = prev[lastTap.cartId] || [];
      const existing = targetCart.find((item) => item.product.id === lastTap.productId);

      if (!existing) return prev;

      let updatedCart: CartItem[];
      if (existing.quantity > 1) {
        updatedCart = targetCart.map((item) =>
          item.product.id === lastTap.productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        updatedCart = targetCart.filter((item) => item.product.id !== lastTap.productId);
      }

      return { ...prev, [lastTap.cartId]: updatedCart };
    });
  };

  const clearActiveCart = () => {
    setCarts((prev) => ({
      ...prev,
      [activeCartId]: []
    }));
    // Remove history items related to this cart
    setHistoryStack((prev) => prev.filter((item) => item.cartId !== activeCartId));
  };

  const clearAllCarts = () => {
    setCarts({
      'cart-1': [],
      'cart-2': [],
      'cart-3': []
    });
    setHistoryStack([]);
  };

  const activeCartTotal = activeCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const activeCartItemCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        activeCartId,
        setActiveCartId,
        carts,
        activeCart,
        addItem,
        updateQuantity,
        setQuantity,
        removeItem,
        undoLastTap,
        clearActiveCart,
        clearAllCarts,
        activeCartTotal,
        activeCartItemCount,
        canUndo: historyStack.length > 0
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
