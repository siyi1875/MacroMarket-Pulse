export interface DataPoint {
  date: string;
  timestamp: number;
  // Macro Factors
  cpi: number;
  interestRate: number;
  unemployment: number;
  m2: number; // Billions
  gdp: number;
  // Market Assets
  sp500: number;
  nasdaq: number;
  bitcoin: number;
  ethereum: number;
  gold: number;
  [key: string]: number | string;
}

export enum MetricType {
  MACRO = 'MACRO',
  ASSET = 'ASSET'
}

export interface MetricConfig {
  id: keyof DataPoint;
  label: string;
  type: MetricType;
  color: string;
  unit: string;
  isLeftAxis: boolean; // if true, left Y-axis (usually percentages), else right (Price/Volume)
  description: string;
}

export interface FilterState {
  selectedMacros: string[];
  selectedAssets: string[];
  timeRange: '1Y' | '2Y' | '5Y' | 'ALL';
}

export interface InsightResponse {
  title: string;
  content: string;
  keyTakeaway: string;
}