import React from 'react';
import { Card } from '../common/Card';

export function CardsPanel() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Cards</h3>
        <button className="text-xs text-gray-400">•••</button>
      </div>
      <div className="h-44 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 p-5 text-white shadow-lg">
        <div className="flex justify-between text-[11px] text-indigo-100"><span>Mastercard</span><span>💳</span></div>
        <div className="mt-6 text-lg font-semibold tracking-[0.25em]">6375 8456 9825 6754</div>
        <div className="mt-6 flex justify-between text-xs">
          <div>
            <div className="text-indigo-100">Name</div>
            <div className="font-medium">John Mox</div>
          </div>
          <div>
            <div className="text-indigo-100">Exp Date</div>
            <div className="font-medium">08/28</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
