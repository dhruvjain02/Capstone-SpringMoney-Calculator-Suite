'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EquityResults {
  absoluteReturn: number;
  annualizedReturn: number;
  inflationAdjustedReturn: number;
  dividendYield: number;
  totalValue: number;
  yearlyData: Array<{
    year: number;
    investmentValue: number;
    dividendValue: number;
  }>;
  sectorAllocation?: Array<{
    name: string;
    value: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const EquityReturnsCalculator: React.FC = () => {
  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState<string>('');
  const [investmentDate, setInvestmentDate] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [totalDividends, setTotalDividends] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<string>('6');
  const [sectorData, setSectorData] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<EquityResults | null>(null);
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

    if (!initialInvestment) newErrors.initialInvestment = 'Initial investment is required';
    if (!investmentDate) newErrors.investmentDate = 'Investment date is required';
    if (!currentValue) newErrors.currentValue = 'Current value is required';
    if (!inflationRate) newErrors.inflationRate = 'Inflation rate is required';
    else if (parseFloat(inflationRate) < 0 || parseFloat(inflationRate) > 30) {
      newErrors.inflationRate = 'Inflation rate must be between 0% and 30%';
    }

    if (sectorData) {
      try {
        const parsed = JSON.parse(sectorData);
        if (!Array.isArray(parsed)) {
          newErrors.sectorData = 'Sector data must be a valid JSON array';
        }
      } catch {
        newErrors.sectorData = 'Invalid JSON format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate returns
  const calculateReturns = () => {
    if (!validateInputs()) return;

    const initial = parseFloat(initialInvestment);
    const current = parseFloat(currentValue);
    const dividends = parseFloat(totalDividends) || 0;
    const inflation = parseFloat(inflationRate) / 100;
    
    // Calculate time period in years
    const startDate = new Date(investmentDate);
    const today = new Date();
    const years = (today.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Calculate returns
    const absoluteReturn = ((current - initial + dividends) / initial) * 100;
    const annualizedReturn = (Math.pow((current + dividends) / initial, 1/years) - 1) * 100;
    const inflationAdjustedReturn = annualizedReturn - inflation;
    const dividendYield = (dividends / initial) * 100 / years;

    // Generate yearly data
    const yearlyData = [];
    let yearlyValue = initial;
    const yearlyGrowthRate = Math.pow((current / initial), 1/years) - 1;
    const yearlyDividend = dividends / years;

    for (let year = 0; year <= Math.ceil(years); year++) {
      yearlyData.push({
        year,
        investmentValue: yearlyValue,
        dividendValue: yearlyDividend * year
      });
      yearlyValue *= (1 + yearlyGrowthRate);
    }

    // Parse sector allocation if provided
    let sectorAllocation;
    if (sectorData) {
      try {
        sectorAllocation = JSON.parse(sectorData);
      } catch {
        // Ignore parsing errors as they're handled in validation
      }
    }

    const results: EquityResults = {
      absoluteReturn,
      annualizedReturn,
      inflationAdjustedReturn,
      dividendYield,
      totalValue: current + dividends,
      yearlyData,
      sectorAllocation
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Return Performance Insight
    if (annualizedReturn > 15) {
      newInsights.push({
        message: `Excellent performance! Your investment has generated ${annualizedReturn.toFixed(2)}% annualized returns`,
        type: 'success'
      });
    } else if (annualizedReturn > 10) {
      newInsights.push({
        message: `Good performance with ${annualizedReturn.toFixed(2)}% annualized returns`,
        type: 'success'
      });
    } else if (annualizedReturn > 0) {
      newInsights.push({
        message: `Moderate returns of ${annualizedReturn.toFixed(2)}% annually`,
        type: 'info'
      });
    } else {
      newInsights.push({
        message: `Warning: Negative returns of ${annualizedReturn.toFixed(2)}% annually`,
        type: 'warning'
      });
    }

    // Inflation Impact Insight
    if (inflationAdjustedReturn > 0) {
      newInsights.push({
        message: `Your returns are beating inflation by ${inflationAdjustedReturn.toFixed(2)}%`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `Your returns are not keeping up with inflation by ${Math.abs(inflationAdjustedReturn).toFixed(2)}%`,
        type: 'warning'
      });
    }

    // Dividend Yield Insight
    if (dividendYield > 0) {
      newInsights.push({
        message: `Dividend yield of ${dividendYield.toFixed(2)}% provides additional income`,
        type: 'info'
      });
    }

    setResults(results);
    setInsights(newInsights);
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <TrendingUp className="h-8 w-8" />
            Equity Returns Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate and analyze your equity investment returns with comprehensive metrics including
            absolute returns, CAGR, and inflation-adjusted returns.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Initial Investment
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                placeholder="Enter initial investment amount"
                className="text-lg py-6"
              />
              {errors.initialInvestment && (
                <p className="text-red-500 text-sm">{errors.initialInvestment}</p>
              )}
              {initialInvestment && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(initialInvestment))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Investment Date
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="text-lg py-6"
              />
              {errors.investmentDate && (
                <p className="text-red-500 text-sm">{errors.investmentDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Current Value
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Enter current value"
                className="text-lg py-6"
              />
              {errors.currentValue && (
                <p className="text-red-500 text-sm">{errors.currentValue}</p>
              )}
              {currentValue && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(currentValue))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Total Dividends Received
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={totalDividends}
                onChange={(e) => setTotalDividends(e.target.value)}
                placeholder="Enter total dividends (optional)"
                className="text-lg py-6"
              />
              {totalDividends && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(totalDividends))}
                </p>
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

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Sector Allocation (Optional)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="text"
                value={sectorData}
                onChange={(e) => setSectorData(e.target.value)}
                placeholder='[{"name": "IT", "value": 30}, {"name": "Finance", "value": 20}]'
                className="text-lg py-6"
              />
              {errors.sectorData && (
                <p className="text-red-500 text-sm">{errors.sectorData}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateReturns}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Returns
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Value</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.totalValue)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Including dividends
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Annualized Return</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {results.annualizedReturn.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      CAGR
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Real Return</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {results.inflationAdjustedReturn.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Inflation adjusted
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
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Investment Growth</h3>
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
                          dataKey="investmentValue" 
                          name="Investment Value"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="dividendValue" 
                          name="Cumulative Dividends"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sector Allocation Chart */}
              {results.sectorAllocation && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Sector Allocation</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={results.sectorAllocation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {results.sectorAllocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquityReturnsCalculator; 