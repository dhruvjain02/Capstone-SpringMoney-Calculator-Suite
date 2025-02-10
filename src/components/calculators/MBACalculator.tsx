'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MBAResults {
  totalCost: number;
  opportunityCost: number;
  totalInvestment: number;
  projectedSalary: number;
  breakEvenYears: number;
  tenYearROI: number;
  yearlyProjections: Array<{
    year: number;
    cumulativeCost: number;
    cumulativeEarnings: number;
    netPosition: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const MBACalculator: React.FC = () => {
  // State for form inputs
  const [currentSalary, setCurrentSalary] = useState<string>('');
  const [tuitionFees, setTuitionFees] = useState<string>('');
  const [livingExpenses, setLivingExpenses] = useState<string>('');
  const [programDuration, setProgramDuration] = useState<string>('');
  const [expectedSalaryHike, setExpectedSalaryHike] = useState<string>('');
  const [annualSalaryGrowth, setAnnualSalaryGrowth] = useState<string>('');
  const [scholarshipAmount, setScholarshipAmount] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<MBAResults | null>(null);
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

    if (!currentSalary) newErrors.currentSalary = 'Current salary is required';
    if (!tuitionFees) newErrors.tuitionFees = 'Tuition fees is required';
    if (!livingExpenses) newErrors.livingExpenses = 'Living expenses is required';
    if (!programDuration) newErrors.programDuration = 'Program duration is required';
    else if (parseFloat(programDuration) < 1 || parseFloat(programDuration) > 3) {
      newErrors.programDuration = 'Program duration must be between 1 and 3 years';
    }

    if (!expectedSalaryHike) newErrors.expectedSalaryHike = 'Expected salary hike is required';
    else if (parseFloat(expectedSalaryHike) < 0 || parseFloat(expectedSalaryHike) > 500) {
      newErrors.expectedSalaryHike = 'Expected salary hike must be between 0% and 500%';
    }

    if (!annualSalaryGrowth) newErrors.annualSalaryGrowth = 'Annual salary growth is required';
    else if (parseFloat(annualSalaryGrowth) < 0 || parseFloat(annualSalaryGrowth) > 50) {
      newErrors.annualSalaryGrowth = 'Annual growth must be between 0% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate MBA ROI
  const calculateROI = () => {
    if (!validateInputs()) return;

    const currentSal = parseFloat(currentSalary);
    const tuition = parseFloat(tuitionFees);
    const living = parseFloat(livingExpenses);
    const duration = parseFloat(programDuration);
    const salaryHike = parseFloat(expectedSalaryHike) / 100;
    const annualGrowth = parseFloat(annualSalaryGrowth) / 100;
    const scholarship = parseFloat(scholarshipAmount) || 0;

    // Calculate costs
    const totalTuition = tuition - scholarship;
    const totalLiving = living * duration;
    const opportunityCost = currentSal * duration;
    const totalInvestment = totalTuition + totalLiving + opportunityCost;

    // Calculate post-MBA salary
    const postMBASalary = currentSal * (1 + salaryHike);

    // Calculate yearly projections
    const yearlyProjections = [];
    const cumulativeCost = totalInvestment;
    let cumulativeEarnings = 0;
    let breakEvenYear = 0;
    let currentSalaryWithoutMBA = currentSal;
    let currentSalaryWithMBA = postMBASalary;

    for (let year = 1; year <= 10; year++) {
      // Calculate earnings differential
      const earningsWithoutMBA = currentSalaryWithoutMBA;
      const earningsWithMBA = currentSalaryWithMBA;
      const yearlyDifferential = earningsWithMBA - earningsWithoutMBA;
      cumulativeEarnings += yearlyDifferential;

      const netPosition = cumulativeEarnings - cumulativeCost;
      
      if (netPosition >= 0 && breakEvenYear === 0) {
        breakEvenYear = year;
      }

      yearlyProjections.push({
        year,
        cumulativeCost,
        cumulativeEarnings,
        netPosition
      });

      // Update salaries for next year
      currentSalaryWithoutMBA *= (1 + (annualGrowth * 0.7)); // Assuming slower growth without MBA
      currentSalaryWithMBA *= (1 + annualGrowth);
    }

    // Calculate 10-year ROI
    const tenYearROI = ((cumulativeEarnings - totalInvestment) / totalInvestment) * 100;

    const results: MBAResults = {
      totalCost: totalTuition + totalLiving,
      opportunityCost,
      totalInvestment,
      projectedSalary: postMBASalary,
      breakEvenYears: breakEvenYear,
      tenYearROI,
      yearlyProjections
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // ROI Insight
    if (tenYearROI > 200) {
      newInsights.push({
        message: `Excellent ROI of ${tenYearROI.toFixed(1)}% over 10 years`,
        type: 'success'
      });
    } else if (tenYearROI > 100) {
      newInsights.push({
        message: `Good ROI of ${tenYearROI.toFixed(1)}% over 10 years`,
        type: 'success'
      });
    } else {
      newInsights.push({
        message: `Moderate ROI of ${tenYearROI.toFixed(1)}% over 10 years`,
        type: 'info'
      });
    }

    // Break-even Insight
    if (breakEvenYear <= 3) {
      newInsights.push({
        message: `Quick break-even period of ${breakEvenYear} years`,
        type: 'success'
      });
    } else if (breakEvenYear <= 5) {
      newInsights.push({
        message: `Average break-even period of ${breakEvenYear} years`,
        type: 'info'
      });
    } else {
      newInsights.push({
        message: `Long break-even period of ${breakEvenYear} years`,
        type: 'warning'
      });
    }

    // Salary Jump Insight
    const salaryIncrease = ((postMBASalary - currentSal) / currentSal) * 100;
    newInsights.push({
      message: `Expected salary increase of ${salaryIncrease.toFixed(1)}% post MBA`,
      type: salaryIncrease > 100 ? 'success' : 'info'
    });

    // Investment Size Insight
    if (totalInvestment > currentSal * 4) {
      newInsights.push({
        message: 'Consider exploring scholarship opportunities to reduce the investment burden',
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
            <GraduationCap className="h-8 w-8" />
            MBA ROI Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate the Return on Investment (ROI) for your MBA education by analyzing costs,
            opportunity costs, and potential salary growth.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Salary */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Current Annual Salary
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={currentSalary}
                onChange={(e) => setCurrentSalary(e.target.value)}
                placeholder="Enter current salary"
                className="text-lg py-6"
              />
              {errors.currentSalary && (
                <p className="text-red-500 text-sm">{errors.currentSalary}</p>
              )}
              {currentSalary && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(currentSalary))}
                </p>
              )}
            </div>

            {/* Tuition Fees */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Total Tuition Fees
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={tuitionFees}
                onChange={(e) => setTuitionFees(e.target.value)}
                placeholder="Enter tuition fees"
                className="text-lg py-6"
              />
              {errors.tuitionFees && (
                <p className="text-red-500 text-sm">{errors.tuitionFees}</p>
              )}
              {tuitionFees && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(tuitionFees))}
                </p>
              )}
            </div>

            {/* Living Expenses */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Living Expenses
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={livingExpenses}
                onChange={(e) => setLivingExpenses(e.target.value)}
                placeholder="Enter living expenses"
                className="text-lg py-6"
              />
              {errors.livingExpenses && (
                <p className="text-red-500 text-sm">{errors.livingExpenses}</p>
              )}
              {livingExpenses && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(livingExpenses))}
                </p>
              )}
            </div>

            {/* Program Duration */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Program Duration (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={programDuration}
                onChange={(e) => setProgramDuration(e.target.value)}
                placeholder="Enter program duration"
                className="text-lg py-6"
              />
              {errors.programDuration && (
                <p className="text-red-500 text-sm">{errors.programDuration}</p>
              )}
            </div>

            {/* Expected Salary Hike */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Expected Salary Hike (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={expectedSalaryHike}
                onChange={(e) => setExpectedSalaryHike(e.target.value)}
                placeholder="Enter expected hike"
                className="text-lg py-6"
              />
              {errors.expectedSalaryHike && (
                <p className="text-red-500 text-sm">{errors.expectedSalaryHike}</p>
              )}
            </div>

            {/* Annual Salary Growth */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Salary Growth (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={annualSalaryGrowth}
                onChange={(e) => setAnnualSalaryGrowth(e.target.value)}
                placeholder="Enter annual growth"
                className="text-lg py-6"
              />
              {errors.annualSalaryGrowth && (
                <p className="text-red-500 text-sm">{errors.annualSalaryGrowth}</p>
              )}
            </div>

            {/* Scholarship Amount */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Scholarship Amount (Optional)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={scholarshipAmount}
                onChange={(e) => setScholarshipAmount(e.target.value)}
                placeholder="Enter scholarship amount"
                className="text-lg py-6"
              />
              {scholarshipAmount && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(scholarshipAmount))}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateROI}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate MBA ROI
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Investment</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.totalInvestment)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Including opportunity cost
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Break-even Period</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {results.breakEvenYears} years
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Time to recover investment
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">10-Year ROI</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {results.tenYearROI.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Return on investment
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

              {/* ROI Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Investment Recovery Projection</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.yearlyProjections}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Years After MBA', position: 'bottom', offset: -10 }}
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
                          dataKey="cumulativeCost" 
                          name="Total Investment"
                          stroke="#FF6B6B" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulativeEarnings" 
                          name="Cumulative Earnings"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="netPosition" 
                          name="Net Position"
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

export default MBACalculator; 