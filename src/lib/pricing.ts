// Pricing utilities for Bakes by Coral
// All prices in cents to avoid floating point issues
// Prices are loaded from the database settings table

import type { OrderType } from '@/types';
import {
  getCookiePricePerDozen,
  getCakeBasePrices,
  getStyleMultipliers,
  getDepositPercentage,
} from './db/settings';

// Default values used as fallbacks
const DEFAULT_COOKIE_PRICE = 4000;
const DEFAULT_CAKE_PRICES: Record<string, number> = {
  '4': 4500,
  '6': 6500,
  '8': 8500,
  '10': 11000,
};
const DEFAULT_STYLE_MULTIPLIERS: Record<string, number> = {
  simple: 1.0,
  moderate: 1.25,
  intricate: 1.5,
};

// Calculate cookie order price
export async function calculateCookiePrice(dozensQuantity: number): Promise<number> {
  const pricePerDozen = await getCookiePricePerDozen();
  return pricePerDozen * dozensQuantity;
}

// Synchronous version using defaults (for display before async data loads)
export function calculateCookiePriceSync(dozensQuantity: number, pricePerDozen: number = DEFAULT_COOKIE_PRICE): number {
  return pricePerDozen * dozensQuantity;
}

// Estimate cake price (for display only - final price set by admin)
export async function estimateCakePrice(size: string, style: string = 'simple'): Promise<number> {
  const [basePrices, multipliers] = await Promise.all([
    getCakeBasePrices(),
    getStyleMultipliers(),
  ]);
  const basePrice = basePrices[size] || basePrices['6'] || DEFAULT_CAKE_PRICES['6'];
  const multiplier = multipliers[style] || 1.0;
  return Math.round(basePrice * multiplier);
}

// Synchronous version for display
export function estimateCakePriceSync(
  size: string,
  style: string = 'simple',
  basePrices: Record<string, number> = DEFAULT_CAKE_PRICES,
  multipliers: Record<string, number> = DEFAULT_STYLE_MULTIPLIERS
): number {
  const basePrice = basePrices[size] || basePrices['6'];
  const multiplier = multipliers[style] || 1.0;
  return Math.round(basePrice * multiplier);
}

// Get price range for cake size
export async function getCakePriceRange(size: string): Promise<{ min: number; max: number }> {
  const [basePrices, multipliers] = await Promise.all([
    getCakeBasePrices(),
    getStyleMultipliers(),
  ]);
  const basePrice = basePrices[size] || basePrices['6'] || DEFAULT_CAKE_PRICES['6'];
  return {
    min: basePrice,
    max: Math.round(basePrice * (multipliers.intricate || 1.5)),
  };
}

// Format price for display (cents to dollars)
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Format price without cents if whole dollar
export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  if (dollars === Math.floor(dollars)) {
    return `$${dollars}`;
  }
  return `$${dollars.toFixed(2)}`;
}

// Calculate deposit amount
export async function calculateDeposit(total: number): Promise<number> {
  const percentage = await getDepositPercentage();
  return Math.round(total * (percentage / 100));
}

// Synchronous version
export function calculateDepositSync(total: number, percentage: number = 50): number {
  return Math.round(total * (percentage / 100));
}

// Determine if order requires deposit
export function requiresDeposit(orderType: OrderType): boolean {
  return orderType !== 'cookies';
}

// Get order type display name
export function getOrderTypeDisplayName(orderType: OrderType): string {
  const names: Record<OrderType, string> = {
    cookies: 'Cookies (1-3 Dozen)',
    cookies_large: 'Large Cookie Order (4+ Dozen)',
    cake: 'Custom Cake',
    wedding: 'Wedding & Event',
  };
  return names[orderType] || orderType;
}

// Get minimum order value for order type
export async function getMinimumOrderValue(orderType: OrderType): Promise<number> {
  const [cookiePrice, cakePrices] = await Promise.all([
    getCookiePricePerDozen(),
    getCakeBasePrices(),
  ]);

  switch (orderType) {
    case 'cookies':
      return cookiePrice; // 1 dozen minimum
    case 'cookies_large':
      return cookiePrice * 4; // 4 dozen minimum
    case 'cake':
      return cakePrices['4'] || DEFAULT_CAKE_PRICES['4']; // Smallest cake
    case 'wedding':
      return cakePrices['6'] || DEFAULT_CAKE_PRICES['6']; // Starting price
    default:
      return 0;
  }
}

// Validate order total is reasonable
export async function validateOrderTotal(total: number, orderType: OrderType): Promise<boolean> {
  const min = await getMinimumOrderValue(orderType);
  const max = 1000000; // $10,000 max sanity check
  return total >= min && total <= max;
}

// Load all pricing data at once for efficient rendering
export interface PricingData {
  cookiePricePerDozen: number;
  cakeBasePrices: Record<string, number>;
  styleMultipliers: Record<string, number>;
  depositPercentage: number;
}

export async function loadPricingData(): Promise<PricingData> {
  const [cookiePricePerDozen, cakeBasePrices, styleMultipliers, depositPercentage] = await Promise.all([
    getCookiePricePerDozen(),
    getCakeBasePrices(),
    getStyleMultipliers(),
    getDepositPercentage(),
  ]);

  return {
    cookiePricePerDozen,
    cakeBasePrices,
    styleMultipliers,
    depositPercentage,
  };
}
