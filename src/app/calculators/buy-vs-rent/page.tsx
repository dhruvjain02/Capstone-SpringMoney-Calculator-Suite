'use client';

import dynamic from 'next/dynamic';

const BuyVsRentCalculator = dynamic(() => import('@/components/calculators/BuyVsRentCalculator'), {
  ssr: false,
});

export default function BuyVsRentCalculatorPage() {
  return <BuyVsRentCalculator />;
} 