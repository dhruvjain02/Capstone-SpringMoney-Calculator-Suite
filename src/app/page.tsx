import Link from 'next/link';

const calculators = [
  {
    name: 'SIP Calculator',
    description: 'Calculate your Systematic Investment Plan returns',
    path: '/calculators/sip'
  },
  {
    name: 'Tax Calculator',
    description: 'Calculate your income tax',
    path: '/calculators/tax'
  },
  {
    name: 'EMI Calculator',
    description: 'Calculate your Equated Monthly Installments',
    path: '/calculators/emi'
  },
  {
    name: 'FD Calculator',
    description: 'Calculate your Fixed Deposit returns',
    path: '/calculators/fd'
  },
  {
    name: 'FIRE Calculator',
    description: 'Plan your Financial Independence and Early Retirement',
    path: '/calculators/fire'
  },
  {
    name: 'Term Insurance Calculator',
    description: 'Calculate your term insurance needs',
    path: '/calculators/term-insurance'
  },
  {
    name: 'Tax Deferral Calculator',
    description: 'Calculate benefits of tax deferral',
    path: '/calculators/tax-deferral'
  },
  {
    name: 'MF vs NPS Calculator',
    description: 'Compare Mutual Funds with National Pension System',
    path: '/calculators/mf-vs-nps'
  },
  {
    name: 'MBA Calculator',
    description: 'Calculate ROI on MBA education',
    path: '/calculators/mba'
  },
  {
    name: 'Hourly Rate Calculator',
    description: 'Calculate your ideal hourly rate',
    path: '/calculators/hourly-rate'
  },
  {
    name: 'First Crore Calculator',
    description: 'Plan your journey to your first crore',
    path: '/calculators/first-crore'
  },
  {
    name: 'Equity Returns Calculator',
    description: 'Calculate returns on equity investments',
    path: '/calculators/equity-returns'
  },
  {
    name: 'Endowment Calculator',
    description: 'Calculate endowment policy returns',
    path: '/calculators/endowment'
  },
  {
    name: 'Buy vs Rent Calculator',
    description: 'Compare buying versus renting a home',
    path: '/calculators/buy-vs-rent'
  },
  {
    name: 'Annuity Calculator',
    description: 'Calculate your annuity returns',
    path: '/calculators/annuity'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Financial Calculator Hub</h1>
          <p className="text-xl text-gray-600">Your one-stop solution for all financial calculations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {calculators.map((calc, index) => (
            <Link
              key={index}
              href={calc.path}
              className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {calc.name}
                </h2>
                <p className="text-gray-600 flex-grow">{calc.description}</p>
                <div className="mt-4 text-blue-500 group-hover:text-blue-600 text-sm font-medium">
                  Launch Calculator →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
