import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '.././auth/AuthContext';
import { apiRequest } from '../../lib/api';

// --- COMPONENTS ---
// Make sure these import paths match your folder structure
import { YearlySummary } from './YearlySummary';
import { StatCard } from './StatCard';
import { BankAccountCard } from './BankAccountCard';
import { OverviewChart } from './OverviewChart';
import { TransactionTable } from './TransactionTable';

// The new Visuals we just created
import { BudgetGauge } from './BudgetGauge';
import { CategoryDonut } from './CategoryDonut';

export function Dashboard() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Data from API
  useEffect(() => {
    let aborted = false;
    async function loadData() {
      try {
        setLoading(true);
        // Fetch 500 items to ensure we have enough for charts
        const data = await apiRequest('/api/transactions?limit=500', { token });
        if (aborted) return;
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    loadData();
    return () => { aborted = true; };
  }, [token]);

  // 2. Compute Statistics (Memoized for performance)
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const todayStr = now.toDateString();

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let todaySpend = 0;

    const yearlyData = Array(12).fill(0);
    const dailyMap = {};

    transactions.forEach(t => {
      const rawAmt = Number(t.amount || 0);
      
      // Determine flow: 'EXPENSE' type OR negative amount
      const isExpense = (t.type && t.type.toUpperCase() === 'EXPENSE') || rawAmt < 0;

      // Normalize amounts
      const realAmount = isExpense ? -Math.abs(rawAmt) : Math.abs(rawAmt);

      totalBalance += realAmount;
      
      if (isExpense) {
          totalExpense += Math.abs(realAmount);
      } else {
          totalIncome += realAmount;
      }

      const tDate = new Date(t.occurred_at);
      
      // Populate Yearly Chart
      if (tDate.getFullYear() === currentYear && isExpense) {
        yearlyData[tDate.getMonth()] += Math.abs(realAmount);
      }

      // Populate Daily Limit Logic
      if (tDate.toDateString() === todayStr && isExpense) {
        todaySpend += Math.abs(realAmount);
      }

      // Populate Overview Chart
      const dateKey = tDate.toISOString().slice(0, 10);
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + realAmount;
    });

    // Format Overview Data for the Chart
    const overviewData = Object.entries(dailyMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      todaySpend,
      yearlyData,
      overviewData,
      recentTx: transactions.slice(0, 5) // Top 5 for table
    };
  }, [transactions]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 animate-in fade-in duration-500">

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* --- LEFT COLUMN (Main Charts) --- */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Row 1: Yearly Summary + Stat Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <YearlySummary data={stats.yearlyData} year={new Date().getFullYear()} />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <StatCard title="Received" amount={stats.totalIncome} type="positive" />
              <StatCard title="Sent" amount={stats.totalExpense} type="negative" />
            </div>
          </div>
          
          {/* Row 2: Overview Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Overview</h3>
                {/* Visual Filters */}
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                      <span>Live Data</span>
                   </div>
                </div>
             </div>
             
             {/* Height constraint for Chart */}
             <div className="h-64 w-full">
                <OverviewChart data={stats.overviewData} />
             </div>
          </div>

          {/* Row 3: Recent Transactions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
             <div className="mb-4 flex items-center justify-between">
               <h3 className="font-bold text-slate-900">Recent Transactions</h3>
               <button className="text-xs font-medium text-indigo-600 hover:underline">View All</button>
             </div>
             <TransactionTable transactions={stats.recentTx} />
          </div>

        </div>

        {/* --- RIGHT COLUMN (New Widgets) --- */}
        <div className="space-y-6">
          
          {/* 1. Credit Card (Static Visual) */}
          <div className="rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
             <div className="p-4 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900">Cards</h3>
                 <span className="text-slate-400 text-xl cursor-pointer">...</span>
             </div>
             <div className="mx-4 mb-4 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute bottom-10 -left-10 h-24 w-24 rounded-full bg-pink-500/20 blur-xl"></div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-8">
                      <div className="h-8 w-12 bg-white/20 rounded border border-white/10"></div>
                      <span className="text-lg font-medium tracking-wider">VISA</span>
                   </div>
                   <div className="text-xl tracking-widest mb-6 font-mono">**** **** **** 4584</div>
                   <div className="flex justify-between text-xs opacity-90 uppercase tracking-wider">
                      <div>Card Holder<br/><span className="text-sm font-semibold text-white">{user?.name || 'User'}</span></div>
                      <div>Expires<br/><span className="text-sm font-semibold text-white">12/28</span></div>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. Budget Health Gauge (Dynamic) */}
          {/* Passing the real calculated expense and a hardcoded limit of 5M VND */}
          <BudgetGauge 
             spent={stats.totalExpense} 
             limit={5000000} 
          />

          {/* 3. Category Donut (Dynamic) */}
          {/* Automatically groups your API transactions by category */}
          <CategoryDonut transactions={transactions} />

          {/* 4. Bank Account (Dynamic) */}
          <BankAccountCard 
             balance={stats.totalBalance} 
             holderName={user?.name}
          />

        </div>
      </div>
    </div>
  );
}