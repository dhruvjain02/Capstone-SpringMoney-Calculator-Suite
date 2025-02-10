'use client'
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, AlertCircle } from 'lucide-react';

interface EMIResults {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  yearlyData: Array<{
    year: number;
    remainingBalance: number;
    totalPaid: number;
    principalPaid: number;
    interestPaid: number;
  }>;
}

const EMICalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [results, setResults] = useState<EMIResults | null>(null);

  const numberToWords = (num: number | string): string => {
    if (!num) return '';
    if (typeof num === 'string') num = parseFloat(num);
    if (num < 100000) {
      return new Intl.NumberFormat('en-IN').format(num);
    } else if (num < 10000000) {
      return `${(num/100000).toFixed(2)} Lakhs`;
    } else {
      return `${(num/10000000).toFixed(2)} Crores`;
    }
  };

  const convertToIndianWords = (num: number | string): string => {
    if (!num) return '';
    if (typeof num === 'string') num = parseFloat(num);
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n < 20) return units[n];
      const unit = n % 10;
      const ten = Math.floor(n / 10) % 10;
      return (tens[ten] + (unit ? ' ' + units[unit] : ''));
    };

    const recursiveConvert = (n: number): string => {
      if (n < 100) return convertLessThanThousand(n);
      if (n < 1000) return units[Math.floor(n/100)] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanThousand(n % 100) : '');
      if (n < 100000) return recursiveConvert(Math.floor(n/1000)) + ' Thousand' + (n % 1000 ? ' ' + recursiveConvert(n % 1000) : '');
      if (n < 10000000) return recursiveConvert(Math.floor(n/100000)) + ' Lakh' + (n % 100000 ? ' ' + recursiveConvert(n % 100000) : '');
      return recursiveConvert(Math.floor(n/10000000)) + ' Crore' + (n % 10000000 ? ' ' + recursiveConvert(n % 10000000) : '');
    };

    return recursiveConvert(Math.round(num));
  };

  const calculateResults = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
    const time = parseFloat(loanTerm) * 12; // Total months

    if (!principal || !rate || !time) return;

    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalAmount = emi * time;
    const totalInterest = totalAmount - principal;

    const yearlyData = [];
    let remainingBalance = principal;
    let totalPaid = 0;
    const yearlyEMI = emi * 12;

    for (let year = 1; year <= Math.ceil(time/12); year++) {
      const yearStart = remainingBalance;
      totalPaid += yearlyEMI;
      const interestForYear = yearlyEMI - (principal * 12 / time);
      remainingBalance = Math.max(0, remainingBalance - (yearlyEMI - interestForYear));

      yearlyData.push({
        year,
        remainingBalance: Math.round(remainingBalance),
        totalPaid: Math.round(totalPaid),
        principalPaid: Math.round(principal - remainingBalance),
        interestPaid: Math.round(totalPaid - (principal - remainingBalance))
      });
    }

    setResults({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      yearlyData
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#108e66]/10 to-[#525ECC]/10 border-b">
          <CardTitle className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-[#108e66]" />
            EMI Calculator
          </CardTitle>
          <p className="text-[#272B2A]/80 text-lg mt-2">
            Calculate your loan EMI and view detailed payment breakdown
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-semibold text-[#272B2A] block">
                  Loan Amount (₹)
                </label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="text-lg py-6"
                  placeholder="Enter loan amount"
                />
                <p className="text-sm text-[#272B2A]/70">
                  ₹{numberToWords(loanAmount)}
                </p>
                <p className="text-sm text-[#272B2A]/60 italic">
                  {convertToIndianWords(loanAmount)} Rupees
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-lg font-semibold text-[#272B2A] block">
                  Interest Rate (% per year)
                </label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="text-lg py-6"
                  placeholder="Enter interest rate"
                />
                <p className="text-sm text-[#272B2A]/60 italic">
                  {convertToIndianWords(interestRate)} Percent
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-lg font-semibold text-[#272B2A] block">
                  Loan Term (Years)
                </label>
                <Input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="text-lg py-6"
                  placeholder="Enter loan term"
                />
                <p className="text-sm text-[#272B2A]/60 italic">
                  {convertToIndianWords(loanTerm)} Years
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={calculateResults}
                className="bg-[#108e66] hover:bg-[#108e66]/90 text-white px-8 py-6 text-lg rounded-lg font-semibold transition-colors"
              >
                Calculate EMI
              </Button>
            </div>

            {results && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Monthly EMI</h3>
                      <p className="text-3xl font-bold text-[#108e66]">₹{numberToWords(results.emi)}</p>
                      <p className="text-sm text-[#272B2A]/60 mt-2 italic">
                        {convertToIndianWords(results.emi)} Rupees per month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Interest</h3>
                      <p className="text-3xl font-bold text-[#525ECC]">₹{numberToWords(results.totalInterest)}</p>
                      <p className="text-sm text-[#272B2A]/60 mt-2 italic">
                        {convertToIndianWords(results.totalInterest)} Rupees
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[#272B2A] mb-2">Total Payment</h3>
                      <p className="text-3xl font-bold text-[#108e66]">₹{numberToWords(results.totalAmount)}</p>
                      <p className="text-sm text-[#272B2A]/60 mt-2 italic">
                        {convertToIndianWords(results.totalAmount)} Rupees
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#272B2A] mb-4">Loan Amortization Schedule</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={results.yearlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#272B2A/20" />
                          <XAxis 
                            dataKey="year" 
                            label={{ value: 'Years', position: 'bottom', offset: -10 }}
                            tick={{ fontSize: 12, fill: '#272B2A' }}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Amount (₹)', 
                              angle: -90, 
                              position: 'insideLeft',
                              offset: -10,
                              fill: '#272B2A'
                            }}
                            tick={{ fontSize: 12, fill: '#272B2A' }}
                            tickFormatter={(value: number) => `₹${numberToWords(value)}`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`₹${numberToWords(value)}`, undefined]}
                            contentStyle={{ 
                              fontSize: '14px',
                              backgroundColor: '#FCFFFE',
                              border: `1px solid #108e66`
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="remainingBalance" 
                            stroke="#108e66" 
                            strokeWidth={2}
                            name="Remaining Balance"
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="principalPaid" 
                            stroke="#525ECC" 
                            strokeWidth={2}
                            name="Principal Paid"
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="interestPaid" 
                            stroke="#FF6B6B" 
                            strokeWidth={2}
                            name="Interest Paid"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EMICalculator; 