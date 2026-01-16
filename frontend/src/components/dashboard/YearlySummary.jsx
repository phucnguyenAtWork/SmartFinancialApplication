import React, { useMemo } from 'react';
import { Card } from '../common/Card';

export function YearlySummary({ transactions = [] }) {
  
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [{ year: new Date().getFullYear(), income: 0, expense: 0 }];
    }

    const yearMap = {};

    transactions.forEach(tx => {
      if (!tx.occurred_at) return;
      const year = new Date(tx.occurred_at).getFullYear();
      
      if (!yearMap[year]) yearMap[year] = { year, income: 0, expense: 0 };

      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') yearMap[year].income += amount;
      else if (tx.type === 'EXPENSE') yearMap[year].expense += amount;
    });

    return Object.values(yearMap).sort((a, b) => a.year - b.year);
  }, [transactions]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.flatMap(d => [d.income, d.expense]));
    return max > 0 ? max : 1;
  }, [chartData]);

  const getHeight = (value) => {
    if (value === 0) return 4;
    // Cap height at 120px
    return Math.min(Math.floor((value / maxValue) * 120), 120);
  };

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Yearly summary</h3>
      
      
      <div className="flex h-40 items-end gap-4 px-2">
        {chartData.map((d) => (
          <div key={d.year} className="flex flex-1 flex-col items-center justify-end group">
            
            
            <div className="flex h-full w-full max-w-[60px] items-end gap-1 mx-auto relative" 
                 title={`Year: ${d.year}\nIncome: ${d.income.toLocaleString()}\nExpense: ${d.expense.toLocaleString()}`}>
              
              {/* Income Bar */}
              <div 
                className="w-1/2 rounded-t-md bg-indigo-400 group-hover:bg-indigo-500 transition-colors" 
                style={{ height: `${getHeight(d.income)}px` }} 
              />
              
              {/* Expense Bar */}
              <div 
                className="w-1/2 rounded-t-md bg-indigo-200 group-hover:bg-indigo-300 transition-colors" 
                style={{ height: `${getHeight(d.expense)}px` }} 
              />
            </div>
            <span className="mt-2 text-[10px] text-gray-500 font-medium">{d.year}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}