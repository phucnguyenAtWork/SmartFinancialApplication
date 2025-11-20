import React from 'react';
import { Card } from '../common/Card';

export function BankAccountCard() {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Your Bank Account</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-xl border px-3 py-3">
          <div>
            <div className="text-xs text-gray-500">You Send</div>
            <div className="text-base font-semibold text-slate-900">$1,910.34</div>
          </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">USA <span className="text-[9px] text-gray-400">▼</span></div>
        </div>
        <div className="flex items-center justify-between rounded-xl border px-3 py-3">
          <div>
            <div className="text-xs text-gray-500">You Receive</div>
            <div className="text-base font-semibold text-slate-900">$1,910.34</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">BRA <span className="text-[9px] text-gray-400">▼</span></div>
        </div>
        <button className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Send Now</button>
      </div>
    </Card>
  );
}
