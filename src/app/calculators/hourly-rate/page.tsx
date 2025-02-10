'use client';

import dynamic from 'next/dynamic';

const HourlyRateCalculator = dynamic(() => import('@/components/calculators/HourlyRateCalculator'), {
  ssr: false,
});

export default function HourlyRateCalculatorPage() {
  return <HourlyRateCalculator />;
} 