import React from 'react';
import { Card } from '../common/Card';

export function TransactionTable() {
  const rows = [
    { name: 'Marilyn Ramirez', email: 'ckctm12@gmail.com', invoice: 'INV29836490', tracking: 'LM58040557CN', amount: '$3,200.00' },
    { name: 'Marilyn Ramirez', email: 'ckctm12@gmail.com', invoice: 'INV29836491', tracking: 'AZ93854035US', amount: '$1,250.00' },
    { name: 'Marilyn Ramirez', email: 'ckctm12@gmail.com', invoice: 'INV29836492', tracking: 'Main Road, Sunderland', amount: '$980.00' },
  ];
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Transaction</h3>
        <button className="flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium text-gray-600">Monthly <span className="text-[10px] text-gray-400">▼</span></button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[11px] uppercase tracking-wide text-gray-400">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Invoice</th>
              <th className="pb-2 pr-4">Tracking</th>
              <th className="pb-2 pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/32?img=${i + 12}`} alt={r.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-gray-500">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-xs font-medium text-indigo-600">{r.invoice}</td>
                <td className="py-3 pr-4 text-xs text-gray-500">{r.tracking}</td>
                <td className="py-3 pr-4 text-sm font-semibold text-slate-900">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
