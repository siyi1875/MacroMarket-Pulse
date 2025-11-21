import React, { useEffect, useState } from 'react';
import { generateMarketInsight } from '../services/geminiService';
import { DataPoint, InsightResponse } from '../types';
import { METRICS } from '../constants';
import { BrainCircuit, RefreshCw, Key, Lock, Trash2, ExternalLink } from 'lucide-react';

interface Props {
  data: DataPoint[];
  selectedMacros: string[];
  selectedAssets: string[];
  timeRange: string;
}

export const AIAnalyst: React.FC<Props> = ({ data, selectedMacros, selectedAssets, timeRange }) => {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  // API Key Management
  const [userApiKey, setUserApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    // 1. Check if Env var exists (deployed version with secrets)
    const envKeyExists = typeof process !== 'undefined' && process.env?.API_KEY;
    
    // 2. Check LocalStorage (user provided key)
    const localKey = localStorage.getItem('gemini_api_key');

    if (envKeyExists) {
        setHasKey(true);
    } else if (localKey) {
        setUserApiKey(localKey);
        setHasKey(true);
    } else {
        setHasKey(false);
        setShowKeyInput(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (userApiKey.trim().length > 0) {
        localStorage.setItem('gemini_api_key', userApiKey);
        setHasKey(true);
        setShowKeyInput(false);
    }
  };

  const handleRemoveKey = () => {
      localStorage.removeItem('gemini_api_key');
      setUserApiKey('');
      setHasKey(false);
      setInsight(null);
      setShowKeyInput(true);
  };

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

    const result = await generateMarketInsight(macroLabels, assetLabels, timeRange, sample, userApiKey);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 text-indigo-300">
          <BrainCircuit className="w-6 h-6" />
          <h3 className="font-bold text-lg">AI Market Analyst</h3>
        </div>
        
        {hasKey && (
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleRemoveKey}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove saved API Key"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? "Analyzing..." : "Analyze Trends"}
                </button>
            </div>
        )}
      </div>

      <div className="space-y-4 relative z-10 min-h-[150px]">
        {!hasKey ? (
            <div className="flex flex-col items-center justify-center h-full py-4 animate-fade-in">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 max-w-md w-full text-center">
                    <div className="bg-indigo-500/20 p-3 rounded-full w-fit mx-auto mb-4">
                        <Lock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Enable AI Insights</h4>
                    <p className="text-slate-400 text-sm mb-4">
                        To use the AI features, please enter your free Google Gemini API Key. 
                        It is stored locally in your browser and never sent to our servers.
                    </p>
                    
                    <input 
                        type="password" 
                        placeholder="Paste API Key here..."
                        value={userApiKey}
                        onChange={(e) => setUserApiKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 mb-3"
                    />
                    
                    <button 
                        onClick={handleSaveKey}
                        disabled={userApiKey.length < 10}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Key & Unlock
                    </button>

                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs mt-4"
                    >
                        Get a free Gemini API Key <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        ) : insight ? (
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
            <p>Select metrics above and click <span className="text-indigo-400 font-bold">Analyze Trends</span> to get AI-powered insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};