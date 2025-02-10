'use client';

import dynamic from 'next/dynamic';

const AnnuityCalculator = dynamic(() => import('@/components/calculators/AnnuityCalculator'), {
  ssr: false,
});

export default function AnnuityCalculatorPage() {
  return <AnnuityCalculator />;
} 