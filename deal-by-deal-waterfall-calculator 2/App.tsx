import React, { useState, useMemo } from 'react';
import { Investor, Deal, Projections } from './types';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { calculateProjections } from './services/calculator';
import { Briefcase } from 'lucide-react';

// --- Sample Data ---
const initialInvestors: Investor[] = [
  { id: 'gp1', name: 'Lead GP', isGP: true, gpCarryPercentage: 100, commitment: 0 },
  { id: 'lp1', name: 'Family Office', isGP: false, commitment: 1000000 },
  { id: 'lp2', name: 'Angel Investor', isGP: false, commitment: 500000 },
];

const initialDeals: Deal[] = [
  {
    id: 'deal1',
    name: 'Commercial Property Alpha',
    participants: [
      { investorId: 'lp1', amount: 750000 },
      { investorId: 'lp2', amount: 250000 },
    ],
    projectedAnnualReturn: 22,
    actualAnnualReturns: [15, 18, 25, 30, 10],
    managementFee: 2,
    timelineYears: 5,
    preferredReturn: 8,
    gpCatchUp: { applies: true, percentage: 100, hurdle: 10 },
    firstTier: { split: { lp: 80, gp: 20 }, hurdle: 20 },
    secondTier: { split: { lp: 60, gp: 40 } },
  },
];

const App: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);

  const results = useMemo((): Projections | null => {
    if (investors.length === 0 || deals.length === 0) {
      return null;
    }
    try {
      return calculateProjections(investors, deals);
    } catch (error) {
      console.error("Calculation Error:", error);
      return null; // Handle potential errors in calculation
    }
  }, [investors, deals]);

  return (
    <div className="bg-slate-100 min-h-screen">
       <header className="bg-white shadow-sm p-4 border-b border-slate-200 no-print">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
                 <Briefcase className="text-indigo-600" size={32} />
                 <div>
                    <h1 className="text-xl font-bold text-slate-800">Deal-by-Deal Waterfall Calculator</h1>
                    <p className="text-sm text-slate-500">Model deal-level private equity profit distributions.</p>
                 </div>
            </div>
        </header>
        <main className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
            <div className="w-full md:w-1/3 lg:w-2/5 border-r border-slate-200">
                <InputPanel investors={investors} setInvestors={setInvestors} deals={deals} setDeals={setDeals} />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/5">
                <ResultsPanel results={results} />
            </div>
        </main>
    </div>
  );
};

export default App;