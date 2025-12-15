import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';
import { BudgetCalendar } from '../budgets/BudgetCalendar.jsx';
import { PieDonut } from '../charts/PieDonut.jsx';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // 1. Fetch Real Data
  useEffect(() => {
    let aborted = false;
    async function loadData() {
      try {
        setLoading(true);
        // Fetch last 100 transactions for charts/trends
        const txData = await apiRequest('/api/transactions?limit=100', { token });
        // Fetch all budgets
        const bgData = await apiRequest('/api/budgets', { token });
        
        if (aborted) return;
        setTransactions(Array.isArray(txData) ? txData : []);
        setBudgets(Array.isArray(bgData) ? bgData : []);
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    loadData();
    return () => { aborted = true; };
  }, [token]);

  // 2. Compute Real Statistics
  const stats = useMemo(() => {
    let balance = 0;
    let monthlySpend = 0;
    const currentMonth = new Date().getMonth();
    const incomeTotal = 0; // Placeholder for pie chart logic if needed later

    transactions.forEach(t => {
      const amt = Number(t.amount || 0);
      balance += amt;
      
      const tDate = new Date(t.occurred_at);
      // If expense (negative) and in current month
      if (amt < 0 && tDate.getMonth() === currentMonth) {
        monthlySpend += Math.abs(amt);
      }
    });

    return {
      balance,
      monthlySpend,
      activeBudgets: budgets.length,
      upcomingBills: 0 // Placeholder until we have a bills table
    };
  }, [transactions, budgets]);

  // 3. Prepare Chart Data (Last 12 Days)
  const spendingData = useMemo(() => {
    const dailyMap = {};
    // Init last 12 days with 0
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyMap[key] = 0;
    }

    // Sum expenses per day
    transactions.forEach(t => {
      if (t.amount < 0) {
        const key = t.occurred_at.slice(0, 10);
        if (dailyMap[key] !== undefined) {
          dailyMap[key] += Math.abs(Number(t.amount));
        }
      }
    });

    return Object.entries(dailyMap).map(([dateStr, amount]) => ({
      date: new Date(dateStr),
      amount
    }));
  }, [transactions]);

  const maxAmount = Math.max(...spendingData.map(d => d.amount), 100000); // Min scale 100k

  // 4. Filter Budgets by Selected Month (Calendar interaction)
  const selectedBudgets = useMemo(() => {
    const selYear = selectedDate.getFullYear();
    const selMonth = selectedDate.getMonth();
    
    return budgets.filter(b => {
      const bDate = new Date(b.start_date);
      // Very simple filter: show if start date matches month/year
      // OR show all recurring budgets if you want
      return bDate.getFullYear() === selYear && bDate.getMonth() === selMonth;
    });
  }, [budgets, selectedDate]);

  // Helpers
  const formatMoney = (val) => `${Math.abs(val).toLocaleString('vi-VN')} ₫`;

  // Dummy Segments for Pie Chart (You can compute these similarly to stats if desired)
  const incomeSegments = [
    { label: 'Salary', value: 35000000, color: '#4f46e5' },
    { label: 'Bonus', value: 5000000, color: '#10b981' },
    { label: 'Other', value: 2000000, color: '#f59e0b' },
  ];
  const investingSegments = [
    { label: 'Stocks', value: 10000000, color: '#6366f1' },
    { label: 'Crypto', value: 5000000, color: '#ec4899' },
    { label: 'Savings', value: 20000000, color: '#0ea5e9' },
  ];

  const cards = [
    { title: 'Total Balance', value: formatMoney(stats.balance), accent: 'emerald', isNegative: stats.balance < 0 },
    { title: 'Monthly Spend', value: formatMoney(stats.monthlySpend), accent: 'rose' },
    { title: 'Active Budgets', value: stats.activeBudgets, accent: 'indigo' },
    { title: 'Upcoming Bills', value: '0', accent: 'amber' },
  ];

  if (loading && transactions.length === 0) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(c => (
          <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-600">{c.title}</h3>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-${c.accent}-50 text-${c.accent}-600 text-xs font-semibold`}>●</span>
            </div>
            <p className={`mt-3 text-2xl font-bold tracking-tight ${c.isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
              {c.value}
            </p>
            <button className="mt-4 text-xs font-medium text-indigo-600 hover:underline">View details →</button>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {/* Main Column (Charts & Transactions) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Spending Chart */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Spending Trends (Last 12 Days)</h3>
            <div className="mt-2 h-56 w-full">
              <svg viewBox="0 0 320 160" className="h-full w-full">
                <defs>
                  <linearGradient id="fillGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Axes Lines */}
                <line x1="32" y1="8" x2="32" y2="152" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="32" y1="152" x2="312" y2="152" stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Chart Data Path */}
                {(() => {
                  const pts = spendingData.map((d, idx) => {
                    const x = 32 + (idx/(spendingData.length-1 || 1)) * (312-32);
                    const y = 152 - (d.amount/maxAmount) * (140);
                    return { x, y };
                  });
                  const pathLine = pts.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');
                  const pathArea = pts.length ? (pathLine + ` L ${pts[pts.length-1].x},152 L 32,152 Z`) : "";
                  return (
                    <g key="chart">
                      <path d={pathArea} fill="url(#fillGradient)" />
                      <path d={pathLine} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      {pts.map((p,i)=>(
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#6366f1" strokeWidth="2" />
                      ))}
                    </g>
                  );
                })()}

                {/* Y-Axis Labels (Dynamic based on Max Amount) */}
                { [0, 0.5, 1].map((f,i)=>{
                  const val = Math.round(maxAmount*f);
                  const y = 152 - f*140;
                  return <text key={i} x={4} y={y+3} fontSize="8" fill="#94a3b8">{(val/1000).toFixed(0)}k</text>;
                }) }
                
                {/* X-Axis Labels */}
                { spendingData.map((d,i)=> (i%2===0) && (
                  <text key={i} x={32 + (i/(spendingData.length-1 || 1))*(312-32)} y={168} fontSize="8" textAnchor="middle" fill="#94a3b8">
                    {d.date.getDate()}
                  </text>
                )) }
              </svg>
            </div>
          </section>

          {/* Pie Charts Section */}
          <section className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Financial Allocation</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative flex flex-col items-center">
                <PieDonut title="Income Gross" segments={incomeSegments} />
              </div>
              <div className="relative flex flex-col items-center">
                <PieDonut title="Investing" segments={investingSegments} />
              </div>
            </div>
          </section>

          {/* Recent Transactions List */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Transactions</h3>
            <div className="overflow-hidden">
                <ul className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map(t => (
                    <li key={t.id} className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors px-2 rounded-md">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{t.description || "Unknown"}</span>
                            <span className="text-xs text-slate-500">{new Date(t.occurred_at).toLocaleDateString('vi-VN')} • {t.category_name || 'General'}</span>
                        </div>
                        <span className={`text-sm font-semibold ${Number(t.amount) >= 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {Number(t.amount) >= 0 ? '+' : ''}{formatMoney(t.amount)}
                        </span>
                    </li>
                ))}
                {transactions.length === 0 && <li className="text-slate-400 text-sm py-2">No recent activity</li>}
                </ul>
            </div>
          </section>
        </div>

        {/* Right Sidebar (Calendar & Budgets) */}
        <div className="space-y-6 xl:col-span-1">
          <section className="space-y-6">
            <BudgetCalendar value={selectedDate} onChange={setSelectedDate} />
            
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Budgets ({selectedBudgets.length})</h3>
                <span className="text-xs text-slate-400">{selectedDate.toLocaleString('default', { month: 'short' })}</span>
              </div>
              
              <ul className="space-y-3">
                {selectedBudgets.map(b => (
                  <li key={b.id} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{b.category_name || "Budget"}</span>
                      <span className="font-semibold text-slate-900">{formatMoney(b.amount)}</span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-100 mt-1">
                        <div className="h-1.5 rounded-full bg-indigo-500 w-1/3"></div> {/* Placeholder width until 'spent' is in API */}
                    </div>
                  </li>
                ))}
                {selectedBudgets.length === 0 && (
                  <li className="text-xs text-slate-400 italic">No budgets found for this month.</li>
                )}
              </ul>
              
              <button className="mt-5 w-full rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
                + Add New Budget
              </button>
            </div>
          </section>

          {/* AI Insights Placeholder */}
          <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✨</span>
                <h3 className="text-sm font-semibold text-indigo-900">AI Insights</h3>
            </div>
            <p className="text-xs text-indigo-700/80 leading-relaxed">
              Your spending on <strong>Dining</strong> is 15% higher than last month. Consider setting a limit for next week.
            </p>
            <button className="mt-3 w-full rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm hover:shadow transition-all">
              Generate Report
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;