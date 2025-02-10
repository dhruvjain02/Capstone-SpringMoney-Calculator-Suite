'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ComparisonResults {
  mutualFund: {
    finalAmount: number;
    totalInvestment: number;
    totalReturns: number;
    taxLiability: number;
    netAmount: number;
  };
  nps: {
    finalAmount: number;
    totalInvestment: number;
    totalReturns: number;
    taxSavings: number;
    netAmount: number;
    annuityAmount: number;
  };
  yearlyData: Array<{
    year: number;
    mutualFundAmount: number;
    npsAmount: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const MFvsNPSCalculator: React.FC = () => {
  // State for form inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('');
  const [investmentPeriod, setInvestmentPeriod] = useState<string>('');
  const [mfReturnRate, setMfReturnRate] = useState<string>('');
  const [npsReturnRate, setNpsReturnRate] = useState<string>('');
  const [currentAge, setCurrentAge] = useState<string>('');
  const [taxBracket, setTaxBracket] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<ComparisonResults | null>(null);
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

    if (!monthlyInvestment) newErrors.monthlyInvestment = 'Monthly investment is required';
    if (!investmentPeriod) newErrors.investmentPeriod = 'Investment period is required';
    else if (parseInt(investmentPeriod) < 1 || parseInt(investmentPeriod) > 40) {
      newErrors.investmentPeriod = 'Investment period must be between 1 and 40 years';
    }

    if (!mfReturnRate) newErrors.mfReturnRate = 'Mutual Fund return rate is required';
    else if (parseFloat(mfReturnRate) < 0 || parseFloat(mfReturnRate) > 30) {
      newErrors.mfReturnRate = 'Return rate must be between 0% and 30%';
    }

    if (!npsReturnRate) newErrors.npsReturnRate = 'NPS return rate is required';
    else if (parseFloat(npsReturnRate) < 0 || parseFloat(npsReturnRate) > 30) {
      newErrors.npsReturnRate = 'Return rate must be between 0% and 30%';
    }

    if (!currentAge) newErrors.currentAge = 'Current age is required';
    else if (parseInt(currentAge) < 18 || parseInt(currentAge) > 65) {
      newErrors.currentAge = 'Age must be between 18 and 65 years';
    }

    if (!taxBracket) newErrors.taxBracket = 'Tax bracket is required';
    else if (parseFloat(taxBracket) < 0 || parseFloat(taxBracket) > 42) {
      newErrors.taxBracket = 'Tax bracket must be between 0% and 42%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate comparison between MF and NPS
  const calculateComparison = () => {
    if (!validateInputs()) return;

    const monthly = parseFloat(monthlyInvestment);
    const years = parseInt(investmentPeriod);
    const mfReturn = parseFloat(mfReturnRate) / 100;
    const npsReturn = parseFloat(npsReturnRate) / 100;
    const age = parseInt(currentAge);
    const taxRate = parseFloat(taxBracket) / 100;

    const yearlyData = [];
    let mfAmount = 0;
    let npsAmount = 0;
    const yearlyInvestment = monthly * 12;

    // Calculate year by year growth
    for (let year = 1; year <= years; year++) {
      // Mutual Fund calculations
      const mfGrowth = mfAmount * mfReturn;
      mfAmount += yearlyInvestment + mfGrowth;

      // NPS calculations
      const npsGrowth = npsAmount * npsReturn;
      npsAmount += yearlyInvestment + npsGrowth;

      yearlyData.push({
        year,
        mutualFundAmount: mfAmount,
        npsAmount: npsAmount
      });
    }

    // Calculate tax implications
    const mfTaxLiability = (mfAmount - (yearlyInvestment * years)) * 0.10; // 10% LTCG tax
    const npsTaxSavings = yearlyInvestment * taxRate * years;
    const npsAnnuityAmount = npsAmount * 0.4; // 40% mandatory annuity
    const npsLumpsum = npsAmount * 0.6; // 60% tax-free withdrawal

    const results: ComparisonResults = {
      mutualFund: {
        finalAmount: mfAmount,
        totalInvestment: yearlyInvestment * years,
        totalReturns: mfAmount - (yearlyInvestment * years),
        taxLiability: mfTaxLiability,
        netAmount: mfAmount - mfTaxLiability
      },
      nps: {
        finalAmount: npsAmount,
        totalInvestment: yearlyInvestment * years,
        totalReturns: npsAmount - (yearlyInvestment * years),
        taxSavings: npsTaxSavings,
        netAmount: npsLumpsum,
        annuityAmount: npsAnnuityAmount
      },
      yearlyData
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Tax Savings Insight
    newInsights.push({
      message: `Total tax savings with NPS: ${formatIndianCurrency(npsTaxSavings)}`,
      type: 'success'
    });

    // Returns Comparison
    if (results.nps.totalReturns > results.mutualFund.totalReturns) {
      newInsights.push({
        message: 'NPS is generating higher returns due to tax benefits and compound growth',
        type: 'success'
      });
    } else {
      newInsights.push({
        message: 'Mutual Funds are generating higher returns despite tax implications',
        type: 'info'
      });
    }

    // Liquidity Insight
    newInsights.push({
      message: 'NPS has lower liquidity with 40% mandatory annuity purchase at maturity',
      type: 'warning'
    });

    // Age-based Insight
    const retirementAge = age + years;
    if (retirementAge < 60) {
      newInsights.push({
        message: 'Early withdrawal from NPS before 60 years will have tax implications',
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
            MF vs NPS Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Compare investments in Mutual Funds and National Pension System (NPS) to make informed decisions
            about your retirement planning and wealth creation.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Investment Details */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Monthly Investment
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                placeholder="Enter monthly investment amount"
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
                Investment Period (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(e.target.value)}
                placeholder="Enter investment period"
                className="text-lg py-6"
              />
              {errors.investmentPeriod && (
                <p className="text-red-500 text-sm">{errors.investmentPeriod}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected MF Return Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={mfReturnRate}
                onChange={(e) => setMfReturnRate(e.target.value)}
                placeholder="Enter expected MF return rate"
                className="text-lg py-6"
              />
              {errors.mfReturnRate && (
                <p className="text-red-500 text-sm">{errors.mfReturnRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected NPS Return Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={npsReturnRate}
                onChange={(e) => setNpsReturnRate(e.target.value)}
                placeholder="Enter expected NPS return rate"
                className="text-lg py-6"
              />
              {errors.npsReturnRate && (
                <p className="text-red-500 text-sm">{errors.npsReturnRate}</p>
              )}
            </div>

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

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Tax Bracket (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={taxBracket}
                onChange={(e) => setTaxBracket(e.target.value)}
                placeholder="Enter your tax bracket"
                className="text-lg py-6"
              />
              {errors.taxBracket && (
                <p className="text-red-500 text-sm">{errors.taxBracket}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateComparison}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Compare MF and NPS
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Mutual Fund Net Amount</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.mutualFund.netAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      After tax deductions
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">NPS Lumpsum Amount</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.nps.netAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      60% tax-free withdrawal
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">NPS Annuity Amount</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.nps.annuityAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      40% mandatory annuity
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

              {/* Growth Comparison Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Investment Growth Comparison</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.yearlyData}
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
                          dataKey="mutualFundAmount" 
                          name="Mutual Fund"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="npsAmount" 
                          name="NPS"
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

export default MFvsNPSCalculator; 