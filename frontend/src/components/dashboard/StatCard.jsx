import React from 'react';

export function StatCard({ title, amount, type = 'neutral' }) {
  // Config for "Received" (Green/Income) vs "Sent" (Red/Expense)
  const isReceived = type === 'positive';
  
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
           {/* Icon Box */}
           <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isReceived ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
             {isReceived ? (
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
               </svg>
             ) : (
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
               </svg>
             )}
           </div>
           <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900">
          {typeof amount === 'number' ? amount.toLocaleString('vi-VN') : amount} ₫
        </h3>
        <div className="mt-1 flex items-center text-xs">
          <span className={`font-medium ${isReceived ? 'text-emerald-500' : 'text-emerald-500'}`}>
             ▲ 11.2%
          </span>
          <span className="ml-1 text-slate-400">Per year</span>
        </div>
      </div>
    </div>
  );
}