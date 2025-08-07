
// Represents an investor in the fund.
export interface Investor {
  id: string; // Unique identifier
  name: string;
  commitment: number; // Total capital committed by an LP.
  isGP: boolean; // True for General Partner, false for Limited Partner.
  gpCarryPercentage?: number; // For GPs, their share of the total carried interest.
}

// Represents a single investment deal.
export interface Deal {
  id: string; // Unique identifier
  name: string;
  // Which LPs are participating in this deal and how much they invested.
  participants: { investorId: string; amount: number; }[];
  projectedAnnualReturn: number; // The single projected return % for forecasts.
  actualAnnualReturns: (number | null)[]; // Year-by-year return % for valuation tracking.
  managementFee: number; // Annual % fee on invested capital.
  timelineYears: number; // The life of the deal in years.

  // The waterfall structure specific to this deal.
  preferredReturn: number; // e.g., 8%
  gpCatchUp: {
    applies: boolean; // Whether this tier is active.
    percentage: number; // GP's share of profits in this band (e.g., 100%).
    hurdle: number; // The return % that ends the catch-up band.
  };
  firstTier: {
    split: { lp: number; gp: number; }; // e.g., {lp: 80, gp: 20}.
    hurdle: number; // The total return % that ends the first tier band.
  };
  secondTier: {
    split: { lp: number; gp: number; }; // e.g., {lp: 50, gp: 50}.
  };

  // Internal calculation property
  unpaidPref?: number;
}

// Data point for annual distribution charts
export interface AnnualDistributionChartData {
  year: number;
  lpPref: number;
  lpProfitShare: number;
  gpCatchUp: number;
  gpProfitShare: number;
  gpMgmtFee: number;
}

// Data point for cumulative return comparison chart
export interface CumulativeReturnChartData {
  year: number;
  projected: number;
  valuation: number | null;
}

// Performance metrics for a single LP
export interface LPPerformance {
  investorId: string;
  name: string;
  allocated: number;
  distributions: number;
  moic: number;
  irr: number;
}

// Performance metrics for a single GP
export interface GPPerformance {
  investorId:string;
  name: string;
  managementFees: number;
  carriedInterest: number;
  totalEarnings: number;
}

// Breakdown of cash flows per year
export interface YearlyBreakdown {
  year: number;
  grossReturn: number;
  lpDistributions: number;
  gpEarnings: number;
  totalDistribution: number;
}

// Summary metrics for the entire portfolio
export interface SummaryMetrics {
    totalLPDistributions: number;
    totalGPEarnings: number;
    overallLPMOIC: number;
    totalGPCarriedInterest: number;
}

// The complete set of calculated results for one scenario (projected or valuation)
export interface CalculationOutput {
    summaryMetrics: SummaryMetrics;
    annualDistributionChartData: AnnualDistributionChartData[];
    cumulativeTierChartData: AnnualDistributionChartData[];
    lpPerformance: LPPerformance[];
    gpPerformance: GPPerformance[];
    yearlyBreakdown: YearlyBreakdown[];
    cumulativeReturnChartData: CumulativeReturnChartData[];
}

// The final object returned by the main calculator service
export interface Projections {
    projected: CalculationOutput;
    valuation: CalculationOutput;
}
