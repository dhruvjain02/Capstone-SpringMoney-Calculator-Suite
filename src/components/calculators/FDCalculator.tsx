'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface InputField {
  id: string;
  label: string;
  description: string;
  type: string;
  placeholder: string;
  min?: number;
  max?: number;
  step?: string;
  unit?: string;
  showWords?: boolean;
}

interface Projection {
  year: number;
  age: number;
  startingCorpus: number;
  investmentReturns: number;
  expenses: number;
  endingCorpus: number;
}

interface Insight {
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface Insights {
  sustainability: Insight;
  inflationImpact: Insight;
  returnGap: Insight;
  finalCorpus: Insight;
}

interface Inputs {
  initialCorpus: string;
  yearlyExpense: string;
  currentAge: string;
  lifeExpectancy: string;
  inflation: string;
  returnRate: string;
}

interface Errors {
  [key: string]: string;
}

const FDCalculator: React.FC = () => {
  // Input fields configuration
  const inputFields: InputField[] = [
    {
      id: 'initialCorpus',
      label: 'Initial Corpus',
      description: 'Your current savings/investments that you plan to live off',
      type: 'number',
      placeholder: '₹10,00,000',
      min: 100000,
      showWords: true
    },
    {
      id: 'yearlyExpense',
      label: 'Yearly Expense',
      description: 'Your annual living expenses',
      type: 'number',
      placeholder: '₹3,00,000',
      min: 10000,
      showWords: true
    },
    {
      id: 'currentAge',
      label: 'Current Age',
      description: 'Your present age',
      type: 'number',
      placeholder: '40',
      min: 18,
      max: 100
    },
    {
      id: 'lifeExpectancy',
      label: 'Life Expectancy',
      description: 'Expected age until which you need the corpus to last',
      type: 'number',
      placeholder: '85',
      min: 50,
      max: 100
    },
    {
      id: 'inflation',
      label: 'Yearly Inflation',
      description: 'Expected annual inflation rate (5 means 5%)',
      type: 'number',
      placeholder: '5',
      min: 0,
      max: 30,
      step: '0.1',
      unit: '%'
    },
    {
      id: 'returnRate',
      label: 'Return on Investment',
      description: 'Expected annual FD return rate (6 means 6%)',
      type: 'number',
      placeholder: '6',
      min: 0,
      max: 30,
      step: '0.1',
      unit: '%'
    }
  ];

  // State management
  const [inputs, setInputs] = useState<Inputs>({
    initialCorpus: '',
    yearlyExpense: '',
    currentAge: '',
    lifeExpectancy: '',
    inflation: '',
    returnRate: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [results, setResults] = useState<Projection[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [insights, setInsights] = useState<Insights | null>(null);

  // Enhanced utility function to convert numbers to Indian format words
  const numberToWords = (number: number): string => {
    if (number === undefined || number === null || isNaN(number)) return "Zero Rupees";
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    
    const formatted = formatter.format(Math.abs(number));
    const sign = number < 0 ? "Negative " : "";
    
    return sign + formatted;
  };

  // Format number to Indian format
  const formatIndianNumber = (number: number): string => {
    if (number === undefined || number === null || isNaN(number)) return "0";
    return new Intl.NumberFormat('en-IN').format(number);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation function
  const validateInputs = (): boolean => {
    const newErrors: Errors = {};
    const fields = inputFields.reduce((acc: { [key: string]: InputField }, field) => {
      acc[field.id] = field;
      return acc;
    }, {});

    Object.entries(inputs).forEach(([key, value]) => {
      const field = fields[key];
      const numValue = parseFloat(value);
      if (!value && value !== '0') {
        newErrors[key] = `${field.label} is required`;
      } else if (field.min !== undefined && numValue < field.min) {
        newErrors[key] = `${field.label} should be at least ${formatIndianNumber(field.min)}${field.unit || ''}`;
      } else if (field.max !== undefined && numValue > field.max) {
        newErrors[key] = `${field.label} should not exceed ${formatIndianNumber(field.max)}${field.unit || ''}`;
      }
    });

    const lifeExpectancyNum = parseFloat(inputs.lifeExpectancy);
    const currentAgeNum = parseFloat(inputs.currentAge);
    if (lifeExpectancyNum && currentAgeNum && lifeExpectancyNum <= currentAgeNum) {
      newErrors.lifeExpectancy = 'Life expectancy should be greater than current age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate projections
  const calculateProjection = () => {
    if (!validateInputs()) {
      setShowResults(false);
      return;
    }

    const projections: Projection[] = [];
    let currentCorpus = parseFloat(inputs.initialCorpus);
    
    // Convert percentage inputs to decimals
    const inflationRate = parseFloat(inputs.inflation) / 100;
    const returnRate = parseFloat(inputs.returnRate) / 100;
    const yearlyExpense = parseFloat(inputs.yearlyExpense);
    const currentAge = parseFloat(inputs.currentAge);
    const lifeExpectancy = parseFloat(inputs.lifeExpectancy);
    
    for (let year = 0; year <= lifeExpectancy - currentAge; year++) {
      const age = currentAge + year;
      
      // Calculate returns first (earned on beginning corpus)
      const investmentReturns = currentCorpus * returnRate;
      
      // Calculate inflation-adjusted expenses
      const inflatedExpense = yearlyExpense * Math.pow(1 + inflationRate, year);
      
      // Calculate ending corpus
      const endingCorpus = currentCorpus + investmentReturns - inflatedExpense;
      
      projections.push({
        year,
        age,
        startingCorpus: currentCorpus,
        investmentReturns,
        expenses: inflatedExpense,
        endingCorpus
      });
      
      currentCorpus = endingCorpus;
    }
    
    setResults(projections);
    generateInsights(projections);
    setShowResults(true);
  };

  // Generate insights
  const generateInsights = (projections: Projection[]) => {
    if (!projections.length) return;

    const lastProjection = projections[projections.length - 1];
    const sustainabilityYear = projections.findIndex(p => p.endingCorpus < 0);
    const inflationImpact = parseFloat(inputs.yearlyExpense) * Math.pow(1 + parseFloat(inputs.inflation)/100, projections.length - 1);
    const returnGapPercentage = (parseFloat(inputs.returnRate) - parseFloat(inputs.inflation)).toFixed(1);
    
    let returnGapMessage = '';
    if (parseFloat(inputs.returnRate) <= parseFloat(inputs.inflation)) {
      returnGapMessage = `Warning: Your investment returns (${inputs.returnRate}%) are ${Math.abs(parseFloat(returnGapPercentage))}% ${
        parseFloat(inputs.returnRate) === parseFloat(inputs.inflation) ? 'equal to' : 'lower than'
      } inflation (${inputs.inflation}%)`;
    } else {
      returnGapMessage = `Your investment returns (${inputs.returnRate}%) are beating inflation (${inputs.inflation}%) by ${returnGapPercentage}%`;
    }

    setInsights({
      sustainability: {
        message: sustainabilityYear === -1 
          ? "Your corpus is sustainable throughout your expected lifetime!" 
          : `Warning: Your corpus may deplete by age ${parseFloat(inputs.currentAge) + sustainabilityYear}`,
        type: sustainabilityYear === -1 ? 'success' : 'warning'
      },
      inflationImpact: {
        message: `Your yearly expenses will grow from ${numberToWords(parseFloat(inputs.yearlyExpense))} to ${numberToWords(inflationImpact)} in ${projections.length} years due to inflation`,
        type: 'info'
      },
      returnGap: {
        message: returnGapMessage,
        type: parseFloat(inputs.returnRate) > parseFloat(inputs.inflation) ? 'success' : 'warning'
      },
      finalCorpus: {
        message: lastProjection.endingCorpus > 0 
          ? `Estimated final corpus at age ${lastProjection.age}: ${numberToWords(lastProjection.endingCorpus)}` 
          : `Warning: Your corpus will be depleted by age ${lastProjection.age}`,
        type: lastProjection.endingCorpus > 0 ? 'success' : 'warning'
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Calculator className="h-8 w-8" />
            FD Investment Sustainability Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate if your Fixed Deposit investments can sustain your expenses throughout retirement,
            accounting for inflation and investment returns.
          </p>
        </CardHeader>
      </Card>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {inputFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-lg font-semibold text-[#272B2A]">
                  {field.label}
                  <Info 
                    className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help"
                    aria-label={field.description}
                  />
                </label>
                <Input
                  type={field.type}
                  name={field.id}
                  value={inputs[field.id as keyof Inputs]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className="text-lg py-6"
                />
                {errors[field.id] && (
                  <p className="text-red-500 text-sm">{errors[field.id]}</p>
                )}
                {field.showWords && inputs[field.id as keyof Inputs] && (
                  <p className="text-sm text-gray-600">
                    {numberToWords(parseFloat(inputs[field.id as keyof Inputs]))}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={calculateProjection}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Sustainability
          </Button>

          {/* Results Display */}
          {showResults && insights && (
            <div className="mt-8 space-y-6">
              {/* Insights Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(insights).map(([key, insight]) => (
                  <Card key={key} className={`bg-gradient-to-br ${
                    insight.type === 'success' ? 'from-[#108e66]/10 to-white border-[#108e66]' :
                    insight.type === 'warning' ? 'from-amber-50 to-white border-amber-500' :
                    'from-blue-50 to-white border-blue-500'
                  } border-l-4`}>
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

              {/* Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#272B2A] mb-4">Corpus Projection Over Time</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="age" 
                          label={{ value: 'Age', position: 'bottom', offset: -10 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${formatIndianNumber(value)}`}
                          label={{ 
                            value: 'Amount (₹)', 
                            angle: -90, 
                            position: 'insideLeft',
                            offset: -10
                          }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${formatIndianNumber(value)}`, '']}
                          labelFormatter={(label) => `Age: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="startingCorpus" 
                          name="Starting Corpus"
                          stroke="#108e66" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="endingCorpus" 
                          name="Ending Corpus"
                          stroke="#525ECC" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          name="Yearly Expenses"
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

export default FDCalculator; 