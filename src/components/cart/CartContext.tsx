'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { FlavorSelection, CartState, COOKIES_PER_DOZEN, HALF_DOZEN, DOUBLE_COUNT_FLAVOR } from '@/types/cart';

// Helper to calculate the "cookie cost" of a flavor (lemon shortbread counts as 2x)
function getCookieCost(flavor: string, quantity: number): number {
  return flavor === DOUBLE_COUNT_FLAVOR ? quantity * 2 : quantity;
}

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
  getCookieCostForFlavor: (flavor: string, quantity: number) => number;
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

      // Calculate current total (accounting for double-count flavors)
      const currentTotal = prev.flavors.reduce((sum, f) => sum + getCookieCost(f.flavor, f.quantity), 0);

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
      const currentTotal = prev.flavors.reduce((sum, f) => sum + getCookieCost(f.flavor, f.quantity), 0);

      // For lemon shortbread: add 3 sandwiches (costs 6 cookies worth)
      // For others: add 6 cookies
      const isDouble = flavor === DOUBLE_COUNT_FLAVOR;
      const addAmount = isDouble ? 3 : HALF_DOZEN;
      const additionCost = isDouble ? HALF_DOZEN : HALF_DOZEN; // both cost 6 cookies worth

      // Can't add if not enough room
      if (currentTotal + additionCost > targetCookies) return prev;

      const existing = prev.flavors.find((f) => f.flavor === flavor);

      if (existing) {
        return {
          ...prev,
          flavors: prev.flavors.map((f) =>
            f.flavor === flavor ? { ...f, quantity: f.quantity + addAmount } : f
          ),
        };
      } else {
        return {
          ...prev,
          flavors: [...prev.flavors, { flavor, label, quantity: addAmount }],
        };
      }
    });
  }, []);

  const removeHalfDozen = useCallback((flavor: string) => {
    setCartState((prev) => {
      const existing = prev.flavors.find((f) => f.flavor === flavor);
      if (!existing) return prev;

      // For lemon shortbread: remove 3 sandwiches at a time
      // For others: remove 6 cookies at a time
      const isDouble = flavor === DOUBLE_COUNT_FLAVOR;
      const removeAmount = isDouble ? 3 : HALF_DOZEN;

      if (existing.quantity <= removeAmount) {
        // Remove entirely
        return {
          ...prev,
          flavors: prev.flavors.filter((f) => f.flavor !== flavor),
        };
      } else {
        // Reduce by the appropriate amount
        return {
          ...prev,
          flavors: prev.flavors.map((f) =>
            f.flavor === flavor ? { ...f, quantity: f.quantity - removeAmount } : f
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

  const totalCookies = cartState.flavors.reduce((sum, f) => sum + getCookieCost(f.flavor, f.quantity), 0);
  const targetCookies = cartState.dozens ? cartState.dozens * COOKIES_PER_DOZEN : 0;
  const remainingCookies = targetCookies - totalCookies;
  const isComplete = cartState.dozens !== null && totalCookies === targetCookies;
  const getCookieCostForFlavor = getCookieCost;

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
        getCookieCostForFlavor,
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
