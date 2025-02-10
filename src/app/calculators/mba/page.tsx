'use client';

import dynamic from 'next/dynamic';

const MBACalculator = dynamic(() => import('@/components/calculators/MBACalculator'), {
  ssr: false,
});

export default function MBACalculatorPage() {
  return <MBACalculator />;
} 