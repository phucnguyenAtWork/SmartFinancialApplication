import React from 'react';
import { Card } from '../common/Card';

export function YearlySummary() {
  const data = [
    { year: 2016, h1: 60, h2: 80 },
    { year: 2018, h1: 80, h2: 95 },
    { year: 2019, h1: 70, h2: 90 },
    { year: 2020, h1: 85, h2: 110 },
    { year: 2021, h1: 110, h2: 135 },
    { year: 2022, h1: 125, h2: 155 },
  ];
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Yearly summary</h3>
      <div className="flex h-40 items-end gap-4">
        {data.map((d) => (
          <div key={d.year} className="flex flex-1 flex-col items-center justify-end">
            <div className="flex h-full w-full items-end gap-1">
              <div className="w-1/2 rounded-t-lg bg-indigo-400" style={{ height: `${d.h1}px` }} />
              <div className="w-1/2 rounded-t-lg bg-indigo-200" style={{ height: `${d.h2}px` }} />
            </div>
            <span className="mt-2 text-[11px] text-gray-500">{d.year}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
