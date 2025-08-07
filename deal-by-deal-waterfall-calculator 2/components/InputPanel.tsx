
import React, { useState } from 'react';
import { Investor, Deal } from '../types';
import { PlusCircle, Trash2, UserPlus, ChevronDown, ChevronRight, HelpCircle, AlertTriangle } from 'lucide-react';

// --- Reusable Components ---

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

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative flex items-center group">
        <HelpCircle size={14} className="text-slate-400" />
        <div className="absolute bottom-full mb-2 w-64 p-2 text-xs text-white bg-slate-700 rounded-md scale-0 group-hover:scale-100 transition-transform origin-bottom z-10">
            {text}
        </div>
    </div>
);

const InputGroup: React.FC<{ label: string; tooltip?: string; children: React.ReactNode }> = ({ label, tooltip, children }) => (
    <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
            {label}
            {tooltip && <Tooltip text={tooltip} />}
        </label>
        {children}
    </div>
);

const NumberInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type="number"
        step="0.1"
        {...props}
        className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${props.className}`}
    />
);

// --- Sub-components for InputPanel ---

interface DealSettingsProps {
    deal: Deal;
    allLPs: Investor[];
    updateDeal: (id: string, newDeal: Partial<Deal>) => void;
    removeDeal: (id: string) => void;
}

const DealSettings: React.FC<DealSettingsProps> = ({ deal, allLPs, updateDeal, removeDeal }) => {
    const handleFieldChange = (field: keyof Deal, value: any) => {
        updateDeal(deal.id, { [field]: value });
    };

    const handleNestedChange = (path: string, value: any) => {
        const [field, subfield] = path.split('.');
        const newDeal = JSON.parse(JSON.stringify(deal));
        newDeal[field][subfield] = value;
        updateDeal(deal.id, newDeal);
    };
    
    const handleSplitChange = (tier: 'firstTier' | 'secondTier', party: 'lp' | 'gp', value: number) => {
        const newDeal = JSON.parse(JSON.stringify(deal));
        newDeal[tier].split[party] = value;
        newDeal[tier].split[party === 'lp' ? 'gp' : 'lp'] = 100 - value;
        updateDeal(deal.id, newDeal);
    };

    const handleParticipantChange = (investorId: string, amount: number) => {
        const newParticipants = [...deal.participants];
        const existing = newParticipants.find(p => p.investorId === investorId);
        if (existing) {
            existing.amount = amount;
        } else {
            newParticipants.push({ investorId, amount });
        }
        updateDeal(deal.id, { participants: newParticipants.filter(p => p.amount > 0) });
    };
    
    const handleActualReturnChange = (index: number, value: number | null) => {
        const newReturns = [...deal.actualAnnualReturns];
        newReturns[index] = value;
        updateDeal(deal.id, { actualAnnualReturns: newReturns });
    };


    return (
        <Accordion title={<EditableDealTitle deal={deal} updateDeal={updateDeal} removeDeal={removeDeal} />}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                     <InputGroup label="Timeline (Yrs)">
                        <NumberInput value={deal.timelineYears} onChange={e => handleFieldChange('timelineYears', e.target.valueAsNumber || 0)} />
                    </InputGroup>
                    <InputGroup label="Mgmt. Fee (%)">
                        <NumberInput value={deal.managementFee} onChange={e => handleFieldChange('managementFee', e.target.valueAsNumber || 0)} />
                    </InputGroup>
                    <InputGroup label="Proj. Return (%)">
                        <NumberInput value={deal.projectedAnnualReturn} onChange={e => handleFieldChange('projectedAnnualReturn', e.target.valueAsNumber || 0)} />
                    </InputGroup>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-3">Waterfall Structure</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="LP Pref (%)" tooltip="Annual preferred return paid to LPs before any profit split.">
                           <NumberInput value={deal.preferredReturn} onChange={e => handleFieldChange('preferredReturn', e.target.valueAsNumber || 0)} />
                        </InputGroup>
                    </div>

                    {/* GP Catch-up */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" id={`catchup-${deal.id}`} checked={deal.gpCatchUp.applies} onChange={e => handleNestedChange('gpCatchUp.applies', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <label htmlFor={`catchup-${deal.id}`} className="font-medium text-slate-600">GP Catch-up</label>
                            <Tooltip text="Allows GP to receive a higher share of profits until they have 'caught up' to a certain percentage of total distributions." />
                        </div>
                        {deal.gpCatchUp.applies && (
                             <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-slate-200">
                                <InputGroup label="GP Share (%)">
                                    <NumberInput value={deal.gpCatchUp.percentage} onChange={e => handleNestedChange('gpCatchUp.percentage', e.target.valueAsNumber || 0)} />
                                </InputGroup>
                                <InputGroup label="Until Hurdle (%)" tooltip="The total return % at which the catch-up period ends.">
                                    <NumberInput value={deal.gpCatchUp.hurdle} onChange={e => handleNestedChange('gpCatchUp.hurdle', e.target.valueAsNumber || 0)} />
                                </InputGroup>
                            </div>
                        )}
                    </div>
                    
                    {/* First Tier */}
                     <div className="mt-4 pl-6 border-l-2 border-slate-200">
                         <h5 className="font-medium text-slate-600 mb-2">First Tier Profit Split</h5>
                         <div className="grid grid-cols-3 gap-4 items-end">
                             <InputGroup label="LP Split (%)">
                                <NumberInput value={deal.firstTier.split.lp} onChange={e => handleSplitChange('firstTier', 'lp', e.target.valueAsNumber || 0)} />
                            </InputGroup>
                            <InputGroup label="GP Split (%)">
                                <NumberInput value={deal.firstTier.split.gp} onChange={e => handleSplitChange('firstTier', 'gp', e.target.valueAsNumber || 0)} />
                            </InputGroup>
                             <InputGroup label="Until Hurdle (%)" tooltip="The total return % at which this profit split tier ends.">
                                <NumberInput value={deal.firstTier.hurdle} onChange={e => handleNestedChange('firstTier.hurdle', e.target.valueAsNumber || 0)} />
                            </InputGroup>
                         </div>
                     </div>
                     
                      {/* Second Tier */}
                     <div className="mt-4 pl-6 border-l-2 border-slate-200">
                         <h5 className="font-medium text-slate-600 mb-2">Second Tier Profit Split (Promote)</h5>
                         <div className="grid grid-cols-2 gap-4">
                             <InputGroup label="LP Split (%)">
                                <NumberInput value={deal.secondTier.split.lp} onChange={e => handleSplitChange('secondTier', 'lp', e.target.valueAsNumber || 0)} />
                            </InputGroup>
                            <InputGroup label="GP Split (%)">
                                <NumberInput value={deal.secondTier.split.gp} onChange={e => handleSplitChange('secondTier', 'gp', e.target.valueAsNumber || 0)} />
                            </InputGroup>
                         </div>
                     </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-3">LP Allocation</h4>
                    {allLPs.map(lp => (
                        <div key={lp.id} className="grid grid-cols-2 gap-4 items-center mb-2">
                            <span className="text-sm text-slate-700">{lp.name}</span>
                            <NumberInput
                                placeholder="Investment Amount"
                                value={deal.participants.find(p => p.investorId === lp.id)?.amount || ''}
                                onChange={e => handleParticipantChange(lp.id, e.target.valueAsNumber || 0)}
                            />
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                     <h4 className="font-semibold text-slate-700 mb-3">Annual Valuation/Actual Returns (%)</h4>
                     <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: deal.timelineYears }, (_, i) => (
                           <InputGroup key={i} label={`Year ${i + 1}`}>
                                <NumberInput
                                    placeholder="--"
                                    value={deal.actualAnnualReturns[i] ?? ''}
                                    onChange={e => handleActualReturnChange(i, e.target.value === '' ? null : e.target.valueAsNumber)}
                                />
                           </InputGroup>
                        ))}
                    </div>
                </div>
            </div>
        </Accordion>
    );
};

const EditableDealTitle: React.FC<{deal: Deal, updateDeal: (id: string, newDeal: Partial<Deal>) => void, removeDeal: (id: string) => void}> = ({deal, updateDeal, removeDeal}) => {
    return (
         <div className="flex items-center gap-2 w-full">
            <input 
                type="text" 
                value={deal.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateDeal(deal.id, {name: e.target.value})}
                className="font-semibold text-lg bg-transparent border-none focus:ring-0 p-0 w-full"
            />
            <button onClick={(e) => { e.stopPropagation(); removeDeal(deal.id);}} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
    )
}

// --- Main Component ---

interface InputPanelProps {
    investors: Investor[];
    deals: Deal[];
    setInvestors: React.Dispatch<React.SetStateAction<Investor[]>>;
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
}

export const InputPanel: React.FC<InputPanelProps> = ({ investors, deals, setInvestors, setDeals }) => {
    const lps = investors.filter(inv => !inv.isGP);
    const gps = investors.filter(inv => inv.isGP);
    
    const updateInvestor = (id: string, newInvestor: Partial<Investor>) => {
        setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, ...newInvestor } : inv));
    };

    const addInvestor = (isGP: boolean) => {
        const newInvestor: Investor = {
            id: `inv_${Date.now()}`,
            name: isGP ? `New GP ${gps.length + 1}` : `New LP ${lps.length + 1}`,
            isGP,
            commitment: 0,
            gpCarryPercentage: isGP ? 0 : undefined,
        };
        setInvestors(prev => [...prev, newInvestor]);
    };

    const removeInvestor = (id: string) => {
        setInvestors(prev => prev.filter(inv => inv.id !== id));
        // Also remove from deal participants
        setDeals(prevDeals => prevDeals.map(deal => ({
            ...deal,
            participants: deal.participants.filter(p => p.investorId !== id)
        })));
    };

    const addDeal = () => {
        const newDeal: Deal = {
            id: `deal_${Date.now()}`,
            name: `New Deal ${deals.length + 1}`,
            participants: [],
            projectedAnnualReturn: 20,
            actualAnnualReturns: Array(5).fill(null),
            managementFee: 2,
            timelineYears: 5,
            preferredReturn: 8,
            gpCatchUp: { applies: true, percentage: 100, hurdle: 10 },
            firstTier: { split: { lp: 80, gp: 20 }, hurdle: 20 },
            secondTier: { split: { lp: 50, gp: 50 } },
        };
        setDeals(prev => [...prev, newDeal]);
    };

    const updateDeal = (id: string, newDealData: Partial<Deal>) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, ...newDealData } : d));
    };

    const removeDeal = (id: string) => {
        setDeals(prev => prev.filter(d => d.id !== id));
    };
    
    const totalGpCarry = gps.reduce((sum, gp) => sum + (gp.gpCarryPercentage || 0), 0);
    const totalCommitted = lps.reduce((sum, lp) => sum + lp.commitment, 0);
    const totalAllocated = deals.reduce((sum, deal) => sum + deal.participants.reduce((s, p) => s + p.amount, 0), 0);


    return (
        <div className="h-full overflow-y-auto p-6 bg-slate-50 no-print">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Inputs</h2>
            <p className="text-sm text-slate-500 mb-6">Manage investors and configure deal structures.</p>
            
            <Accordion title="Investors" defaultOpen={true}>
                {/* GPs */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-slate-700">General Partners</h3>
                        <button onClick={() => addInvestor(true)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            <UserPlus size={16}/> Add GP
                        </button>
                    </div>
                    {gps.map(gp => (
                        <div key={gp.id} className="grid grid-cols-[1fr,100px,30px] gap-2 items-center mb-2">
                            <input type="text" value={gp.name} onChange={e => updateInvestor(gp.id, { name: e.target.value })} className="p-2 border border-slate-300 rounded-md"/>
                            <NumberInput placeholder="Carry %" value={gp.gpCarryPercentage || ''} onChange={e => updateInvestor(gp.id, { gpCarryPercentage: e.target.valueAsNumber || 0 })} />
                            <button onClick={() => removeInvestor(gp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {Math.round(totalGpCarry) !== 100 && gps.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-700 bg-amber-100 p-2 rounded-md">
                            <AlertTriangle size={14} /> Total GP carry is {totalGpCarry}%, should be 100%.
                        </div>
                    )}
                </div>

                {/* LPs */}
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-slate-700">Limited Partners</h3>
                        <button onClick={() => addInvestor(false)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            <UserPlus size={16}/> Add LP
                        </button>
                    </div>
                    {lps.map(lp => (
                        <div key={lp.id} className="grid grid-cols-[1fr,100px,30px] gap-2 items-center mb-2">
                            <input type="text" value={lp.name} onChange={e => updateInvestor(lp.id, { name: e.target.value })} className="p-2 border border-slate-300 rounded-md"/>
                            <NumberInput placeholder="Commitment" value={lp.commitment || ''} onChange={e => updateInvestor(lp.id, { commitment: e.target.valueAsNumber || 0 })} />
                            <button onClick={() => removeInvestor(lp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="font-medium text-slate-600">Total Committed Capital:</span>
                        <span className="font-semibold text-slate-800">${totalCommitted.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-medium text-slate-600">Total Allocated to Deals:</span>
                        <span className={`font-semibold ${totalAllocated > totalCommitted ? 'text-red-600' : 'text-slate-800'}`}>${totalAllocated.toLocaleString()}</span>
                    </div>
                </div>
            </Accordion>

            {deals.map(deal => (
                <DealSettings key={deal.id} deal={deal} allLPs={lps} updateDeal={updateDeal} removeDeal={removeDeal} />
            ))}

            <button onClick={addDeal} className="w-full flex items-center justify-center gap-2 p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors">
                <PlusCircle size={20} /> Add New Deal
            </button>
        </div>
    );
};
