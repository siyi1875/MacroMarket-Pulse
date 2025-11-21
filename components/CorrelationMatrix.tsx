import React, { useMemo } from 'react';
import { DataPoint } from '../types';
import { METRICS } from '../constants';

interface Props {
  data: DataPoint[];
  selectedIds: string[];
}

// Helper to calculate Pearson Correlation
const calculateCorrelation = (x: number[], y: number[]) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const CorrelationMatrix: React.FC<Props> = ({ data, selectedIds }) => {
  const correlations = useMemo(() => {
    if (selectedIds.length < 2) return [];

    const pairs: { a: string; b: string; val: number }[] = [];
    
    for (let i = 0; i < selectedIds.length; i++) {
      for (let j = i + 1; j < selectedIds.length; j++) {
        const idA = selectedIds[i];
        const idB = selectedIds[j];
        
        const valuesA = data.map(d => Number(d[idA]));
        const valuesB = data.map(d => Number(d[idB]));
        
        const corr = calculateCorrelation(valuesA, valuesB);
        pairs.push({ a: idA, b: idB, val: corr });
      }
    }
    return pairs;
  }, [data, selectedIds]);

  if (selectedIds.length < 2) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex items-center justify-center text-slate-400">
        Select at least two metrics to see correlations.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Correlations</h3>
      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
        {correlations.map((c, idx) => {
          const metricA = METRICS.find(m => m.id === c.a);
          const metricB = METRICS.find(m => m.id === c.b);
          const isPositive = c.val > 0;
          const strength = Math.abs(c.val);
          
          // Color scale for correlation
          let bgColor = 'bg-slate-700';
          if (c.val > 0.7) bgColor = 'bg-green-500';
          else if (c.val > 0.3) bgColor = 'bg-green-500/50';
          else if (c.val < -0.7) bgColor = 'bg-red-500';
          else if (c.val < -0.3) bgColor = 'bg-red-500/50';

          return (
            <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Relationship</span>
                <span className="text-sm font-medium text-slate-200">
                  {metricA?.label} <span className="text-slate-500">&</span> {metricB?.label}
                </span>
              </div>
              <div className={`px-3 py-1 rounded text-white font-bold text-sm ${bgColor}`}>
                {c.val.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-4">
        * 1.0 is perfect positive match, -1.0 is perfect inverse.
      </p>
    </div>
  );
};