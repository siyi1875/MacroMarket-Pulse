import React, { useState, useMemo, useEffect } from 'react';
import { METRICS } from './constants';
import { DataPoint, MetricType } from './types';
import { loadMarketData } from './services/dataService';
import { ChartSection } from './components/ChartSection';
import { AIAnalyst } from './components/AIAnalyst';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { Settings2, TrendingUp, BarChart3, Download, Share2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [fullData, setFullData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1Y' | '2Y' | '5Y' | '10Y'>('5Y');
  
  // Defaults: Rates vs Bitcoin
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['interestRate', 'bitcoin']);

  // Load Data on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadMarketData();
        setFullData(data);
      } catch (err) {
        console.error("Failed to load market data", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Filter Data based on Time Range
  const filteredData = useMemo(() => {
    if (fullData.length === 0) return [];
    // Approx days
    let days = 1825; // Default 5Y
    if (timeRange === '1Y') days = 365;
    if (timeRange === '2Y') days = 730;
    if (timeRange === '5Y') days = 1825;
    if (timeRange === '10Y') days = 3650;

    return fullData.slice(-days);
  }, [fullData, timeRange]);

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(id)) {
        // Prevent removing the last metric
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== id);
      }
      // Max 4 metrics to keep chart readable
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const macroMetrics = METRICS.filter(m => m.type === MetricType.MACRO);
  const assetMetrics = METRICS.filter(m => m.type === MetricType.ASSET);
  const selectedMacros = selectedMetrics.filter(id => METRICS.find(m => m.id === id)?.type === MetricType.MACRO);
  const selectedAssets = selectedMetrics.filter(id => METRICS.find(m => m.id === id)?.type === MetricType.ASSET);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p>Loading Historical Market Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              MacroMarket Pulse
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Export Data">
                <Download className="w-5 h-5" />
             </button>
             <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Share Analysis">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Controls Section */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            
            {/* Macro Filters */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Economic Factors
              </h3>
              <div className="flex flex-wrap gap-2">
                {macroMetrics.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMetric(m.id as string)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedMetrics.includes(m.id as string)
                        ? `bg-slate-800 border-${m.color} text-white ring-1 ring-${m.color}`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                    style={{ 
                        borderColor: selectedMetrics.includes(m.id as string) ? m.color : undefined,
                        boxShadow: selectedMetrics.includes(m.id as string) ? `0 0 8px -2px ${m.color}` : 'none'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Filters */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Market Assets
              </h3>
              <div className="flex flex-wrap gap-2">
                {assetMetrics.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMetric(m.id as string)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedMetrics.includes(m.id as string)
                        ? `bg-slate-800 border-${m.color} text-white ring-1 ring-${m.color}`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                    style={{ 
                        borderColor: selectedMetrics.includes(m.id as string) ? m.color : undefined,
                        boxShadow: selectedMetrics.includes(m.id as string) ? `0 0 8px -2px ${m.color}` : 'none'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeframe</h3>
              <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                {(['1Y', '2Y', '5Y', '10Y'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Correlations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChartSection 
              data={filteredData} 
              selectedMetrics={selectedMetrics} 
            />
          </div>
          <div className="lg:col-span-1 h-full">
            <CorrelationMatrix 
              data={filteredData} 
              selectedIds={selectedMetrics} 
            />
          </div>
        </div>

        {/* AI Insights Section */}
        <section>
          <AIAnalyst 
            data={filteredData} 
            selectedMacros={selectedMacros}
            selectedAssets={selectedAssets}
            timeRange={timeRange}
          />
        </section>

        {/* Educational Footer */}
        <footer className="border-t border-slate-800 pt-8 pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-slate-500 text-sm mb-2">
              Data is a combination of real-time Crypto prices (CoinGecko) and accurate historical simulations for Macro/Stocks (FRED/Yahoo proxies).
            </p>
            <p className="text-slate-600 text-xs">
              Learning Tip: Macroeconomics is the study of the economy as a whole. Asset prices often react to how "easy" or "hard" it is to get money (Interest Rates & M2).
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;