import React, { useState } from 'react';

export function BankAccountCard({ balance = 0, holderName = "User" }) {
  // 1. State for the input amount
  const [amount, setAmount] = useState("");
  // 2. Conversion Rate
  const EXCHANGE_RATE = 25000;
  const numericAmount = Number(amount) || 0;
  const convertedValue = (numericAmount / EXCHANGE_RATE).toFixed(2);
  const isOverBalance = numericAmount > balance;

  const handleAmountChange = (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Quick Transfer</h3>
          <p className="text-xs text-slate-500 mt-1">
            Avail: <span className={`font-semibold ${isOverBalance ? 'text-red-500' : 'text-indigo-600'}`}>
              {balance.toLocaleString()}₫
            </span>
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
           {holderName.charAt(0)}
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Row 1: You Send (Editable Input) */}
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
            isOverBalance ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300'
        }`}>
          <div className="flex flex-col w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">You Send</span>
            <div className="flex items-center gap-1">
               {/* This INPUT makes it interactive */}
               <input 
                  type="text" 
                  value={amount ? Number(amount).toLocaleString() : ''}
                  onChange={(e) => {
                    // Remove commas to get raw number
                    const raw = e.target.value.replace(/,/g, '');
                    if (!isNaN(raw)) setAmount(raw);
                  }}
                  placeholder="0"
                  className={`w-full bg-transparent p-0 text-lg font-bold outline-none placeholder:text-slate-300 ${
                      isOverBalance ? 'text-red-600' : 'text-slate-900'
                  }`}
               />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-2 py-1 shadow-sm border border-slate-100">
             <span className="h-4 w-4 rounded-full bg-red-100"></span>
             <span className="text-xs font-bold text-slate-700">VND</span>
          </div>
        </div>

        {/* Warning Text if Over Balance */}
        {isOverBalance && (
            <div className="text-center text-[10px] font-bold text-red-500 -my-2 animate-pulse">
                Exceeds Available Balance
            </div>
        )}

        {/* Arrow Divider */}
        {!isOverBalance && (
            <div className="relative flex items-center justify-center -my-3 z-10">
            <div className="h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-400 text-[10px]">
                ↓
            </div>
            </div>
        )}

        {/* Row 2: Recipient Gets (Auto-Calculated) */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recipient Gets</span>
            <div className="flex items-baseline gap-1">
               <span className="text-lg font-bold text-slate-900">{convertedValue}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-2 py-1 shadow-sm border border-slate-100">
             <span className="h-4 w-4 rounded-full bg-indigo-100"></span>
             <span className="text-xs font-bold text-slate-700">USD</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
            disabled={isOverBalance || numericAmount === 0}
            className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.98] ${
                isOverBalance || numericAmount === 0
                 ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                 : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg'
            }`}
        >
          Send Now
        </button>
      </div>
    </div>
  );
}