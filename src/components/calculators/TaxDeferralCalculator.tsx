'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DeferralResults {
  taxDeferred: {
    finalAmount: number;
    totalContribution: number;
    totalGrowth: number;
    taxPayable: number;
    netAmount: number;
  };
  taxable: {
    finalAmount: number;
    totalContribution: number;
    totalGrowth: number;
    taxesPaid: number;
    netAmount: number;
  };
  yearlyData: Array<{
    year: number;
    taxDeferredAmount: number;
    taxableAmount: number;
    taxDeferredGrowth: number;
    taxableGrowth: number;
  }>;
  benefit: number;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const TaxDeferralCalculator: React.FC = () => {
  // State for form inputs
  const [annualInvestment, setAnnualInvestment] = useState<string>('');
  const [investmentPeriod, setInvestmentPeriod] = useState<string>('');
  const [expectedReturn, setExpectedReturn] = useState<string>('');
  const [currentTaxRate, setCurrentTaxRate] = useState<string>('');
  const [retirementTaxRate, setRetirementTaxRate] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<DeferralResults | null>(null);
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

    if (!annualInvestment) newErrors.annualInvestment = 'Annual investment is required';
    if (!investmentPeriod) newErrors.investmentPeriod = 'Investment period is required';
    else if (parseInt(investmentPeriod) < 1 || parseInt(investmentPeriod) > 50) {
      newErrors.investmentPeriod = 'Investment period must be between 1 and 50 years';
    }

    if (!expectedReturn) newErrors.expectedReturn = 'Expected return rate is required';
    else if (parseFloat(expectedReturn) < 0 || parseFloat(expectedReturn) > 30) {
      newErrors.expectedReturn = 'Expected return must be between 0% and 30%';
    }

    if (!currentTaxRate) newErrors.currentTaxRate = 'Current tax rate is required';
    else if (parseFloat(currentTaxRate) < 0 || parseFloat(currentTaxRate) > 50) {
      newErrors.currentTaxRate = 'Tax rate must be between 0% and 50%';
    }

    if (!retirementTaxRate) newErrors.retirementTaxRate = 'Retirement tax rate is required';
    else if (parseFloat(retirementTaxRate) < 0 || parseFloat(retirementTaxRate) > 50) {
      newErrors.retirementTaxRate = 'Tax rate must be between 0% and 50%';
    }

    if (!inflationRate) newErrors.inflationRate = 'Inflation rate is required';
    else if (parseFloat(inflationRate) < 0 || parseFloat(inflationRate) > 20) {
      newErrors.inflationRate = 'Inflation rate must be between 0% and 20%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate tax deferral benefits
  const calculateDeferral = () => {
    if (!validateInputs()) return;

    const investment = parseFloat(annualInvestment);
    const years = parseInt(investmentPeriod);
    const returnRate = parseFloat(expectedReturn) / 100;
    const currentTax = parseFloat(currentTaxRate) / 100;
    const retirementTax = parseFloat(retirementTaxRate) / 100;
    const inflation = parseFloat(inflationRate) / 100;

    const yearlyData = [];
    let taxDeferredAmount = 0;
    let taxableAmount = 0;
    let totalTaxableGrowth = 0;
    let totalTaxDeferredGrowth = 0;

    // Calculate year by year growth
    for (let year = 1; year <= years; year++) {
      // Tax Deferred Investment
      const taxDeferredGrowth = taxDeferredAmount * returnRate;
      taxDeferredAmount += investment + taxDeferredGrowth;
      totalTaxDeferredGrowth += taxDeferredGrowth;

      // Taxable Investment
      const taxableInvestment = investment * (1 - currentTax);
      const taxableGrowth = taxableAmount * returnRate;
      const taxOnGrowth = taxableGrowth * currentTax;
      taxableAmount += taxableInvestment + taxableGrowth - taxOnGrowth;
      totalTaxableGrowth += taxableGrowth - taxOnGrowth;

      yearlyData.push({
        year,
        taxDeferredAmount,
        taxableAmount,
        taxDeferredGrowth,
        taxableGrowth: taxableGrowth - taxOnGrowth
      });
    }

    // Calculate final tax implications
    const totalContribution = investment * years;
    const taxDeferredTaxPayable = (taxDeferredAmount - totalContribution) * retirementTax;
    const taxDeferredNetAmount = taxDeferredAmount - taxDeferredTaxPayable;
    const taxableNetAmount = taxableAmount;
    const benefit = taxDeferredNetAmount - taxableNetAmount;

    // Generate insights
    const newInsights: Insight[] = [];

    // Tax Savings Insight
    const taxSavingsPercent = ((benefit / taxableNetAmount) * 100).toFixed(1);
    if (parseFloat(taxSavingsPercent) > 20) {
      newInsights.push({
        message: `Excellent tax savings! You'll save ${taxSavingsPercent}% more with tax-deferred investing`,
        type: 'success'
      });
    } else if (parseFloat(taxSavingsPercent) > 0) {
      newInsights.push({
        message: `You'll save ${taxSavingsPercent}% more with tax-deferred investing`,
        type: 'info'
      });
    }

    // Tax Rate Differential Insight
    const taxRateDiff = currentTax - retirementTax;
    if (taxRateDiff > 0.1) {
      newInsights.push({
        message: 'Your lower retirement tax rate significantly boosts the benefits of tax deferral',
        type: 'success'
      });
    } else if (taxRateDiff < -0.1) {
      newInsights.push({
        message: 'Consider tax-free investments as your retirement tax rate is higher than current rate',
        type: 'warning'
      });
    }

    // Investment Period Insight
    if (years < 10) {
      newInsights.push({
        message: 'Consider a longer investment period to maximize tax deferral benefits',
        type: 'info'
      });
    } else if (years >= 20) {
      newInsights.push({
        message: 'Long investment period greatly enhances your tax deferral benefits',
        type: 'success'
      });
    }

    setResults({
      taxDeferred: {
        finalAmount: taxDeferredAmount,
        totalContribution,
        totalGrowth: totalTaxDeferredGrowth,
        taxPayable: taxDeferredTaxPayable,
        netAmount: taxDeferredNetAmount
      },
      taxable: {
        finalAmount: taxableAmount,
        totalContribution,
        totalGrowth: totalTaxableGrowth,
        taxesPaid: (totalContribution * currentTax) + (totalTaxableGrowth * currentTax),
        netAmount: taxableNetAmount
      },
      yearlyData,
      benefit
    });
    setInsights(newInsights);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Coins className="h-8 w-8" />
            Tax Deferral Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Compare the benefits of tax-deferred investments with regular taxable investments.
            Understand how tax deferral can help maximize your long-term wealth.
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
                Annual Investment
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={annualInvestment}
                onChange={(e) => setAnnualInvestment(e.target.value)}
                placeholder="Enter annual investment amount"
                className="text-lg py-6"
              />
              {errors.annualInvestment && (
                <p className="text-red-500 text-sm">{errors.annualInvestment}</p>
              )}
              {annualInvestment && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(annualInvestment))}
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
                Current Tax Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={currentTaxRate}
                onChange={(e) => setCurrentTaxRate(e.target.value)}
                placeholder="Enter current tax rate"
                className="text-lg py-6"
              />
              {errors.currentTaxRate && (
                <p className="text-red-500 text-sm">{errors.currentTaxRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected Retirement Tax Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={retirementTaxRate}
                onChange={(e) => setRetirementTaxRate(e.target.value)}
                placeholder="Enter retirement tax rate"
                className="text-lg py-6"
              />
              {errors.retirementTaxRate && (
                <p className="text-red-500 text-sm">{errors.retirementTaxRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected Inflation Rate (%)
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
            onClick={calculateDeferral}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Tax Deferral Benefits
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Tax Deferral Benefit</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.benefit)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.benefit)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Tax-Deferred Net Amount</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.taxDeferred.netAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      After retirement taxes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Taxable Net Amount</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.taxable.netAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      After regular taxation
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
                          dataKey="taxDeferredAmount" 
                          name="Tax-Deferred Investment"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="taxableAmount" 
                          name="Taxable Investment"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Rate Comparison Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Annual Growth Comparison</h3>
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
                            value: 'Growth (₹)', 
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
                          dataKey="taxDeferredGrowth" 
                          name="Tax-Deferred Growth"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="taxableGrowth" 
                          name="Taxable Growth"
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

export default TaxDeferralCalculator; 