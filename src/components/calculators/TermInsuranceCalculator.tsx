'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface InsuranceResults {
  totalCoverage: number;
  yearlyPremium: number;
  monthlyPremium: number;
  coverageBreakdown: {
    familyExpenses: number;
    outstandingLoans: number;
    childrenEducation: number;
    spouseRetirement: number;
    emergencyFund: number;
  };
  yearlyProjections: Array<{
    year: number;
    age: number;
    coverage: number;
    premium: number;
    familyIncome: number;
  }>;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const TermInsuranceCalculator: React.FC = () => {
  // State for form inputs
  const [age, setAge] = useState<string>('');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [outstandingLoans, setOutstandingLoans] = useState<string>('');
  const [numberOfChildren, setNumberOfChildren] = useState<string>('');
  const [childrenEducationCost, setChildrenEducationCost] = useState<string>('');
  const [spouseAge, setSpouseAge] = useState<string>('');
  const [spouseIncome, setSpouseIncome] = useState<string>('');
  const [existingInsurance, setExistingInsurance] = useState<string>('');
  const [policyTerm, setPolicyTerm] = useState<string>('');

  // State for results and insights
  const [results, setResults] = useState<InsuranceResults | null>(null);
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

    if (!age) newErrors.age = 'Age is required';
    else if (parseInt(age) < 18 || parseInt(age) > 65) {
      newErrors.age = 'Age must be between 18 and 65';
    }

    if (!annualIncome) newErrors.annualIncome = 'Annual income is required';
    if (!monthlyExpenses) newErrors.monthlyExpenses = 'Monthly expenses is required';
    if (!policyTerm) newErrors.policyTerm = 'Policy term is required';
    else if (parseInt(policyTerm) < 5 || parseInt(policyTerm) > 40) {
      newErrors.policyTerm = 'Policy term must be between 5 and 40 years';
    }

    if (spouseAge && (parseInt(spouseAge) < 18 || parseInt(spouseAge) > 65)) {
      newErrors.spouseAge = 'Spouse age must be between 18 and 65';
    }

    if (numberOfChildren && parseInt(numberOfChildren) > 5) {
      newErrors.numberOfChildren = 'Number of children cannot exceed 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate insurance coverage
  const calculateCoverage = () => {
    if (!validateInputs()) return;

    const ageNum = parseInt(age);
    const annualIncomeNum = parseFloat(annualIncome);
    const monthlyExpensesNum = parseFloat(monthlyExpenses);
    const outstandingLoansNum = parseFloat(outstandingLoans) || 0;
    const childrenEducationCostNum = parseFloat(childrenEducationCost) || 0;
    const spouseIncomeNum = parseFloat(spouseIncome) || 0;
    const existingInsuranceNum = parseFloat(existingInsurance) || 0;
    const policyTermNum = parseInt(policyTerm);

    // Calculate family expenses coverage (15 years of expenses)
    const yearlyExpenses = monthlyExpensesNum * 12;
    const familyExpenses = yearlyExpenses * 15;

    // Calculate children's education fund
    const educationFund = parseInt(numberOfChildren) > 0 ? 
      childrenEducationCostNum * parseInt(numberOfChildren) : 0;

    // Calculate spouse retirement fund
    const spouseRetirementFund = spouseAge ? 
      Math.max(0, (annualIncomeNum - spouseIncomeNum) * 15) : 0;

    // Calculate emergency fund (2 years of annual income)
    const emergencyFund = annualIncomeNum * 2;

    // Calculate total coverage needed
    const totalCoverageNeeded = familyExpenses + 
      outstandingLoansNum + 
      educationFund + 
      spouseRetirementFund + 
      emergencyFund;

    // Adjust for existing insurance
    const additionalCoverageNeeded = Math.max(0, totalCoverageNeeded - existingInsuranceNum);

    // Calculate premium (rough estimate)
    const baseRate = 0.0005; // Base premium rate per 1000 of coverage
    const ageFactor = 1 + ((ageNum - 18) * 0.03); // 3% increase per year of age
    const yearlyPremium = (additionalCoverageNeeded * baseRate * ageFactor);
    const monthlyPremium = yearlyPremium / 12;

    // Generate yearly projections
    const yearlyProjections = [];
    for (let year = 0; year <= policyTermNum; year++) {
      yearlyProjections.push({
        year,
        age: ageNum + year,
        coverage: additionalCoverageNeeded,
        premium: yearlyPremium,
        familyIncome: yearlyExpenses * (15 - year)
      });
    }

    // Generate insights
    const newInsights: Insight[] = [];

    // Coverage Adequacy Insight
    const coverageToIncomeRatio = additionalCoverageNeeded / annualIncomeNum;
    if (coverageToIncomeRatio < 10) {
      newInsights.push({
        message: 'Consider increasing coverage. Experts recommend 10-15 times annual income',
        type: 'warning'
      });
    } else if (coverageToIncomeRatio >= 15) {
      newInsights.push({
        message: 'Excellent coverage level! Your family will be well protected',
        type: 'success'
      });
    }

    // Premium Affordability Insight
    const premiumToIncomeRatio = (yearlyPremium / annualIncomeNum) * 100;
    if (premiumToIncomeRatio > 5) {
      newInsights.push({
        message: 'Premium might be high relative to income. Consider adjusting coverage or term',
        type: 'warning'
      });
    } else {
      newInsights.push({
        message: 'Premium is within affordable range',
        type: 'success'
      });
    }

    // Policy Term Insight
    const idealTerm = Math.min(60 - ageNum, 30);
    if (policyTermNum < idealTerm) {
      newInsights.push({
        message: `Consider extending policy term to ${idealTerm} years for better protection`,
        type: 'info'
      });
    }

    setResults({
      totalCoverage: additionalCoverageNeeded,
      yearlyPremium,
      monthlyPremium,
      coverageBreakdown: {
        familyExpenses,
        outstandingLoans: outstandingLoansNum,
        childrenEducation: educationFund,
        spouseRetirement: spouseRetirementFund,
        emergencyFund
      },
      yearlyProjections
    });
    setInsights(newInsights);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Shield className="h-8 w-8" />
            Term Insurance Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate the optimal term insurance coverage for your family's financial security.
            Get personalized insights based on your income, expenses, and family needs.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Your Age
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="text-lg py-6"
              />
              {errors.age && (
                <p className="text-red-500 text-sm">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Annual Income
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="Enter annual income"
                className="text-lg py-6"
              />
              {errors.annualIncome && (
                <p className="text-red-500 text-sm">{errors.annualIncome}</p>
              )}
              {annualIncome && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(annualIncome))}
                </p>
              )}
            </div>

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
                Outstanding Loans
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={outstandingLoans}
                onChange={(e) => setOutstandingLoans(e.target.value)}
                placeholder="Enter outstanding loans"
                className="text-lg py-6"
              />
              {outstandingLoans && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(outstandingLoans))}
                </p>
              )}
            </div>

            {/* Family Details */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Number of Children
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={numberOfChildren}
                onChange={(e) => setNumberOfChildren(e.target.value)}
                placeholder="Enter number of children"
                className="text-lg py-6"
              />
              {errors.numberOfChildren && (
                <p className="text-red-500 text-sm">{errors.numberOfChildren}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Children's Education Cost
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={childrenEducationCost}
                onChange={(e) => setChildrenEducationCost(e.target.value)}
                placeholder="Enter education cost per child"
                className="text-lg py-6"
              />
              {childrenEducationCost && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(childrenEducationCost))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Spouse Age
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={spouseAge}
                onChange={(e) => setSpouseAge(e.target.value)}
                placeholder="Enter spouse age"
                className="text-lg py-6"
              />
              {errors.spouseAge && (
                <p className="text-red-500 text-sm">{errors.spouseAge}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Spouse Annual Income
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={spouseIncome}
                onChange={(e) => setSpouseIncome(e.target.value)}
                placeholder="Enter spouse income"
                className="text-lg py-6"
              />
              {spouseIncome && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(spouseIncome))}
                </p>
              )}
            </div>

            {/* Insurance Details */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-[#272B2A]">
                Existing Life Insurance
                <Info className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help" />
              </label>
              <Input
                type="number"
                value={existingInsurance}
                onChange={(e) => setExistingInsurance(e.target.value)}
                placeholder="Enter existing coverage"
                className="text-lg py-6"
              />
              {existingInsurance && (
                <p className="text-sm text-gray-600">
                  {formatIndianCurrency(parseFloat(existingInsurance))}
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
          </div>

          <Button
            onClick={calculateCoverage}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Insurance Coverage
          </Button>

          {/* Results Section */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Recommended Coverage</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.totalCoverage)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.totalCoverage)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Yearly Premium</h3>
                    <p className="text-3xl font-bold text-[#525ECC]">
                      {formatIndianCurrency(results.yearlyPremium)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.yearlyPremium)} per year
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Monthly Premium</h3>
                    <p className="text-3xl font-bold text-[#108e66]">
                      {formatIndianCurrency(results.monthlyPremium)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {numberToWords(results.monthlyPremium)} per month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Coverage Breakdown */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Coverage Breakdown</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Family Expenses',
                            value: results.coverageBreakdown.familyExpenses,
                            color: '#108e66'
                          },
                          {
                            name: 'Outstanding Loans',
                            value: results.coverageBreakdown.outstandingLoans,
                            color: '#525ECC'
                          },
                          {
                            name: 'Children Education',
                            value: results.coverageBreakdown.childrenEducation,
                            color: '#FF6B6B'
                          },
                          {
                            name: 'Spouse Retirement',
                            value: results.coverageBreakdown.spouseRetirement,
                            color: '#FFB86C'
                          },
                          {
                            name: 'Emergency Fund',
                            value: results.coverageBreakdown.emergencyFund,
                            color: '#4D4D4D'
                          }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${numberToWords(value)}`} />
                        <Tooltip
                          formatter={(value: number) => [formatIndianCurrency(value), 'Amount']}
                        />
                        <Bar dataKey="value" fill="#108e66">
                          {[
                            '#108e66',
                            '#525ECC',
                            '#FF6B6B',
                            '#FFB86C',
                            '#4D4D4D'
                          ].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

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

              {/* Coverage Timeline */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Coverage Timeline</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.yearlyProjections}
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
                          dataKey="coverage" 
                          name="Insurance Coverage"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="familyIncome" 
                          name="Family Income Need"
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

export default TermInsuranceCalculator; 