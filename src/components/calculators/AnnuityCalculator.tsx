'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnnuityResults {
  maturityAmount: number;
  totalInvestment: number;
  totalInterest: number;
  monthlyPayout: number;
  yearlyPayout: number;
  effectiveReturn: number;
  yearlyProjections: Array<{
    year: number;
    investmentValue: number;
    cumulativeInterest: number;
    annualPayout: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const AnnuityCalculator: React.FC = () => {
  // State for form inputs
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [annuityRate, setAnnuityRate] = useState<string>('');
  const [payoutPeriod, setPayoutPeriod] = useState<string>('');
  const [payoutFrequency, setPayoutFrequency] = useState<string>('monthly');
  const [deferredYears, setDeferredYears] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<AnnuityResults | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Utility function to format numbers in Indian currency format
  const formatIndianCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to convert numbers to words in Indian format
  const numberToWords = (num: number): string => {
    if (!num) return '';
    
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Crores`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} Lakhs`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} Thousand`;
    }
    return num.toString();
  };

  // Validation function
  const validateInputs = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!investmentAmount) newErrors.investmentAmount = 'Investment amount is required';
    else if (parseFloat(investmentAmount) < 100000) {
      newErrors.investmentAmount = 'Minimum investment amount is ₹1,00,000';
    }

    if (!annuityRate) newErrors.annuityRate = 'Annuity rate is required';
    else if (parseFloat(annuityRate) < 1 || parseFloat(annuityRate) > 15) {
      newErrors.annuityRate = 'Annuity rate must be between 1% and 15%';
    }

    if (!payoutPeriod) newErrors.payoutPeriod = 'Payout period is required';
    else if (parseInt(payoutPeriod) < 5 || parseInt(payoutPeriod) > 30) {
      newErrors.payoutPeriod = 'Payout period must be between 5 and 30 years';
    }

    if (!deferredYears) newErrors.deferredYears = 'Deferred years is required';
    if (!inflationRate) newErrors.inflationRate = 'Inflation rate is required';
    else if (parseFloat(inflationRate) < 0 || parseFloat(inflationRate) > 10) {
      newErrors.inflationRate = 'Inflation rate must be between 0% and 10%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate annuity returns and payouts
  const calculateAnnuity = () => {
    if (!validateInputs()) return;

    const principal = parseFloat(investmentAmount);
    const rate = parseFloat(annuityRate) / 100;
    const years = parseInt(payoutPeriod);
    const deferred = parseInt(deferredYears);
    const inflation = parseFloat(inflationRate) / 100;
    
    // Calculate frequency multiplier
    const frequencyMultiplier = {
      monthly: 12,
      quarterly: 4,
      semiannual: 2,
      annual: 1
    }[payoutFrequency] || 12;

    // Calculate maturity amount after deferred period
    const maturityAmount = principal * Math.pow(1 + rate, deferred);
    
    // Calculate payout amounts
    const totalPayoutYears = years;
    const yearlyPayout = (maturityAmount * rate) / (1 - Math.pow(1 + rate, -totalPayoutYears));
    const monthlyPayout = yearlyPayout / frequencyMultiplier;

    // Generate yearly projections
    const yearlyProjections = [];
    let remainingAmount = maturityAmount;
    let cumulativeInterest = maturityAmount - principal;
    let currentPayout = yearlyPayout;

    for (let year = 1; year <= years; year++) {
      const interestForYear = remainingAmount * rate;
      cumulativeInterest += interestForYear;
      remainingAmount = remainingAmount + interestForYear - currentPayout;
      currentPayout *= (1 + inflation); // Adjust for inflation if applicable

      yearlyProjections.push({
        year,
        investmentValue: remainingAmount,
        cumulativeInterest,
        annualPayout: currentPayout
      });
    }

    const results: AnnuityResults = {
      maturityAmount,
      totalInvestment: principal,
      totalInterest: cumulativeInterest,
      monthlyPayout,
      yearlyPayout,
      effectiveReturn: ((yearlyPayout * years) / principal - 1) * 100,
      yearlyProjections
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Return Analysis
    if (results.effectiveReturn > 8) {
      newInsights.push({
        message: `Attractive return of ${results.effectiveReturn.toFixed(2)}% over the investment period`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `Moderate return of ${results.effectiveReturn.toFixed(2)}% over the investment period`,
        type: 'info'
      });
    }

    // Payout Analysis
    const payoutToInvestmentRatio = (yearlyPayout / principal) * 100;
    if (payoutToInvestmentRatio > 12) {
      newInsights.push({
        message: 'High annual payout relative to investment amount',
        type: 'success'
      });
    } else if (payoutToInvestmentRatio < 6) {
      newInsights.push({
        message: 'Consider reviewing payout terms for better returns',
        type: 'warning'
      });
    }

    // Inflation Impact
    if (inflation > rate / 2) {
      newInsights.push({
        message: 'High inflation may significantly impact real returns',
        type: 'warning'
      });
    }

    // Investment Period Analysis
    if (deferred > 5) {
      newInsights.push({
        message: 'Longer deferral period allows for better corpus accumulation',
        type: 'info'
      });
    }

    setResults(results);
    setInsights(newInsights);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Coins className="h-8 w-8" />
            Annuity Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate your annuity returns and plan your regular income stream
            with customizable payout options and inflation protection.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Investment Amount
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Enter investment amount"
                className="text-lg py-6"
              />
              {errors.investmentAmount && (
                <p className="text-red-500 text-sm">{errors.investmentAmount}</p>
              )}
              {investmentAmount && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(investmentAmount))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annuity Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={annuityRate}
                onChange={(e) => setAnnuityRate(e.target.value)}
                placeholder="Enter annuity rate"
                className="text-lg py-6"
              />
              {errors.annuityRate && (
                <p className="text-red-500 text-sm">{errors.annuityRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Payout Period (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={payoutPeriod}
                onChange={(e) => setPayoutPeriod(e.target.value)}
                placeholder="Enter payout period"
                className="text-lg py-6"
              />
              {errors.payoutPeriod && (
                <p className="text-red-500 text-sm">{errors.payoutPeriod}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Payout Frequency
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <select
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value)}
                className="w-full text-lg py-6 rounded-md border border-[#108e66] bg-[#FCFFFE] px-3"
                aria-label="Select payout frequency"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semiannual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Deferred Years
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={deferredYears}
                onChange={(e) => setDeferredYears(e.target.value)}
                placeholder="Enter deferred years"
                className="text-lg py-6"
              />
              {errors.deferredYears && (
                <p className="text-red-500 text-sm">{errors.deferredYears}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Inflation Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="Enter inflation rate"
                className="text-lg py-6"
              />
              {errors.inflationRate && (
                <p className="text-red-500 text-sm">{errors.inflationRate}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateAnnuity}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Annuity Returns
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Maturity Amount</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.maturityAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      After {deferredYears} years
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Monthly Payout</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.monthlyPayout)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Regular income
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Effective Return</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {results.effectiveReturn.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Overall return rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${
                      insight.type === 'success' ? 'from-[#108e66]/10 to-white border-[#108e66]' :
                      insight.type === 'warning' ? 'from-amber-50 to-white border-amber-500' :
                      'from-blue-50 to-white border-blue-500'
                    } border-l-4`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        {insight.type === 'success' ? (
                          <CheckCircle className="w-6 h-6 text-[#108e66] flex-shrink-0" />
                        ) : insight.type === 'warning' ? (
                          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        ) : (
                          <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${
                          insight.type === 'success' ? 'text-[#108e66]' :
                          insight.type === 'warning' ? 'text-amber-700' :
                          'text-blue-700'
                        }`}>
                          {insight.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Projection Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Investment and Payout Projection</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.yearlyProjections}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Year', position: 'bottom', offset: -10 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${numberToWords(value)}`}
                          label={{ 
                            value: 'Amount (₹)', 
                            angle: -90, 
                            position: 'insideLeft',
                            offset: -10
                          }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${numberToWords(value)}`, '']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="investmentValue" 
                          name="Investment Value"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulativeInterest" 
                          name="Cumulative Interest"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="annualPayout" 
                          name="Annual Payout"
                          stroke="#FF6B6B" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnuityCalculator; 