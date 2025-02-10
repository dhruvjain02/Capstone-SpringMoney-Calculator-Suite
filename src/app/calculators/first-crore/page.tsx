'use client';

import dynamic from 'next/dynamic';

const FirstCroreCalculator = dynamic(() => import('@/components/calculators/FirstCroreCalculator'), {
  ssr: false,
});

export default function FirstCroreCalculatorPage() {
  return <FirstCroreCalculator />;
} 