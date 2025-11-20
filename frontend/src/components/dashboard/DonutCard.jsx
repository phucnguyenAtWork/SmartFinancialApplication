import React from 'react';
import { Card } from '../common/Card';

export function DonutCard({ title, amount, change, positive }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
        <svg viewBox="0 0 36 36" className="h-8 w-8">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="4" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#4F46E5" strokeWidth="4" strokeDasharray="70 100" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500">{title}</div>
        <div className="text-xl font-semibold text-slate-900">{amount}</div>
        <div className={`mt-1 text-[11px] ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{change} Per year</div>
      </div>
    </Card>
  );
}
