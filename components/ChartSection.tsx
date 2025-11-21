import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DataPoint } from '../types';
import { METRICS } from '../constants';
import { Scaling, Percent, Activity } from 'lucide-react';

interface ChartSectionProps {
  data: DataPoint[];
  selectedMetrics: string[];
}

type ChartMode = 'STANDARD' | 'LOG' | 'PERCENTAGE';

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl bg-opacity-95 z-50">
        <p className="text-slate-300 text-sm mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-medium">
              {entry.name}:
            </span>
            <span className="text-slate-200">
              {mode === 'PERCENTAGE' 
                ? `${entry.value > 0 ? '+' : ''}${entry.value.toFixed(2)}%` 
                : entry.value.toLocaleString()
              } 
              {mode !== 'PERCENTAGE' && METRICS.find(m => m.label === entry.name)?.unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartSection: React.FC<ChartSectionProps> = ({ data, selectedMetrics }) => {
  const [mode, setMode] = useState<ChartMode>('STANDARD');
  
  // Transform data for Percentage Mode
  const chartData = useMemo(() => {
    if (mode !== 'PERCENTAGE' || data.length === 0) return data;

    // Find baseline values (first non-zero value for each metric)
    const baselines: Record<string, number> = {};
    selectedMetrics.forEach(key => {
       const firstValid = data.find(d => (d[key] as number) > 0);
       baselines[key] = firstValid ? (firstValid[key] as number) : 1;
    });

    return data.map(point => {
      const newPoint: any = { ...point };
      selectedMetrics.forEach(key => {
        const base = baselines[key];
        const current = point[key] as number;
        // Calculate % change from start
        newPoint[key] = ((current - base) / base) * 100;
      });
      return newPoint;
    });
  }, [data, mode, selectedMetrics]);

  // Filter metrics configuration based on selection
  const activeConfig = METRICS.filter(m => selectedMetrics.includes(m.id as string));

  const hasLeftAxis = activeConfig.some(m => m.isLeftAxis);
  const hasRightAxis = activeConfig.some(m => !m.isLeftAxis);

  return (
    <div className="w-full h-[450px] md:h-[550px] bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span>Market vs Economy Trends</span>
        </h3>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 self-start lg:self-auto">
          <button
            onClick={() => setMode('STANDARD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === 'STANDARD' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" /> Standard
          </button>
          <button
            onClick={() => setMode('LOG')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === 'LOG' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scaling className="w-3 h-3" /> Log Scale
          </button>
          <button
            onClick={() => setMode('PERCENTAGE')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === 'PERCENTAGE' 
                ? 'bg-teal-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Percent className="w-3 h-3" /> % Performance
          </button>
        </div>
      </div>

      <div className="w-full h-[85%]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              tick={{fontSize: 12}} 
              tickFormatter={(value) => value.substring(0, 7)}
              minTickGap={40}
            />
            
            {/* Left Axis */}
            {(hasLeftAxis || mode === 'PERCENTAGE') && (
              <YAxis 
                yAxisId="left"
                scale={mode === 'LOG' ? 'log' : 'auto'}
                domain={['auto', 'auto']}
                stroke="#cbd5e1"
                tick={{fontSize: 12}}
                label={{ 
                  value: mode === 'PERCENTAGE' ? '% Change from Start' : 'Rate / Index', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#94a3b8' 
                }}
                tickFormatter={(val) => 
                  mode === 'PERCENTAGE' ? `${val.toFixed(0)}%` : val.toLocaleString(undefined, { maximumFractionDigits: 2 })
                }
              />
            )}

            {/* Right Axis (Hidden in Percentage Mode to align all to one scale) */}
            {(hasRightAxis && mode !== 'PERCENTAGE') && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                scale={mode === 'LOG' ? 'log' : 'auto'}
                domain={['auto', 'auto']}
                stroke="#cbd5e1"
                tick={{fontSize: 12}}
                label={{ value: 'Price / Volume', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
              />
            )}

            <Tooltip content={<CustomTooltip mode={mode} />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            {activeConfig.map((metric) => (
              <Line
                key={metric.id}
                // In Percentage mode, everything uses the left axis for direct comparison
                yAxisId={mode === 'PERCENTAGE' ? "left" : (metric.isLeftAxis ? "left" : "right")}
                type="monotone"
                dataKey={metric.id}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {mode === 'PERCENTAGE' && (
         <div className="absolute bottom-20 right-8 bg-slate-900/80 p-2 rounded border border-slate-700 text-xs text-slate-400 max-w-[200px]">
            All values normalized to 0% at start date. Useful for comparing relative growth.
         </div>
      )}
    </div>
  );
};