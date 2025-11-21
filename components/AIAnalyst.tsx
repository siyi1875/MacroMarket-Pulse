import React, { useEffect, useState } from 'react';
import { generateMarketInsight } from '../services/geminiService';
import { DataPoint, InsightResponse } from '../types';
import { METRICS } from '../constants';
import { BrainCircuit, RefreshCw } from 'lucide-react';

interface Props {
  data: DataPoint[];
  selectedMacros: string[];
  selectedAssets: string[];
  timeRange: string;
}

export const AIAnalyst: React.FC<Props> = ({ data, selectedMacros, selectedAssets, timeRange }) => {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (selectedMacros.length === 0 && selectedAssets.length === 0) return;
    
    setLoading(true);
    
    // Sample data to save tokens (Start, Middle, End)
    const sample = [
      data[0], 
      data[Math.floor(data.length / 2)], 
      data[data.length - 1]
    ].filter(Boolean);

    // Resolve labels
    const macroLabels = METRICS.filter(m => selectedMacros.includes(m.id as string)).map(m => m.label);
    const assetLabels = METRICS.filter(m => selectedAssets.includes(m.id as string)).map(m => m.label);

    const result = await generateMarketInsight(macroLabels, assetLabels, timeRange, sample);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-generate on mount if data exists, or when selection changes drastically (debounced in real app)
    // For this demo, we'll require manual trigger or trigger on major change to avoid rate limits
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 text-indigo-300">
          <BrainCircuit className="w-6 h-6" />
          <h3 className="font-bold text-lg">AI Market Analyst</h3>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? "Analyzing..." : "Analyze Trends"}
        </button>
      </div>

      <div className="space-y-4 relative z-10 min-h-[150px]">
        {insight ? (
          <div className="animate-fade-in">
            <h4 className="text-xl font-bold text-white mb-2">{insight.title}</h4>
            <p className="text-slate-300 leading-relaxed mb-4 text-sm md:text-base">
              {insight.content}
            </p>
            <div className="bg-indigo-950/50 border-l-4 border-indigo-400 p-3 rounded-r">
              <p className="text-indigo-200 font-medium text-sm">
                💡 Takeaway: {insight.keyTakeaway}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-8">
            <p>Select metrics and click Analyze to get AI-powered insights about the market relationships.</p>
          </div>
        )}
      </div>
    </div>
  );
};