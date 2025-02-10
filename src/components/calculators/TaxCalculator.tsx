'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info } from 'lucide-react';

interface TaxResults {
  capitalGains: number;
  taxLiability: number;
  purchaseAmount: number;
  saleAmount: number;
  capitalGainsInWords: string;
  taxLiabilityInWords: string;
}

const TaxCalculator: React.FC = () => {
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>('');
  const [results, setResults] = useState<TaxResults | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const numberToWords = (num: number): string => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      else if (n < 20) return units[n] + ' ';
      else if (n < 100) return tens[Math.floor(n / 10)] + ' ' + units[n % 10] + ' ';
      else return units[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
    };
    
    const formatAmount = (n: number): string => {
      if (n === 0) return '';
      let result = '';
      
      // Handle Crores
      if (n >= 10000000) {
        result += convertLessThanThousand(Math.floor(n / 10000000)) + 'Crore ';
        n = n % 10000000;
      }
      
      // Handle Lakhs
      if (n >= 100000) {
        result += convertLessThanThousand(Math.floor(n / 100000)) + 'Lakh ';
        n = n % 100000;
      }
      
      // Handle Thousands
      if (n >= 1000) {
        result += convertLessThanThousand(Math.floor(n / 1000)) + 'Thousand ';
        n = n % 1000;
      }
      
      result += convertLessThanThousand(n);
      return result.trim();
    };

    return formatAmount(num) + ' Rupees';
  };

  const calculateTax = () => {
    if (!purchasePrice || !salePrice || !purchaseDate || !saleDate) {
      alert('Please fill in all fields');
      return;
    }

    const purchase = parseFloat(purchasePrice);
    const sale = parseFloat(salePrice);
    const capitalGains = sale - purchase;
    const taxLiability = capitalGains * 0.20;
    
    setResults({
      capitalGains,
      taxLiability,
      purchaseAmount: purchase,
      saleAmount: sale,
      capitalGainsInWords: numberToWords(Math.abs(Math.round(capitalGains))),
      taxLiabilityInWords: numberToWords(Math.round(taxLiability))
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Introduction Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#108e66]">
            <Calculator className="h-8 w-8" />
            Tax Liability Calculator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Calculate your tax liability on capital gains with and without indexation benefit. This calculator helps you understand the tax implications of your long-term capital gains from the sale of assets.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-[#108e66]/10 border-l-4 border-[#108e66] p-4 rounded-r-lg">
            <h2 className="text-lg font-semibold text-[#108e66] mb-2">Why use this calculator?</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Compare tax liability with and without indexation</li>
              <li>Understand potential tax savings</li>
              <li>Make informed investment decisions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-lg font-semibold text-[#272B2A] mb-2">
                  Purchase Price (₹)
                  <Info 
                    className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help"
                    onMouseEnter={() => setShowTooltip('purchase')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                </label>
                {showTooltip === 'purchase' && (
                  <div className="absolute z-10 bg-gray-900 text-white p-2 rounded text-sm w-64 -mt-2">
                    Enter the original purchase price of your asset
                  </div>
                )}
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Enter purchase price"
                  className="text-lg py-6"
                />
                {purchasePrice && (
                  <p className="text-sm text-gray-600 mt-1">
                    In words: {numberToWords(parseFloat(purchasePrice))}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-lg font-semibold text-[#272B2A] mb-2">
                  Purchase Date
                  <Info 
                    className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help"
                    onMouseEnter={() => setShowTooltip('purchaseDate')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                </label>
                {showTooltip === 'purchaseDate' && (
                  <div className="absolute z-10 bg-gray-900 text-white p-2 rounded text-sm w-64 -mt-2">
                    Select the date when you purchased the asset
                  </div>
                )}
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="text-lg py-6"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-lg font-semibold text-[#272B2A] mb-2">
                  Sale Price (₹)
                  <Info 
                    className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help"
                    onMouseEnter={() => setShowTooltip('sale')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                </label>
                {showTooltip === 'sale' && (
                  <div className="absolute z-10 bg-gray-900 text-white p-2 rounded text-sm w-64 -mt-2">
                    Enter the price at which you sold or plan to sell the asset
                  </div>
                )}
                <Input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter sale price"
                  className="text-lg py-6"
                />
                {salePrice && (
                  <p className="text-sm text-gray-600 mt-1">
                    In words: {numberToWords(parseFloat(salePrice))}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-lg font-semibold text-[#272B2A] mb-2">
                  Sale Date
                  <Info 
                    className="inline-block ml-2 w-5 h-5 text-[#108e66] cursor-help"
                    onMouseEnter={() => setShowTooltip('saleDate')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                </label>
                {showTooltip === 'saleDate' && (
                  <div className="absolute z-10 bg-gray-900 text-white p-2 rounded text-sm w-64 -mt-2">
                    Select the date when you sold or plan to sell the asset
                  </div>
                )}
                <Input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="text-lg py-6"
                />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateTax}
            className="w-full mt-6 bg-[#108e66] hover:bg-[#108e66]/90 text-white text-lg py-6"
          >
            Calculate Tax Liability
          </Button>

          {/* Results Display */}
          {results && (
            <div className="mt-8 space-y-6">
              <Card className="bg-gradient-to-br from-[#108e66]/10 to-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#108e66] mb-4">Capital Gains</h3>
                  <p className="text-3xl font-bold text-[#108e66]">
                    ₹{Math.abs(results.capitalGains).toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({results.capitalGains >= 0 ? 'Profit' : 'Loss'})
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {results.capitalGainsInWords}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#525ECC]/10 to-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#525ECC] mb-4">Tax Liability</h3>
                  <p className="text-3xl font-bold text-[#525ECC]">
                    ₹{results.taxLiability.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {results.taxLiabilityInWords}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculator; 