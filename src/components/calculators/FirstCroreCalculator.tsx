'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FirstCroreResults {
  yearsToTarget: number;
  monthlyInvestmentRequired: number;
  totalInvestment: number;
  totalReturns: number;
  yearlyProjections: Array<{
    year: number;
    investedAmount: number;
    projectedValue: number;
    yearlyReturns: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const FirstCroreCalculator: React.FC = () => {
  // State for form inputs
  const [currentSavings, setCurrentSavings] = useState<string>('');
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('');
  const [expectedReturn, setExpectedReturn] = useState<string>('');
  const [riskProfile, setRiskProfile] = useState<string>('');
  const [targetTimeframe, setTargetTimeframe] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<FirstCroreResults | null>(null);
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

    if (!currentSavings) newErrors.currentSavings = 'Current savings is required';
    if (!monthlyInvestment) newErrors.monthlyInvestment = 'Monthly investment is required';
    if (!expectedReturn) newErrors.expectedReturn = 'Expected return rate is required';
    else if (parseFloat(expectedReturn) < 1 || parseFloat(expectedReturn) > 30) {
      newErrors.expectedReturn = 'Return rate must be between 1% and 30%';
    }
    if (!riskProfile) newErrors.riskProfile = 'Risk profile is required';
    if (!targetTimeframe) newErrors.targetTimeframe = 'Target timeframe is required';
    else if (parseInt(targetTimeframe) < 1 || parseInt(targetTimeframe) > 40) {
      newErrors.targetTimeframe = 'Timeframe must be between 1 and 40 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate path to first crore
  const calculatePath = () => {
    if (!validateInputs()) return;

    const initial = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlyInvestment);
    const rate = parseFloat(expectedReturn) / 100;
    const years = parseInt(targetTimeframe);
    const targetAmount = 10000000; // 1 Crore

    const yearlyData = [];
    let currentAmount = initial;
    let totalInvested = initial;

    for (let year = 1; year <= years; year++) {
      const yearlyInvestment = monthly * 12;
      totalInvested += yearlyInvestment;
      const yearlyReturns = (currentAmount + yearlyInvestment / 2) * rate;
      currentAmount = currentAmount + yearlyInvestment + yearlyReturns;

      yearlyData.push({
        year,
        investedAmount: totalInvested,
        projectedValue: currentAmount,
        yearlyReturns
      });

      if (currentAmount >= targetAmount && !results) {
        setResults({
          yearsToTarget: year,
          monthlyInvestmentRequired: monthly,
          totalInvestment: totalInvested,
          totalReturns: currentAmount - totalInvested,
          yearlyProjections: yearlyData
        });
      }
    }

    // Generate insights
    const newInsights: Insight[] = [];

    // Time to target insight
    if (currentAmount >= targetAmount) {
      newInsights.push({
        message: `You can reach your first crore in ${yearlyData.find(d => d.projectedValue >= targetAmount)?.year} years`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `You need to increase your investments to reach 1 crore within ${years} years`,
        type: 'warning'
      });
    }

    // Return rate insight
    const effectiveReturnRate = ((currentAmount / totalInvested) - 1) * 100 / years;
    newInsights.push({
      message: `Your effective annual return rate is ${effectiveReturnRate.toFixed(2)}%`,
      type: effectiveReturnRate >= parseFloat(expectedReturn) ? 'success' : 'info'
    });

    // Investment discipline insight
    const monthlyPercentage = (monthly * 12 / (parseFloat(currentSavings) || 1)) * 100;
    if (monthlyPercentage > 50) {
      newInsights.push({
        message: 'Your monthly investment commitment is significant. Consider increasing your income sources.',
        type: 'info'
      });
    }

    // Risk profile based insight
    const riskBasedReturn = parseFloat(expectedReturn);
    if (riskBasedReturn > 15 && riskProfile === 'conservative') {
      newInsights.push({
        message: 'Your expected return might be too optimistic for your risk profile',
        type: 'warning'
      });
    }

    setResults({
      yearsToTarget: years,
      monthlyInvestmentRequired: monthly,
      totalInvestment: totalInvested,
      totalReturns: currentAmount - totalInvested,
      yearlyProjections: yearlyData
    });
    setInsights(newInsights);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Target className="h-8 w-8" />
            First Crore Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Plan your journey to your first crore through systematic investments and smart financial planning.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Current Savings
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="Enter current savings"
                className="text-lg py-6"
              />
              {errors.currentSavings && (
                <p className="text-red-500 text-sm">{errors.currentSavings}</p>
              )}
              {currentSavings && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(currentSavings))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Monthly Investment
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                placeholder="Enter monthly investment"
                className="text-lg py-6"
              />
              {errors.monthlyInvestment && (
                <p className="text-red-500 text-sm">{errors.monthlyInvestment}</p>
              )}
              {monthlyInvestment && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(monthlyInvestment))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected Return Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                placeholder="Enter expected return rate"
                className="text-lg py-6"
              />
              {errors.expectedReturn && (
                <p className="text-red-500 text-sm">{errors.expectedReturn}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Risk Profile
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value)}
                className="w-full text-lg py-6 rounded-md border border-[#108e66] bg-[#FCFFFE] px-3"
                aria-label="Select your risk profile"
              >
                <option value="">Select risk profile</option>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              {errors.riskProfile && (
                <p className="text-red-500 text-sm">{errors.riskProfile}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Target Timeframe (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={targetTimeframe}
                onChange={(e) => setTargetTimeframe(e.target.value)}
                placeholder="Enter target timeframe"
                className="text-lg py-6"
              />
              {errors.targetTimeframe && (
                <p className="text-red-500 text-sm">{errors.targetTimeframe}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculatePath}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Path to First Crore
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Years to Target</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {results.yearsToTarget} Years
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Investment</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.totalInvestment)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Returns</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.totalReturns)}
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

              {/* Investment Growth Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Investment Growth Projection</h3>
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
                          dataKey="investedAmount" 
                          name="Total Investment"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projectedValue" 
                          name="Projected Value"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="yearlyReturns" 
                          name="Yearly Returns"
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

export default FirstCroreCalculator; 