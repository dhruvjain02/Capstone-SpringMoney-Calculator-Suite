'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EndowmentResults {
  maturityAmount: number;
  totalPremiumPaid: number;
  effectiveReturn: number;
  deathBenefit: number;
  surrenderValue: number;
  yearlyProjections: Array<{
    year: number;
    premiumPaid: number;
    policyValue: number;
    surrenderValue: number;
    deathBenefit: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const EndowmentCalculator: React.FC = () => {
  // State for form inputs
  const [policyTerm, setPolicyTerm] = useState<string>('');
  const [annualPremium, setAnnualPremium] = useState<string>('');
  const [sumAssured, setSumAssured] = useState<string>('');
  const [bonusRate, setBonusRate] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [paymentFrequency, setPaymentFrequency] = useState<string>('annual');

  // State for results and insights
  const [results, setResults] = useState<EndowmentResults | null>(null);
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

    if (!policyTerm) newErrors.policyTerm = 'Policy term is required';
    else if (parseInt(policyTerm) < 5 || parseInt(policyTerm) > 40) {
      newErrors.policyTerm = 'Policy term must be between 5 and 40 years';
    }

    if (!annualPremium) newErrors.annualPremium = 'Annual premium is required';
    if (!sumAssured) newErrors.sumAssured = 'Sum assured is required';
    if (!bonusRate) newErrors.bonusRate = 'Bonus rate is required';
    else if (parseFloat(bonusRate) < 0 || parseFloat(bonusRate) > 15) {
      newErrors.bonusRate = 'Bonus rate must be between 0% and 15%';
    }

    if (!age) newErrors.age = 'Age is required';
    else if (parseInt(age) < 18 || parseInt(age) > 65) {
      newErrors.age = 'Age must be between 18 and 65 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate endowment returns
  const calculateEndowment = () => {
    if (!validateInputs()) return;

    const term = parseInt(policyTerm);
    const premium = parseFloat(annualPremium);
    const assured = parseFloat(sumAssured);
    const bonus = parseFloat(bonusRate) / 100;
    const currentAge = parseInt(age);

    // Calculate frequency multiplier
    const frequencyMultiplier = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
      monthly: 12
    }[paymentFrequency] || 1;

    const yearlyPremium = premium * frequencyMultiplier;
    const totalPremium = yearlyPremium * term;
    
    // Generate yearly projections
    const yearlyProjections = [];
    let cumulativePremium = 0;
    let cumulativeBonus = 0;

    for (let year = 1; year <= term; year++) {
      cumulativePremium += yearlyPremium;
      cumulativeBonus += assured * bonus;
      
      const policyValue = assured + cumulativeBonus;
      const surrenderValue = year >= 3 ? (cumulativePremium * 0.9 + cumulativeBonus * 0.5) : 0;
      
      yearlyProjections.push({
        year,
        premiumPaid: cumulativePremium,
        policyValue,
        surrenderValue,
        deathBenefit: Math.max(assured, policyValue)
      });
    }

    const maturityAmount = assured + (assured * bonus * term);
    const effectiveReturn = ((maturityAmount / totalPremium) ** (1 / term) - 1) * 100;

    const results: EndowmentResults = {
      maturityAmount,
      totalPremiumPaid: totalPremium,
      effectiveReturn,
      deathBenefit: Math.max(assured, maturityAmount),
      surrenderValue: yearlyProjections[term - 1].surrenderValue,
      yearlyProjections
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Return Analysis
    if (effectiveReturn > 6) {
      newInsights.push({
        message: `Good returns of ${effectiveReturn.toFixed(2)}% considering the safety and life cover`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `Returns of ${effectiveReturn.toFixed(2)}% are moderate, but come with life coverage benefit`,
        type: 'info'
      });
    }

    // Premium to Sum Assured Ratio
    const premiumRatio = (yearlyPremium / assured) * 100;
    if (premiumRatio < 4) {
      newInsights.push({
        message: 'Favorable premium to sum assured ratio',
        type: 'success'
      });
    } else if (premiumRatio < 8) {
      newInsights.push({
        message: 'Moderate premium to sum assured ratio',
        type: 'info'
      });
    } else {
      newInsights.push({
        message: 'High premium to sum assured ratio',
        type: 'warning'
      });
    }

    // Age and Term Analysis
    const maturityAge = currentAge + term;
    if (maturityAge > 70) {
      newInsights.push({
        message: 'Consider a shorter policy term as maturity age exceeds 70 years',
        type: 'warning'
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
            Endowment Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate returns and benefits from your endowment policy including maturity value,
            death benefit, and surrender value.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Premium
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={annualPremium}
                onChange={(e) => setAnnualPremium(e.target.value)}
                placeholder="Enter annual premium"
                className="text-lg py-6"
              />
              {errors.annualPremium && (
                <p className="text-red-500 text-sm">{errors.annualPremium}</p>
              )}
              {annualPremium && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(annualPremium))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Sum Assured
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={sumAssured}
                onChange={(e) => setSumAssured(e.target.value)}
                placeholder="Enter sum assured"
                className="text-lg py-6"
              />
              {errors.sumAssured && (
                <p className="text-red-500 text-sm">{errors.sumAssured}</p>
              )}
              {sumAssured && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(sumAssured))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Policy Term (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={policyTerm}
                onChange={(e) => setPolicyTerm(e.target.value)}
                placeholder="Enter policy term"
                className="text-lg py-6"
              />
              {errors.policyTerm && (
                <p className="text-red-500 text-sm">{errors.policyTerm}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Bonus Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={bonusRate}
                onChange={(e) => setBonusRate(e.target.value)}
                placeholder="Enter bonus rate"
                className="text-lg py-6"
              />
              {errors.bonusRate && (
                <p className="text-red-500 text-sm">{errors.bonusRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Current Age
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your current age"
                className="text-lg py-6"
              />
              {errors.age && (
                <p className="text-red-500 text-sm">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Payment Frequency
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value)}
                className="w-full text-lg py-6 rounded-md border border-[#108e66] bg-[#FCFFFE] px-3"
                aria-label="Select payment frequency"
              >
                <option value="annual">Annual</option>
                <option value="semiannual">Semi-Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <Button
            onClick={calculateEndowment}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Benefits
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
                      Including bonuses
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Death Benefit</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.deathBenefit)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Maximum coverage
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
                      Annual return rate
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

              {/* Policy Value Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Policy Value Projection</h3>
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
                          dataKey="policyValue" 
                          name="Policy Value"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="premiumPaid" 
                          name="Premium Paid"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="surrenderValue" 
                          name="Surrender Value"
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

export default EndowmentCalculator; 