'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface HourlyRateResults {
  minimumHourlyRate: number;
  recommendedHourlyRate: number;
  premiumHourlyRate: number;
  monthlyTargetIncome: number;
  yearlyProjection: number;
  workloadAnalysis: {
    billableHours: number;
    nonBillableHours: number;
    totalWorkingHours: number;
    utilizationRate: number;
  };
  expenseBreakdown: {
    fixedCosts: number;
    variableCosts: number;
    taxes: number;
    savings: number;
    totalExpenses: number;
  };
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const HourlyRateCalculator: React.FC = () => {
  // State for form inputs
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [desiredSavings, setDesiredSavings] = useState<string>('');
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<string>('');
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<string>('');
  const [vacationWeeks, setVacationWeeks] = useState<string>('');
  const [nonBillableHours, setNonBillableHours] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [profitMargin, setProfitMargin] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<HourlyRateResults | null>(null);
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

  // Validation function
  const validateInputs = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!monthlyExpenses) newErrors.monthlyExpenses = 'Monthly expenses are required';
    if (!desiredSavings) newErrors.desiredSavings = 'Desired savings are required';
    if (!workingHoursPerDay) newErrors.workingHoursPerDay = 'Working hours per day are required';
    else if (parseFloat(workingHoursPerDay) < 1 || parseFloat(workingHoursPerDay) > 16) {
      newErrors.workingHoursPerDay = 'Working hours must be between 1 and 16';
    }

    if (!workingDaysPerWeek) newErrors.workingDaysPerWeek = 'Working days per week are required';
    else if (parseFloat(workingDaysPerWeek) < 1 || parseFloat(workingDaysPerWeek) > 7) {
      newErrors.workingDaysPerWeek = 'Working days must be between 1 and 7';
    }

    if (!vacationWeeks) newErrors.vacationWeeks = 'Vacation weeks are required';
    else if (parseFloat(vacationWeeks) < 0 || parseFloat(vacationWeeks) > 52) {
      newErrors.vacationWeeks = 'Vacation weeks must be between 0 and 52';
    }

    if (!nonBillableHours) newErrors.nonBillableHours = 'Non-billable hours are required';
    if (!taxRate) newErrors.taxRate = 'Tax rate is required';
    else if (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 50) {
      newErrors.taxRate = 'Tax rate must be between 0% and 50%';
    }

    if (!profitMargin) newErrors.profitMargin = 'Profit margin is required';
    else if (parseFloat(profitMargin) < 0 || parseFloat(profitMargin) > 100) {
      newErrors.profitMargin = 'Profit margin must be between 0% and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate hourly rate
  const calculateHourlyRate = () => {
    if (!validateInputs()) return;

    const expenses = parseFloat(monthlyExpenses);
    const savings = parseFloat(desiredSavings);
    const hoursPerDay = parseFloat(workingHoursPerDay);
    const daysPerWeek = parseFloat(workingDaysPerWeek);
    const vacation = parseFloat(vacationWeeks);
    const nonBillable = parseFloat(nonBillableHours);
    const tax = parseFloat(taxRate) / 100;
    const profit = parseFloat(profitMargin) / 100;

    // Calculate total working weeks and hours
    const workingWeeks = 52 - vacation;
    const totalWorkingHours = hoursPerDay * daysPerWeek * workingWeeks;
    const billableHours = totalWorkingHours - (nonBillable * workingWeeks);
    const utilizationRate = (billableHours / totalWorkingHours) * 100;

    // Calculate monthly target income including expenses, savings, and taxes
    const monthlyTargetIncome = (expenses + savings) / (1 - tax);
    const yearlyTargetIncome = monthlyTargetIncome * 12;

    // Calculate minimum hourly rate
    const minimumHourlyRate = yearlyTargetIncome / billableHours;
    
    // Calculate recommended and premium rates
    const recommendedHourlyRate = minimumHourlyRate * (1 + profit);
    const premiumHourlyRate = recommendedHourlyRate * 1.5;

    // Calculate expense breakdown
    const yearlyTaxes = yearlyTargetIncome * tax;
    const yearlySavings = savings * 12;
    const yearlyFixedCosts = expenses * 12 * 0.7; // Assuming 70% of expenses are fixed
    const yearlyVariableCosts = expenses * 12 * 0.3; // Assuming 30% of expenses are variable

    const results: HourlyRateResults = {
      minimumHourlyRate,
      recommendedHourlyRate,
      premiumHourlyRate,
      monthlyTargetIncome,
      yearlyProjection: yearlyTargetIncome,
      workloadAnalysis: {
        billableHours,
        nonBillableHours: nonBillable * workingWeeks,
        totalWorkingHours,
        utilizationRate
      },
      expenseBreakdown: {
        fixedCosts: yearlyFixedCosts,
        variableCosts: yearlyVariableCosts,
        taxes: yearlyTaxes,
        savings: yearlySavings,
        totalExpenses: yearlyFixedCosts + yearlyVariableCosts + yearlyTaxes + yearlySavings
      }
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Utilization Rate Insight
    if (utilizationRate < 60) {
      newInsights.push({
        message: `Low utilization rate of ${utilizationRate.toFixed(1)}%. Consider reducing non-billable hours to improve profitability`,
        type: 'warning'
      });
    } else if (utilizationRate > 80) {
      newInsights.push({
        message: `High utilization rate of ${utilizationRate.toFixed(1)}%. Ensure you maintain work quality and avoid burnout`,
        type: 'warning'
      });
    } else {
      newInsights.push({
        message: `Healthy utilization rate of ${utilizationRate.toFixed(1)}%`,
        type: 'success'
      });
    }

    // Work-Life Balance Insight
    const weeklyHours = hoursPerDay * daysPerWeek;
    if (weeklyHours > 50) {
      newInsights.push({
        message: 'Consider reducing working hours to maintain work-life balance',
        type: 'warning'
      });
    } else if (weeklyHours < 30) {
      newInsights.push({
        message: 'You might want to increase working hours to maximize earning potential',
        type: 'info'
      });
    }

    // Rate Structure Insight
    newInsights.push({
      message: `Your rate structure: Minimum (${formatIndianCurrency(minimumHourlyRate)}/hr), Recommended (${formatIndianCurrency(recommendedHourlyRate)}/hr), Premium (${formatIndianCurrency(premiumHourlyRate)}/hr)`,
      type: 'info'
    });

    // Savings Insight
    const savingsRate = (yearlySavings / yearlyTargetIncome) * 100;
    if (savingsRate < 10) {
      newInsights.push({
        message: 'Consider increasing your savings rate for long-term financial security',
        type: 'warning'
      });
    } else if (savingsRate > 30) {
      newInsights.push({
        message: 'Excellent savings rate! You\'re well-positioned for long-term financial goals',
        type: 'success'
      });
    }

    setResults(results);
    setInsights(newInsights);
  };

  // Prepare data for the expense breakdown chart
  const getExpenseBreakdownData = () => {
    if (!results) return [];

    return [
      { name: 'Fixed Costs', value: results.expenseBreakdown.fixedCosts },
      { name: 'Variable Costs', value: results.expenseBreakdown.variableCosts },
      { name: 'Taxes', value: results.expenseBreakdown.taxes },
      { name: 'Savings', value: results.expenseBreakdown.savings }
    ];
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Clock className="h-8 w-8" />
            Hourly Rate Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate your optimal hourly rate based on your expenses, savings goals, and working schedule.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Financial Inputs */}
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

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Desired Monthly Savings
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={desiredSavings}
                onChange={(e) => setDesiredSavings(e.target.value)}
                placeholder="Enter desired savings"
                className="text-lg py-6"
              />
              {errors.desiredSavings && (
                <p className="text-red-500 text-sm">{errors.desiredSavings}</p>
              )}
              {desiredSavings && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(desiredSavings))}
                </p>
              )}
            </div>

            {/* Schedule Inputs */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Working Hours per Day
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={workingHoursPerDay}
                onChange={(e) => setWorkingHoursPerDay(e.target.value)}
                placeholder="Enter working hours"
                className="text-lg py-6"
              />
              {errors.workingHoursPerDay && (
                <p className="text-red-500 text-sm">{errors.workingHoursPerDay}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Working Days per Week
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={workingDaysPerWeek}
                onChange={(e) => setWorkingDaysPerWeek(e.target.value)}
                placeholder="Enter working days"
                className="text-lg py-6"
              />
              {errors.workingDaysPerWeek && (
                <p className="text-red-500 text-sm">{errors.workingDaysPerWeek}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Vacation Weeks per Year
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(e.target.value)}
                placeholder="Enter vacation weeks"
                className="text-lg py-6"
              />
              {errors.vacationWeeks && (
                <p className="text-red-500 text-sm">{errors.vacationWeeks}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Non-Billable Hours per Week
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={nonBillableHours}
                onChange={(e) => setNonBillableHours(e.target.value)}
                placeholder="Enter non-billable hours"
                className="text-lg py-6"
              />
              {errors.nonBillableHours && (
                <p className="text-red-500 text-sm">{errors.nonBillableHours}</p>
              )}
            </div>

            {/* Rate Adjustments */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Tax Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter tax rate"
                className="text-lg py-6"
              />
              {errors.taxRate && (
                <p className="text-red-500 text-sm">{errors.taxRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Profit Margin (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="Enter profit margin"
                className="text-lg py-6"
              />
              {errors.profitMargin && (
                <p className="text-red-500 text-sm">{errors.profitMargin}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateHourlyRate}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Hourly Rate
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Rate Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Minimum Rate</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.minimumHourlyRate)}/hr
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Base rate to cover expenses
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Recommended Rate</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.recommendedHourlyRate)}/hr
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Optimal rate for growth
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Premium Rate</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.premiumHourlyRate)}/hr
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      For high-value projects
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

              {/* Expense Breakdown Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Expense Breakdown</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getExpenseBreakdownData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => formatIndianCurrency(value)}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatIndianCurrency(value), '']}
                        />
                        <Bar dataKey="value" fill="#108e66">
                          {getExpenseBreakdownData().map((entry, index) => (
                            <Cell key={index} fill={['#108e66', '#525ECC', '#FF6B6B', '#FFB86C'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
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

export default HourlyRateCalculator; 