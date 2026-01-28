'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { FlavorSelection, CartState, COOKIES_PER_DOZEN, HALF_DOZEN } from '@/types/cart';

interface CartContextType {
  dozens: CartState['dozens'];
  flavors: FlavorSelection[];
  packaging: CartState['packaging'];
  setDozens: (dozens: CartState['dozens']) => void;
  addHalfDozen: (flavor: string, label: string) => void;
  removeHalfDozen: (flavor: string) => void;
  clearFlavors: () => void;
  clearCart: () => void;
  setPackaging: (packaging: CartState['packaging']) => void;
  totalCookies: number;
  targetCookies: number;
  remainingCookies: number;
  isComplete: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'bakes-cookie-cart';
const EXPIRY_HOURS = 24;

interface StoredCart {
  state: CartState;
  expiry: number;
}

function getStoredCart(): CartState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredCart = JSON.parse(stored);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validate the stored state has the expected structure
    const state = parsed.state;
    if (!state || !Array.isArray(state.flavors)) {
      // Old format or corrupted - clear it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return state;
  } catch {
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function storeCart(state: CartState): void {
  if (typeof window === 'undefined') return;

  const stored: StoredCart = {
    state,
    expiry: Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

const defaultState: CartState = {
  dozens: null,
  flavors: [],
  packaging: 'standard',
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<CartState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredCart();
    if (stored) {
      setCartState(stored);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (isHydrated) {
      storeCart(cartState);
    }
  }, [cartState, isHydrated]);

  const setDozens = useCallback((dozens: CartState['dozens']) => {
    setCartState((prev) => {
      // If reducing dozens, we may need to trim flavors
      const targetCookies = dozens ? dozens * COOKIES_PER_DOZEN : 0;
      let newFlavors = prev.flavors;

      // Calculate current total
      const currentTotal = prev.flavors.reduce((sum, f) => sum + f.quantity, 0);

      // If current exceeds new target, clear flavors
      if (currentTotal > targetCookies) {
        newFlavors = [];
      }

      return {
        ...prev,
        dozens,
        flavors: newFlavors,
      };
    });
  }, []);

  const addHalfDozen = useCallback((flavor: string, label: string) => {
    setCartState((prev) => {
      if (!prev.dozens) return prev;

      const targetCookies = prev.dozens * COOKIES_PER_DOZEN;
      const currentTotal = prev.flavors.reduce((sum, f) => sum + f.quantity, 0);

      // Can't add if already at target
      if (currentTotal >= targetCookies) return prev;

      const existing = prev.flavors.find((f) => f.flavor === flavor);

      if (existing) {
        return {
          ...prev,
          flavors: prev.flavors.map((f) =>
            f.flavor === flavor ? { ...f, quantity: f.quantity + HALF_DOZEN } : f
          ),
        };
      } else {
        return {
          ...prev,
          flavors: [...prev.flavors, { flavor, label, quantity: HALF_DOZEN }],
        };
      }
    });
  }, []);

  const removeHalfDozen = useCallback((flavor: string) => {
    setCartState((prev) => {
      const existing = prev.flavors.find((f) => f.flavor === flavor);
      if (!existing) return prev;

      if (existing.quantity <= HALF_DOZEN) {
        // Remove entirely
        return {
          ...prev,
          flavors: prev.flavors.filter((f) => f.flavor !== flavor),
        };
      } else {
        // Reduce by half dozen
        return {
          ...prev,
          flavors: prev.flavors.map((f) =>
            f.flavor === flavor ? { ...f, quantity: f.quantity - HALF_DOZEN } : f
          ),
        };
      }
    });
  }, []);

  const clearFlavors = useCallback(() => {
    setCartState((prev) => ({
      ...prev,
      flavors: [],
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartState(defaultState);
  }, []);

  const setPackaging = useCallback((value: CartState['packaging']) => {
    setCartState((prev) => ({
      ...prev,
      packaging: value,
    }));
  }, []);

  const totalCookies = cartState.flavors.reduce((sum, f) => sum + f.quantity, 0);
  const targetCookies = cartState.dozens ? cartState.dozens * COOKIES_PER_DOZEN : 0;
  const remainingCookies = targetCookies - totalCookies;
  const isComplete = cartState.dozens !== null && totalCookies === targetCookies;

  return (
    <CartContext.Provider
      value={{
        dozens: cartState.dozens,
        flavors: cartState.flavors,
        packaging: cartState.packaging,
        setDozens,
        addHalfDozen,
        removeHalfDozen,
        clearFlavors,
        clearCart,
        setPackaging,
        totalCookies,
        targetCookies,
        remainingCookies,
        isComplete,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
