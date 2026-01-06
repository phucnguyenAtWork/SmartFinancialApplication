import React from 'react';

export function BudgetGauge({ spent = 0, limit = 5000000 }) {
  const safeLimit = limit === 0 ? 1 : limit;
  const percentage = Math.min((spent / safeLimit) * 100, 100);

  // Color Logic
  let color = "#22c55e"; // Green
  if (percentage > 50) color = "#eab308"; // Yellow
  if (percentage > 85) color = "#ef4444"; // Red

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <h3 className="mb-2 w-full text-left font-bold text-slate-900">Budget Health</h3>
      
      <div className="relative flex h-32 w-full items-end justify-center">
        
        <svg viewBox="0 0 200 100" className="w-full h-full">
          
          {/* Background Track */}
          <path
            d="M 30 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="20" 
            strokeLinecap="round"
          />
          
          {/* Progress Arc */}
          <path
            d="M 30 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${percentage} 100`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text (Adjusted position to sit snugly in the arch) */}
        <div className="absolute bottom-0 mb-1 flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-800">{Math.round(percentage)}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Used</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex w-full justify-between border-t border-slate-50 pt-4 text-sm">
        <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400">Spent</span>
            <span className="font-bold text-slate-700">{spent.toLocaleString()}₫</span>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-xs font-medium text-slate-400">Limit</span>
            <span className="font-bold text-slate-700">{limit.toLocaleString()}₫</span>
        </div>
      </div>
    </div>
  );
}