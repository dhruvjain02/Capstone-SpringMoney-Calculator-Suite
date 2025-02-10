'use client';

import dynamic from 'next/dynamic';

const EquityReturnsCalculator = dynamic(() => import('@/components/calculators/EquityReturnsCalculator'), {
  ssr: false,
});

export default function EquityReturnsCalculatorPage() {
  return <EquityReturnsCalculator />;
} 