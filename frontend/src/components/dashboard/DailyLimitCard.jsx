import React from 'react';
import { Card } from '../common/Card';

export function DailyLimitCard() {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">Highly risky</span>
        <button className="text-xs text-gray-400">•••</button>
      </div>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Daily Transaction Limit</h3>
      <div className="mb-2 flex items-center justify-between text-xs font-medium">
        <span className="text-gray-700">$1,900.00 spent of $2,499.00</span>
        <span className="text-indigo-600">75%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-indigo-100">
        <div className="h-2 rounded-full bg-indigo-600" style={{ width: '75%' }} />
      </div>
    </Card>
  );
}
