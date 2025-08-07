import React, { useState } from 'react';
import { Projections, LPPerformance, GPPerformance, YearlyBreakdown, CalculationOutput } from '../types';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, TrendingUp, ChevronsRight, ChevronDown, ChevronRight } from 'lucide-react';

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatMultiple = (value: number) => `${value.toFixed(2)}x`;

const Accordion: React.FC<{ title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-lg mb-4 bg-white shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-800">
                <div className="flex-grow">{title}</div>
                {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {isOpen && <div className="p-4 border-t border-slate-200">{children}</div>}
        </div>
    );
};

const SummaryCard: React.FC<{ title: string; value: string; icon: React.ElementType; scenario?: string }> = ({ title, value, icon: Icon, scenario }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg mr-4">
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {scenario && <p className="text-xs text-slate-400">{scenario} Scenario</p>}
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactElement }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
           <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
    </div>
);


const PerformanceTable: React.FC<{ data: (LPPerformance | GPPerformance)[], type: 'lp' | 'gp'}> = ({ data, type}) => {
    const isLP = type === 'lp';
    const headers = isLP 
        ? ['Name', 'Allocated', 'Distributions', 'MOIC', 'IRR']
        : ['Name', 'Mgmt Fees', 'Carried Interest', 'Total Earnings'];
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        {headers.map(h => <th key={h} className="px-6 py-3">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.investorId} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.name}</td>
                            {isLP ? (
                                <>
                                    <td className="px-6 py-4">{formatCurrency((row as LPPerformance).allocated)}</td>
                                    <td className="px-6 py-4">{formatCurrency((row as LPPerformance).distributions)}</td>
                                    <td className="px-6 py-4">{formatMultiple((row as LPPerformance).moic)}</td>
                                    <td className="px-6 py-4">{isNaN((row as LPPerformance).irr) ? 'N/A' : formatPercent((row as LPPerformance).irr)}</td>
                                </>
                            ) : (
                                 <>
                                    <td className="px-6 py-4">{formatCurrency((row as GPPerformance).managementFees)}</td>
                                    <td className="px-6 py-4">{formatCurrency((row as GPPerformance).carriedInterest)}</td>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency((row as GPPerformance).totalEarnings)}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

const AnnualSummaryTable: React.FC<{ data: YearlyBreakdown[] }> = ({ data }) => {
    const headers = ['Year', 'Gross Return', 'LP Distributions', 'GP Earnings', 'Total Distribution'];
    return (
         <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>{headers.map(h => <th key={h} className="px-6 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.year} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{row.year}</td>
                            <td className="px-6 py-4">{formatCurrency(row.grossReturn)}</td>
                            <td className="px-6 py-4">{formatCurrency(row.lpDistributions)}</td>
                            <td className="px-6 py-4">{formatCurrency(row.gpEarnings)}</td>
                            <td className="px-6 py-4 font-semibold">{formatCurrency(row.totalDistribution)}</td>
                        </tr>
                    ))}
                     <tr className="bg-slate-100 font-bold text-slate-800">
                        <td className="px-6 py-4">Total</td>
                        <td className="px-6 py-4">{formatCurrency(data.reduce((s, r) => s + r.grossReturn, 0))}</td>
                        <td className="px-6 py-4">{formatCurrency(data.reduce((s, r) => s + r.lpDistributions, 0))}</td>
                        <td className="px-6 py-4">{formatCurrency(data.reduce((s, r) => s + r.gpEarnings, 0))}</td>
                        <td className="px-6 py-4 font-semibold">{formatCurrency(data.reduce((s, r) => s + r.totalDistribution, 0))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};


interface ResultsPanelProps {
    results: Projections | null;
}

type Scenario = 'projected' | 'valuation';
type Tab = 'charts' | 'summary';
type ChartTab = 'annual' | 'cumulativeTier' | 'cumulativeReturn';

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
    const [activeScenario, setActiveScenario] = useState<Scenario>('projected');
    const [activeTab, setActiveTab] = useState<Tab>('charts');
    const [activeChartTab, setActiveChartTab] = useState<ChartTab>('annual');

    if (!results) {
        return (
            <div className="h-full flex items-center justify-center bg-white print-container">
                <div className="text-center no-print">
                    <Briefcase size={48} className="mx-auto text-slate-300" />
                    <h2 className="mt-4 text-xl font-semibold text-slate-600">No Data to Display</h2>
                    <p className="mt-1 text-sm text-slate-400">Add investors and deals to see calculation results.</p>
                </div>
            </div>
        );
    }

    const data: CalculationOutput = results[activeScenario];
    const valuationDataExists = results.valuation.yearlyBreakdown.some(y => y.grossReturn !== 0 || y.lpDistributions !== 0);
    const showValuationToggle = valuationDataExists;

    const renderChart = () => {
        switch(activeChartTab) {
            case 'annual':
                return (
                     <ChartContainer title={`Annual Distribution by Tier (${activeScenario})`}>
                        <BarChart data={data.annualDistributionChartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                            <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="lpPref" stackId="a" name="LP Pref" fill="#8884d8" />
                            <Bar dataKey="lpProfitShare" stackId="a" name="LP Profit Share" fill="#82ca9d" />
                            <Bar dataKey="gpCatchUp" stackId="a" name="GP Catch-up" fill="#ffc658" />
                            <Bar dataKey="gpProfitShare" stackId="a" name="GP Profit Share" fill="#ff8042" />
                            <Bar dataKey="gpMgmtFee" stackId="a" name="GP Mgmt Fee" fill="#ca82c9" />
                        </BarChart>
                    </ChartContainer>
                );
            case 'cumulativeTier':
                 return (
                     <ChartContainer title={`Cumulative Distribution by Tier (${activeScenario})`}>
                        <AreaChart data={data.cumulativeTierChartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                            <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Area type="monotone" dataKey="lpPref" stackId="1" name="LP Pref" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="lpProfitShare" stackId="1" name="LP Profit Share" stroke="#82ca9d" fill="#82ca9d" />
                            <Area type="monotone" dataKey="gpCatchUp" stackId="1" name="GP Catch-up" stroke="#ffc658" fill="#ffc658" />
                            <Area type="monotone" dataKey="gpProfitShare" stackId="1" name="GP Profit Share" stroke="#ff8042" fill="#ff8042" />
                            <Area type="monotone" dataKey="gpMgmtFee" stackId="1" name="GP Mgmt Fee" stroke="#ca82c9" fill="#ca82c9" />
                        </AreaChart>
                    </ChartContainer>
                );
            case 'cumulativeReturn':
                return (
                    <ChartContainer title="Cumulative LP Returns: Projected vs. Valuation">
                        <AreaChart data={results.projected.cumulativeReturnChartData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                             <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                             <Tooltip formatter={(value: number) => formatCurrency(value)} />
                             <Legend />
                             <Area type="monotone" dataKey="projected" name="Projected" stroke="#3b82f6" fill="#bfdbfe" />
                             {showValuationToggle && <Area type="monotone" dataKey="valuation" name="Valuation/Actual" stroke="#16a34a" fill="#bbf7d0" />}
                        </AreaChart>
                    </ChartContainer>
                );
            default: return null;
        }
    }
    
    return (
        <div className="h-full overflow-y-auto bg-white p-6 print-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">Results</h2>
                     <p className="text-sm text-slate-500">Analysis based on current inputs.</p>
                </div>
                <div className="flex items-center gap-4">
                     {showValuationToggle && (
                        <div className="flex items-center p-1 bg-slate-200 rounded-lg no-print">
                            <button onClick={() => setActiveScenario('projected')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${activeScenario === 'projected' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}>Projected</button>
                            <button onClick={() => setActiveScenario('valuation')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${activeScenario === 'valuation' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}>Valuation</button>
                        </div>
                    )}
                    <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 no-print">Generate Report</button>
                </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard title="Total LP Distributions" value={formatCurrency(data.summaryMetrics.totalLPDistributions)} icon={Users} scenario={activeScenario}/>
                <SummaryCard title="Total GP Earnings" value={formatCurrency(data.summaryMetrics.totalGPEarnings)} icon={Briefcase} scenario={activeScenario}/>
                <SummaryCard title="Overall LP MOIC" value={formatMultiple(data.summaryMetrics.overallLPMOIC)} icon={TrendingUp} scenario={activeScenario}/>
                <SummaryCard title="Total GP Carried Interest" value={formatCurrency(data.summaryMetrics.totalGPCarriedInterest)} icon={ChevronsRight} scenario={activeScenario}/>
            </div>
            
            {/* Tabs */}
             <div className="border-b border-slate-200 mb-6 no-print">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('charts')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'charts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Charts</button>
                    <button onClick={() => setActiveTab('summary')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Annual Summary</button>
                </nav>
            </div>
            
            {activeTab === 'charts' && (
                 <div className="no-print">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setActiveChartTab('annual')} className={`px-3 py-1 text-sm rounded-full ${activeChartTab === 'annual' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>Annual Distribution</button>
                        <button onClick={() => setActiveChartTab('cumulativeTier')} className={`px-3 py-1 text-sm rounded-full ${activeChartTab === 'cumulativeTier' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>Cumulative by Tier</button>
                        <button onClick={() => setActiveChartTab('cumulativeReturn')} className={`px-3 py-1 text-sm rounded-full ${activeChartTab === 'cumulativeReturn' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>Cumulative Return</button>
                    </div>
                    {renderChart()}
                </div>
            )}
            
             {activeTab === 'summary' && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Annual Summary ({activeScenario})</h3>
                    <AnnualSummaryTable data={data.yearlyBreakdown} />
                </div>
            )}

            {/* Performance Tables */}
            <div className="space-y-4">
                <Accordion title={`LP Performance (${activeScenario})`} defaultOpen={true}>
                    <PerformanceTable data={data.lpPerformance} type="lp" />
                </Accordion>
                <Accordion title={`GP Performance (${activeScenario})`} defaultOpen={true}>
                    <PerformanceTable data={data.gpPerformance} type="gp" />
                </Accordion>
            </div>
            
             {/* Print only sections */}
            <div className="hidden print-only">
                {/* Print all charts */}
                 <ChartContainer title="Annual Distribution by Tier (Projected)">
                    <BarChart data={results.projected.annualDistributionChartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} />
                        <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="lpPref" stackId="a" name="LP Pref" fill="#8884d8" />
                        <Bar dataKey="lpProfitShare" stackId="a" name="LP Share" fill="#82ca9d" />
                        <Bar dataKey="gpCatchUp" stackId="a" name="GP Catch-up" fill="#ffc658" />
                        <Bar dataKey="gpProfitShare" stackId="a" name="GP Share" fill="#ff8042" />
                        <Bar dataKey="gpMgmtFee" stackId="a" name="GP Mgmt Fee" fill="#ca82c9" />
                    </BarChart>
                </ChartContainer>

                <ChartContainer title="Cumulative LP Returns: Projected vs. Valuation">
                    <AreaChart data={results.projected.cumulativeReturnChartData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} />
                         <YAxis tickFormatter={(val) => formatCurrency(val as number)} />
                         <Tooltip formatter={(value: number) => formatCurrency(value)} />
                         <Legend />
                         <Area type="monotone" dataKey="projected" name="Projected" stroke="#3b82f6" fill="#bfdbfe" />
                         {showValuationToggle && <Area type="monotone" dataKey="valuation" name="Valuation/Actual" stroke="#16a34a" fill="#bbf7d0" />}
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    );
};
