import { MetricConfig, MetricType } from './types';

export const METRICS: MetricConfig[] = [
  // Macro
  { 
    id: 'interestRate', 
    label: 'Fed Funds Rate', 
    type: MetricType.MACRO, 
    color: '#ef4444', 
    unit: '%', 
    isLeftAxis: true,
    description: "The interest rate banks charge each other. Higher rates often cool down markets." 
  },
  {
    id: 'cpi',
    label: 'CPI (Inflation)',
    type: MetricType.MACRO,
    color: '#ec4899',
    unit: 'Idx',
    isLeftAxis: true,
    description: "Consumer Price Index. Measures inflation. High inflation hurts purchasing power."
  },
  {
    id: 'unemployment',
    label: 'Unemployment Rate',
    type: MetricType.MACRO,
    color: '#14b8a6',
    unit: '%',
    isLeftAxis: true,
    description: "Percentage of labor force without jobs. Can indicate economic health."
  },
  { 
    id: 'm2', 
    label: 'M2 Money Supply', 
    type: MetricType.MACRO, 
    color: '#22c55e', 
    unit: '$T', 
    isLeftAxis: false,
    description: "Total amount of money in circulation. More money often boosts asset prices."
  },
  // Assets
  { 
    id: 'sp500', 
    label: 'S&P 500', 
    type: MetricType.ASSET, 
    color: '#3b82f6', 
    unit: '$', 
    isLeftAxis: false,
    description: "Top 500 US companies. The benchmark for the stock market."
  },
  { 
    id: 'nasdaq', 
    label: 'NASDAQ', 
    type: MetricType.ASSET, 
    color: '#06b6d4', 
    unit: '$', 
    isLeftAxis: false,
    description: "Tech-heavy stock index. More sensitive to interest rates."
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    type: MetricType.ASSET,
    color: '#f97316',
    unit: '$',
    isLeftAxis: false,
    description: "The original cryptocurrency. Digital gold."
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    type: MetricType.ASSET,
    color: '#8b5cf6',
    unit: '$',
    isLeftAxis: false,
    description: "Smart contract blockchain platform. Highly volatile."
  },
  {
    id: 'gold',
    label: 'Gold',
    type: MetricType.ASSET,
    color: '#fbbf24',
    unit: '$',
    isLeftAxis: false,
    description: "Traditional safe-haven asset. Often rises when markets are uncertain."
  },
];