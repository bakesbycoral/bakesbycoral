export interface FlavorSelection {
  flavor: string;  // e.g. 'chocolate_chip'
  label: string;   // e.g. 'Chocolate Chip'
  quantity: number; // number of cookies (in increments of 6)
}

export interface CartState {
  springBox: boolean;          // whether the Spring Cookie Box is included
  dozens: 1 | 2 | 3 | null;  // build-your-own dozen count (separate from spring box)
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
export const SPRING_BOX_PRICE = 3500; // cents
export const HEAT_SEAL_FEE = 500;     // cents per dozen
export const MAX_DOZENS = 3;
export const COOKIES_PER_DOZEN = 12;
export const HALF_DOZEN = 6;

// Spring Cookie Box: curated box of all 4 spring flavors, 3 of each (12 pieces)
export const SPRING_BOX_FLAVORS = [
  { key: 'key_lime_pie', label: 'Key Lime Pie', quantity: 3 },
  { key: 'blueberry_muffin', label: 'Blueberry Muffin', quantity: 3 },
  { key: 'white_chocolate_raspberry', label: 'White Chocolate Raspberry', quantity: 3 },
  { key: 'lemon_sugar_sandwiches', label: 'Lemon Sugar Sandwiches', quantity: 3 },
] as const;

// Lemon sugar sandwiches count as 2x since each sandwich uses 2 cookies
export const DOUBLE_COUNT_FLAVOR = 'lemon_sugar_sandwiches';
