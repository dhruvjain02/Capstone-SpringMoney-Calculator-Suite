'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Home } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonResults {
  buying: {
    totalCost: number;
    monthlyPayment: number;
    propertyValue: number;
    totalInterest: number;
    maintenanceCosts: number;
    netWorth: number;
  };
  renting: {
    totalCost: number;
    monthlyRent: number;
    totalRentPaid: number;
    potentialInvestment: number;
    investmentReturns: number;
    netWorth: number;
  };
  yearlyProjections: Array<{
    year: number;
    buyingNetWorth: number;
    rentingNetWorth: number;
    propertyValue: number;
    loanBalance: number;
    investmentValue: number;
  }>;
  breakEvenYear: number | null;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const BuyVsRentCalculator: React.FC = () => {
  // State for form inputs
  const [propertyPrice, setPropertyPrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [rentIncrease, setRentIncrease] = useState<string>('');
  const [propertyAppreciation, setPropertyAppreciation] = useState<string>('');
  const [investmentReturn, setInvestmentReturn] = useState<string>('');
  const [maintenanceCost, setMaintenanceCost] = useState<string>('');

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

    if (!propertyPrice) newErrors.propertyPrice = 'Property price is required';
    if (!downPayment) newErrors.downPayment = 'Down payment is required';
    else if (parseFloat(downPayment) < parseFloat(propertyPrice) * 0.2) {
      newErrors.downPayment = 'Down payment should be at least 20% of property price';
    }

    if (!loanTerm) newErrors.loanTerm = 'Loan term is required';
    else if (parseInt(loanTerm) < 5 || parseInt(loanTerm) > 30) {
      newErrors.loanTerm = 'Loan term must be between 5 and 30 years';
    }

    if (!interestRate) newErrors.interestRate = 'Interest rate is required';
    else if (parseFloat(interestRate) < 1 || parseFloat(interestRate) > 20) {
      newErrors.interestRate = 'Interest rate must be between 1% and 20%';
    }

    if (!monthlyRent) newErrors.monthlyRent = 'Monthly rent is required';
    if (!rentIncrease) newErrors.rentIncrease = 'Expected rent increase is required';
    if (!propertyAppreciation) newErrors.propertyAppreciation = 'Property appreciation rate is required';
    if (!investmentReturn) newErrors.investmentReturn = 'Investment return rate is required';
    if (!maintenanceCost) newErrors.maintenanceCost = 'Annual maintenance cost is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate comparison between buying and renting
  const calculateComparison = () => {
    if (!validateInputs()) return;

    const price = parseFloat(propertyPrice);
    const down = parseFloat(downPayment);
    const years = parseInt(loanTerm);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const rent = parseFloat(monthlyRent);
    const rentGrowth = parseFloat(rentIncrease) / 100;
    const appreciation = parseFloat(propertyAppreciation) / 100;
    const investment = parseFloat(investmentReturn) / 100;
    const maintenance = parseFloat(maintenanceCost);

    const loanAmount = price - down;
    const months = years * 12;
    
    // Calculate monthly mortgage payment (EMI)
    const monthlyPayment = (loanAmount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    const yearlyProjections = [];
    let currentPropertyValue = price;
    let currentRent = rent;
    let loanBalance = loanAmount;
    let totalRentPaid = 0;
    let investmentValue = down; // Initial investment equals down payment in renting scenario
    let breakEvenYear = null;

    for (let year = 1; year <= years; year++) {
      // Buying scenario calculations
      currentPropertyValue *= (1 + appreciation);
      const yearlyInterest = loanBalance * (parseFloat(interestRate) / 100);
      const yearlyPrincipal = monthlyPayment * 12 - yearlyInterest;
      loanBalance = Math.max(0, loanBalance - yearlyPrincipal);
      const yearlyMaintenance = currentPropertyValue * (maintenance / 100);
      const buyingNetWorth = currentPropertyValue - loanBalance;

      // Renting scenario calculations
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + rentGrowth);
      investmentValue *= (1 + investment);
      investmentValue += (monthlyPayment - currentRent) * 12; // Invest the difference
      const rentingNetWorth = investmentValue;

      // Check for break-even
      if (buyingNetWorth > rentingNetWorth && !breakEvenYear) {
        breakEvenYear = year;
      }

      yearlyProjections.push({
        year,
        buyingNetWorth,
        rentingNetWorth,
        propertyValue: currentPropertyValue,
        loanBalance,
        investmentValue
      });
    }

    const results: ComparisonResults = {
      buying: {
        totalCost: monthlyPayment * months,
        monthlyPayment,
        propertyValue: currentPropertyValue,
        totalInterest: monthlyPayment * months - loanAmount,
        maintenanceCosts: maintenance * years,
        netWorth: yearlyProjections[years - 1].buyingNetWorth
      },
      renting: {
        totalCost: totalRentPaid,
        monthlyRent: rent,
        totalRentPaid,
        potentialInvestment: investmentValue - totalRentPaid,
        investmentReturns: investmentValue - down,
        netWorth: yearlyProjections[years - 1].rentingNetWorth
      },
      yearlyProjections,
      breakEvenYear
    };

    // Generate insights
    const newInsights: Insight[] = [];

    // Break-even Analysis
    if (breakEvenYear) {
      newInsights.push({
        message: `Buying breaks even with renting after ${breakEvenYear} years`,
        type: breakEvenYear < years / 2 ? 'success' : 'info'
      });
    } else {
      newInsights.push({
        message: 'Renting remains more financially advantageous throughout the period',
        type: 'warning'
      });
    }

    // Monthly Payment Comparison
    if (monthlyPayment > rent * 1.5) {
      newInsights.push({
        message: 'Monthly mortgage payments are significantly higher than rent',
        type: 'warning'
      });
    }

    // Property Appreciation Analysis
    if (appreciation > investment) {
      newInsights.push({
        message: 'Property appreciation rate exceeds investment returns',
        type: 'success'
      });
    } else {
      newInsights.push({
        message: 'Investment returns exceed property appreciation',
        type: 'info'
      });
    }

    // Down Payment Impact
    const downPaymentPercentage = (down / price) * 100;
    if (downPaymentPercentage > 40) {
      newInsights.push({
        message: 'High down payment reduces monthly burden but impacts investment potential',
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
            <Home className="h-8 w-8" />
            Buy vs Rent Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Compare the financial implications of buying versus renting a home,
            considering factors like property appreciation, investment returns, and maintenance costs.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Property Price
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value)}
                placeholder="Enter property price"
                className="text-lg py-6"
              />
              {errors.propertyPrice && (
                <p className="text-red-500 text-sm">{errors.propertyPrice}</p>
              )}
              {propertyPrice && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(propertyPrice))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Down Payment
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="Enter down payment"
                className="text-lg py-6"
              />
              {errors.downPayment && (
                <p className="text-red-500 text-sm">{errors.downPayment}</p>
              )}
              {downPayment && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(downPayment))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Loan Term (Years)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="Enter loan term"
                className="text-lg py-6"
              />
              {errors.loanTerm && (
                <p className="text-red-500 text-sm">{errors.loanTerm}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Interest Rate (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Enter interest rate"
                className="text-lg py-6"
              />
              {errors.interestRate && (
                <p className="text-red-500 text-sm">{errors.interestRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Monthly Rent
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="Enter monthly rent"
                className="text-lg py-6"
              />
              {errors.monthlyRent && (
                <p className="text-red-500 text-sm">{errors.monthlyRent}</p>
              )}
              {monthlyRent && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(monthlyRent))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Rent Increase (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={rentIncrease}
                onChange={(e) => setRentIncrease(e.target.value)}
                placeholder="Enter expected rent increase"
                className="text-lg py-6"
              />
              {errors.rentIncrease && (
                <p className="text-red-500 text-sm">{errors.rentIncrease}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Property Appreciation (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={propertyAppreciation}
                onChange={(e) => setPropertyAppreciation(e.target.value)}
                placeholder="Enter expected appreciation"
                className="text-lg py-6"
              />
              {errors.propertyAppreciation && (
                <p className="text-red-500 text-sm">{errors.propertyAppreciation}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Investment Return (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={investmentReturn}
                onChange={(e) => setInvestmentReturn(e.target.value)}
                placeholder="Enter expected investment return"
                className="text-lg py-6"
              />
              {errors.investmentReturn && (
                <p className="text-red-500 text-sm">{errors.investmentReturn}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Maintenance (%)
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(e.target.value)}
                placeholder="Enter maintenance cost"
                className="text-lg py-6"
              />
              {errors.maintenanceCost && (
                <p className="text-red-500 text-sm">{errors.maintenanceCost}</p>
              )}
            </div>
          </div>

          <Button
            onClick={calculateComparison}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Compare Buying vs Renting
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Monthly Payment</h3>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-[#108e66]">
                        {formatIndianCurrency(results.buying.monthlyPayment)}
                      </p>
                      <p className="text-sm text-gray-600">EMI</p>
                      <p className="text-2xl font-bold text-[#525ECC]">
                        {formatIndianCurrency(results.renting.monthlyRent)}
                      </p>
                      <p className="text-sm text-gray-600">Rent</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Property Value</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.buying.propertyValue)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      After {loanTerm} years
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Net Worth Difference</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(Math.abs(results.buying.netWorth - results.renting.netWorth))}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {results.buying.netWorth > results.renting.netWorth ? 'In favor of buying' : 'In favor of renting'}
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

              {/* Net Worth Comparison Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Net Worth Comparison</h3>
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
                          dataKey="buyingNetWorth" 
                          name="Buying Net Worth"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rentingNetWorth" 
                          name="Renting Net Worth"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="propertyValue" 
                          name="Property Value"
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

export default BuyVsRentCalculator; 