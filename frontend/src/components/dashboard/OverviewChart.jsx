import React, { useMemo } from 'react';

export function OverviewChart({ data = [] }) {
  
  // 1. MATHEMATICAL CALCULATION
  const { points, areaPath, hasData } = useMemo(() => {
    if (!data || data.length === 0) return { points: "", areaPath: "", hasData: false };

    const values = data.map(d => d.amount);
  
    const min = Math.min(...values, 0); 
    const max = Math.max(...values, 100);
    const range = max - min || 1;
    const coordinates = values.map((val, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 40 - ((val - min) / range) * 35; 
      return [x, y];
    });

    const pointsStr = coordinates.map(p => `${p[0]},${p[1]}`).join(' ');
    
    // Close the loop for the gradient background area
    const areaStr = `0,40 ${pointsStr} 100,40`;

    return { points: pointsStr, areaPath: areaStr, hasData: true };
  }, [data]);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl bg-slate-50/50 px-4 py-4">
        
        {/* SVG Container */}
        <div className="relative flex-1 min-h-0 w-full">
           <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              
              {/* Grid Lines */}
              {[10, 20, 30].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
              ))}
              
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* RENDER LOGIC */}
              {!hasData ? (
                 // Empty State
                 <text x="50" y="20" textAnchor="middle" fontSize="3" fill="#94A3B8">No Activity Yet</text>
              ) : (
                 <>
                    {/* The Fill Area (Gradient) */}
                    <polygon points={areaPath} fill="url(#chartGradient)" />

                    {/* The Line Stroke */}
                    <polyline 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      points={points} 
                      vectorEffect="non-scaling-stroke"
                      className="drop-shadow-sm"
                    />
                 </>
              )}
           </svg>
        </div>

        {/* Dynamic Dates X-Axis */}
        <div className="mt-2 flex justify-between px-1 text-[8px] font-medium text-slate-400 uppercase tracking-wider">
           {hasData && (
             <>
               <span>{formatDate(data[0].date)}</span>
               {data.length > 2 && <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>}
               <span>{formatDate(data[data.length - 1].date)}</span>
             </>
           )}
        </div>
    </div>
  );
}
function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}