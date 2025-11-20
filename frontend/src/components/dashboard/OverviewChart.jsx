import React from 'react';
import { Card } from '../common/Card';

export function OverviewChart() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Overview</div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1 rounded-full border px-2 py-1">
            <span className="text-[11px]">📅</span>
            <span>17 November, 2023</span>
          </div>
          <button className="flex items-center gap-1 rounded-lg border px-3 py-1">Monthly <span className="text-[10px] text-gray-400">▼</span></button>
        </div>
      </div>
      <div className="h-64 rounded-2xl bg-slate-50 px-4 py-4">
        <svg viewBox="0 0 100 40" className="h-full w-full">
          {[8, 16, 24, 32].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#E5E7EB" strokeWidth="0.3" />
          ))}
          <polyline fill="none" stroke="#D1D5DB" strokeDasharray="1 2" strokeWidth="1" points="0,26 10,15 20,12 30,22 40,20 50,25 60,18 70,16 80,19 90,21 100,23" />
          <polyline fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" points="0,30 10,20 20,10 30,24 40,22 50,30 60,20 70,18 80,22 90,24 100,28" />
        </svg>
        <div className="mt-3 flex justify-between px-1 text-[11px] text-gray-500">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span> )}
        </div>
      </div>
    </Card>
  );
}
