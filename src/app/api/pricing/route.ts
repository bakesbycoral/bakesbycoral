import { NextResponse } from 'next/server';
import {
  getCookiePricePerDozen,
  getCakeBasePrices,
  getStyleMultipliers,
  getDepositPercentage,
} from '@/lib/db/settings';

export async function GET() {
  try {
    const [cookiePricePerDozen, cakeBasePrices, styleMultipliers, depositPercentage] = await Promise.all([
      getCookiePricePerDozen(),
      getCakeBasePrices(),
      getStyleMultipliers(),
      getDepositPercentage(),
    ]);

    return NextResponse.json({
      cookiePricePerDozen,
      cakeBasePrices,
      styleMultipliers,
      depositPercentage,
    });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json({ error: 'Failed to load pricing' }, { status: 500 });
  }
}
