'use client';

import dynamic from 'next/dynamic';

const EndowmentCalculator = dynamic(() => import('@/components/calculators/EndowmentCalculator'), {
  ssr: false,
});

export default function EndowmentCalculatorPage() {
  return <EndowmentCalculator />;
} 