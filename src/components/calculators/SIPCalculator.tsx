'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, HelpCircle, Calculator, TrendingUp } from 'lucide-react';

interface SIPResults {
  futureValue: number;
  investedAmount: number;
  wealthGained: number;
  monthlyData: Array<{
    month: number;
    invested: number;
    projectedValue: number;
  }>;
}

const SIPCalculator: React.FC = () => {
  // State management with default values for better user experience
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [years, setYears] = useState<string>('10');
  const [expectedReturn, setExpectedReturn] = useState<string>('12');
  const [results, setResults] = useState<SIPResults | null>(null);
  const [showTooltip, setShowTooltip] = useState({ investment: false, years: false, returns: false });

  // Number formatting functions
  const numberToWords = (num: number | string): string => {
    if (!num && num !== 0) return '';
    if (typeof num === 'string') num = parseFloat(num);
    if (num < 100000) {
      return new Intl.NumberFormat('en-IN').format(num);
    } else if (num < 10000000) {
      return `${(num/100000).toFixed(2)} Lakhs`;
    } else {
      return `${(num/10000000).toFixed(2)} Crores`;
    }
  };

  // Calculation function
  const calculateSIP = () => {
    const monthlyRate = parseFloat(expectedReturn) / (12 * 100);
    const months = parseFloat(years) * 12;
    const investedAmount = monthlyInvestment * months;
    
    const futureValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const monthlyData = Array.from({ length: months + 1 }, (_, i) => ({
      month: i,
      invested: monthlyInvestment * i,
      projectedValue: monthlyInvestment * 
        ((Math.pow(1 + monthlyRate, i) - 1) / monthlyRate) * 
        (1 + monthlyRate)
    }));

    setResults({
      futureValue,
      investedAmount,
      monthlyData,
      wealthGained: futureValue - investedAmount
    });
  };

  // Enhanced input validation
  const handleMonthlyInvestmentChange = (value: string): void => {
    if (value === '') {
      setMonthlyInvestment(0);
      return;
    }
  
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 500 && numValue <= 1000000) {
      setMonthlyInvestment(numValue);
    }
  };

  const handleYearsChange = (value: string): void => {
    if (value === '') {
      setYears('');
      return;
    }
  
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      setYears(value);
    }
  };

  const handleExpectedReturnChange = (value: string): void => {
    if (value === '') {
      setExpectedReturn('');
      return;
    }
  
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      setExpectedReturn(value);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-2xl border border-gray-200">
        {/* Enhanced Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              SIP Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg mt-2 ml-11">
            Plan your wealth creation journey with Systematic Investment Plan
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-8">
            {/* Input Section with Enhanced Styling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Monthly Investment Input */}
              <div className="relative space-y-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <label className="text-lg font-semibold text-gray-700 block">
                    Monthly Investment
                  </label>
                  <HelpCircle 
                    className="w-5 h-5 text-gray-400 cursor-help"
                    onMouseEnter={() => setShowTooltip({...showTooltip, investment: true})}
                    onMouseLeave={() => setShowTooltip({...showTooltip, investment: false})}
                  />
                </div>
                {showTooltip.investment && (
                  <div className="absolute right-0 top-12 z-10 w-64 bg-gray-800 text-white text-sm rounded-lg p-3">
                    Enter the amount you plan to invest monthly through SIP
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => handleMonthlyInvestmentChange(e.target.value)}
                    min={500}
                    max={1000000}
                    step="100"
                    className="w-full pl-8 pr-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  ₹{numberToWords(monthlyInvestment)}
                </p>
              </div>

              {/* Investment Period Input */}
              <div className="relative space-y-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <label className="text-lg font-semibold text-gray-700 block">
                    Time Period
                  </label>
                  <HelpCircle 
                    className="w-5 h-5 text-gray-400 cursor-help"
                    onMouseEnter={() => setShowTooltip({...showTooltip, years: true})}
                    onMouseLeave={() => setShowTooltip({...showTooltip, years: false})}
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => handleYearsChange(e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter years"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">Years</span>
                </div>
                <p className="text-sm text-gray-500">
                  Choose between 1 to 30 years
                </p>
              </div>

              {/* Expected Return Input */}
              <div className="relative space-y-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <label className="text-lg font-semibold text-gray-700 block">
                    Expected Return
                  </label>
                  <HelpCircle 
                    className="w-5 h-5 text-gray-400 cursor-help"
                    onMouseEnter={() => setShowTooltip({...showTooltip, returns: true})}
                    onMouseLeave={() => setShowTooltip({...showTooltip, returns: false})}
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => handleExpectedReturnChange(e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter percentage"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-sm text-gray-500">
                  Historical returns: 8% to 15%
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <button
                onClick={calculateSIP}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <TrendingUp className="w-6 h-6" />
                <span>Calculate Investment Growth</span>
              </button>
            </div>

            {/* Results Section */}
            {results && (
              <div className="space-y-8 animate-fade-in">
                {/* Result Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Investment Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-transform hover:scale-105">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Total Investment
                    </h3>
                    <p className="text-3xl font-bold text-gray-800">
                      ₹{numberToWords(results.investedAmount)}
                    </p>
                  </div>

                  {/* Expected Future Value Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 transition-transform hover:scale-105">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Expected Future Value
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{numberToWords(results.futureValue)}
                    </p>
                  </div>

                  {/* Wealth Gained Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 transition-transform hover:scale-105">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Wealth Gained
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{numberToWords(results.wealthGained)}
                    </p>
                  </div>
                </div>

                {/* Enhanced Chart Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                    Growth Projection
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          label={{ value: 'Months', position: 'bottom', offset: -10 }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          label={{ 
                            value: 'Amount (₹)', 
                            angle: -90, 
                            position: 'insideLeft',
                            offset: -10
                          }}
                          tickFormatter={(value: number) => `₹${numberToWords(value)}`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${numberToWords(value)}`, '']}
                          labelFormatter={(label: string) => `Month ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="invested" 
                          name="Total Investment"
                          stroke="#4B5563" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projectedValue" 
                          name="Projected Value"
                          stroke="#2563EB" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator; 