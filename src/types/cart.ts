export interface FlavorSelection {
  flavor: string;  // e.g. 'chocolate_chip'
  label: string;   // e.g. 'Chocolate Chip'
  quantity: number; // number of cookies (in increments of 6)
}

export interface CartState {
  dozens: 1 | 2 | 3 | null;  // total dozen selected
  flavors: FlavorSelection[];
  packaging: 'standard' | 'heat-sealed';
}

export const FLAVORS = [
  { key: 'chocolate_chip', label: 'Chocolate Chip' },
  { key: 'vanilla_bean_sugar', label: 'Vanilla Bean Sugar' },
  { key: 'cherry_almond', label: 'Cherry Almond' },
  { key: 'espresso_butterscotch', label: 'Espresso Butterscotch' },
  { key: 'lemon_sugar', label: 'Lemon Sugar' },
] as const;

export const SEASONAL_FLAVORS = [
  { key: 'key_lime_pie', label: 'Key Lime Pie' },
  { key: 'blueberry_muffin', label: 'Blueberry Muffin' },
  { key: 'lemon_sugar_sandwiches', label: 'Lemon Sugar Sandwiches' },
  { key: 'white_chocolate_raspberry', label: 'White Chocolate Raspberry' },
] as const;

export const PRICE_PER_DOZEN = 3000;  // cents
export const HEAT_SEAL_FEE = 500;     // cents per dozen
export const MAX_DOZENS = 3;
export const COOKIES_PER_DOZEN = 12;
export const HALF_DOZEN = 6;

// Lemon sugar sandwiches count as 2x since each sandwich uses 2 cookies
export const DOUBLE_COUNT_FLAVOR = 'lemon_sugar_sandwiches';
