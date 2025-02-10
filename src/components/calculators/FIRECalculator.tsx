'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface FIREResults {
  targetAmount: number;
  yearsToFIRE: number;
  monthlyInvestmentRequired: number;
  projections: Array<{
    year: number;
    age: number;
    savings: number;
    investmentReturns: number;
    totalCorpus: number;
    yearlyExpenses: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const FIRECalculator: React.FC = () => {
  // State for form inputs
  const [currentAge, setCurrentAge] = useState<string>('');
  const [currentSavings, setCurrentSavings] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [savingsRate, setSavingsRate] = useState<string>('');
  const [preRetirementReturn, setPreRetirementReturn] = useState<string>('');
  const [postRetirementReturn, setPostRetirementReturn] = useState<string>('');
  const [targetRetirementAge, setTargetRetirementAge] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<string>('');
  
  // State for results and insights
  const [results, setResults] = useState<FIREResults | null>(null);
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

    if (!currentAge) newErrors.currentAge = 'Current age is required';
    else if (parseInt(currentAge) < 18 || parseInt(currentAge) > 100) {
      newErrors.currentAge = 'Age must be between 18 and 100';
    }

    if (!currentSavings) newErrors.currentSavings = 'Current savings is required';
    if (!monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';
    if (!monthlyExpenses) newErrors.monthlyExpenses = 'Monthly expenses is required';
    if (!savingsRate) newErrors.savingsRate = 'Savings rate is required';
    else if (parseFloat(savingsRate) < 0 || parseFloat(savingsRate) > 100) {
      newErrors.savingsRate = 'Savings rate must be between 0 and 100';
    }

    if (!preRetirementReturn) newErrors.preRetirementReturn = 'Pre-retirement return rate is required';
    if (!postRetirementReturn) newErrors.postRetirementReturn = 'Post-retirement return rate is required';
    if (!targetRetirementAge) newErrors.targetRetirementAge = 'Target retirement age is required';
    else if (parseInt(targetRetirementAge) <= parseInt(currentAge)) {
      newErrors.targetRetirementAge = 'Target age must be greater than current age';
    }

    if (!inflationRate) newErrors.inflationRate = 'Inflation rate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate FIRE projections
  const calculateFIRE = () => {
    if (!validateInputs()) return;

    const currentAgeNum = parseInt(currentAge);
    const targetAgeNum = parseInt(targetRetirementAge);
    const yearsToRetirement = targetAgeNum - currentAgeNum;
    const currentSavingsNum = parseFloat(currentSavings);
    const monthlyIncomeNum = parseFloat(monthlyIncome);
    const monthlyExpensesNum = parseFloat(monthlyExpenses);
    const preReturnRate = parseFloat(preRetirementReturn) / 100;
    const postReturnRate = parseFloat(postRetirementReturn) / 100;
    const inflationRateNum = parseFloat(inflationRate) / 100;

    const projections = [];
    let currentCorpus = currentSavingsNum;
    const monthlySavings = monthlyIncomeNum * (parseFloat(savingsRate) / 100);

    // Calculate yearly projections until target retirement age
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAgeNum + year;
      const yearlyExpenses = monthlyExpensesNum * 12 * Math.pow(1 + inflationRateNum, year);
      const investmentReturns = currentCorpus * preReturnRate;
      const yearlySavings = monthlySavings * 12;
      currentCorpus = currentCorpus + investmentReturns + yearlySavings;

      projections.push({
        year,
        age,
        savings: yearlySavings,
        investmentReturns,
        totalCorpus: currentCorpus,
        yearlyExpenses
      });
    }

    // Calculate target amount needed for FIRE
    const finalYearlyExpense = monthlyExpensesNum * 12 * Math.pow(1 + inflationRateNum, yearsToRetirement);
    const targetAmount = finalYearlyExpense * 25; // Using 4% withdrawal rule

    // Generate insights
    const newInsights: Insight[] = [];
    
    // Savings Rate Insight
    const savingsRateNum = parseFloat(savingsRate);
    if (savingsRateNum < 20) {
      newInsights.push({
        message: 'Consider increasing your savings rate to accelerate your FIRE journey',
        type: 'warning'
      });
    } else if (savingsRateNum >= 50) {
      newInsights.push({
        message: 'Excellent savings rate! You\'re on a fast track to FIRE',
        type: 'success'
      });
    }

    // Return Rate vs Inflation Insight
    if (preReturnRate <= inflationRateNum) {
      newInsights.push({
        message: 'Warning: Your investment returns barely cover inflation. Consider diversifying your investments',
        type: 'warning'
      });
    }

    // FIRE Timeline Insight
    const finalCorpus = projections[projections.length - 1].totalCorpus;
    if (finalCorpus >= targetAmount) {
      newInsights.push({
        message: `You'll reach your FIRE goal by age ${targetRetirementAge}!`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `You may need to adjust your plan to reach the target corpus of ${formatIndianCurrency(targetAmount)}`,
        type: 'warning'
      });
    }

    setResults({
      targetAmount,
      yearsToFIRE: yearsToRetirement,
      monthlyInvestmentRequired: monthlySavings,
      projections
    });
    setInsights(newInsights);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <TrendingUp className="h-8 w-8" />
            FIRE Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Plan your journey to Financial Independence and Early Retirement (FIRE).
            Calculate how much you need to save and invest to achieve financial freedom.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Age */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Current Age
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                placeholder="Enter your current age"
                className="text-lg py-6"
              />
              {errors.currentAge && (
                <p className="text-red-500 text-sm">{errors.currentAge}</p>
              )}
            </div>

            {/* Target Retirement Age */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Target Retirement Age
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={targetRetirementAge}
                onChange={(e) => setTargetRetirementAge(e.target.value)}
                placeholder="Enter target retirement age"
                className="text-lg py-6"
              />
              {errors.targetRetirementAge && (
                <p className="text-red-500 text-sm">{errors.targetRetirementAge}</p>
              )}
            </div>

            {/* Current Savings */}
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

            {/* Monthly Income */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Monthly Income
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Enter monthly income"
                className="text-lg py-6"
              />
              {errors.monthlyIncome && (
                <p className="text-red-500 text-sm">{errors.monthlyIncome}</p>
              )}
              {monthlyIncome && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(monthlyIncome))}
                </p>
              )}
            </div>

            {/* Monthly Expenses */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Monthly Expenses
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="Enter monthly expenses"
                className="text-lg py-6"
              />
              {errors.monthlyExpenses && (
                <p className="text-red-500 text-sm">{errors.monthlyExpenses}</p>
              )}
              {monthlyExpenses && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(monthlyExpenses))}
                </p>
              )}
            </div>

            {/* Savings Rate */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Savings Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={savingsRate}
                onChange={(e) => setSavingsRate(e.target.value)}
                placeholder="Enter savings rate"
                className="text-lg py-6"
              />
              {errors.savingsRate && (
                <p className="text-red-500 text-sm">{errors.savingsRate}</p>
              )}
            </div>

            {/* Pre-Retirement Return Rate */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Pre-Retirement Return Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={preRetirementReturn}
                onChange={(e) => setPreRetirementReturn(e.target.value)}
                placeholder="Enter expected return rate"
                className="text-lg py-6"
              />
              {errors.preRetirementReturn && (
                <p className="text-red-500 text-sm">{errors.preRetirementReturn}</p>
              )}
            </div>

            {/* Post-Retirement Return Rate */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Post-Retirement Return Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={postRetirementReturn}
                onChange={(e) => setPostRetirementReturn(e.target.value)}
                placeholder="Enter expected return rate"
                className="text-lg py-6"
              />
              {errors.postRetirementReturn && (
                <p className="text-red-500 text-sm">{errors.postRetirementReturn}</p>
              )}
            </div>

            {/* Inflation Rate */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected Inflation Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="Enter expected inflation rate"
                className="text-lg py-6"
              />
              {errors.inflationRate && (
                <p className="text-red-500 text-sm">{errors.inflationRate}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateFIRE}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate FIRE Journey
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Target FIRE Amount</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.targetAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.targetAmount)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Years to FIRE</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {results.yearsToFIRE} years
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Target age: {parseInt(currentAge) + results.yearsToFIRE}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Required Monthly Investment</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.monthlyInvestmentRequired)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.monthlyInvestmentRequired)} per month
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
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">FIRE Journey Projection</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.projections}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="age" 
                          label={{ value: 'Age', position: 'bottom', offset: -10 }}
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
                          labelFormatter={(label) => `Age: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="totalCorpus" 
                          name="Total Corpus"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="yearlyExpenses" 
                          name="Yearly Expenses"
                          stroke="#FF6B6B" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="investmentReturns" 
                          name="Investment Returns"
                          stroke="#525ECC" 
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

export default FIRECalculator; 