import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

// --- COMPONENTS ---
import { YearlySummary } from './YearlySummary';
import { StatCard } from './StatCard';
import { BankAccountCard } from './BankAccountCard';
import { OverviewChart } from './OverviewChart';
import { TransactionTable } from './TransactionTable';
import { CardsPanel } from './CardsPanel';
import { BudgetGauge } from './BudgetGauge';
import { CategoryDonut } from './CategoryDonut';

export function Dashboard() {
  const { token, user } = useAuth();
  
  // Data States
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Data (Transactions AND Budgets)
  useEffect(() => {
    let aborted = false;
    async function loadData() {
      if (!token) return;
      try {
        setLoading(true);
        const [txData, budgetData] = await Promise.all([
            apiRequest('/api/transactions?limit=500', { token }),
            apiRequest('/api/budgets', { token })
        ]);

        if (aborted) return;

        setTransactions(Array.isArray(txData) ? txData : []);
        const rawBudgets = Array.isArray(budgetData) ? budgetData : (budgetData?.budgets || []);
        setBudgets(rawBudgets);

      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    loadData();
    return () => { aborted = true; };
  }, [token]);

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate Spending/Income
    transactions.forEach(t => {
      const amt = Number(t.amount || 0);
      if (t.type === 'INCOME') totalIncome += amt;
      else if (t.type === 'EXPENSE') totalExpense += amt;
    });
    const realTotalLimit = budgets.reduce((sum, b) => sum + Number(b.amount_limit || 0), 0);

    const totalBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      realTotalLimit, // <--- This is your dynamic limit
      recentTx: transactions.slice(0, 5)
    };
  }, [transactions, budgets]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 animate-in fade-in duration-500">

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* --- LEFT COLUMN (Main Charts) --- */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Row 1: Yearly Summary + Stat Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <YearlySummary transactions={transactions} />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <StatCard title="Received" amount={stats.totalIncome} type="positive" />
              <StatCard title="Sent" amount={stats.totalExpense} type="negative" />
            </div>
          </div>
          
          {/* Row 2: Overview Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Overview</h3>
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                      <span>Live Data</span>
                   </div>
                </div>
             </div>
             
             <div className="h-64 w-full">
                <OverviewChart data={transactions} />
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

        {/* --- RIGHT COLUMN (Widgets) --- */}
        <div className="space-y-6">
          
          {/* 1. Cards Panel */}
          <CardsPanel />

          {/* 2. Budget Health Gauge (NO HARDCODING) */}
          <BudgetGauge 
             spent={stats.totalExpense} 
             limit={stats.realTotalLimit} 
          />

          {/* 3. Category Donut */}
          <CategoryDonut transactions={transactions} />

          {/* 4. Bank Account */}
          <BankAccountCard 
             balance={stats.totalBalance} 
             holderName={user?.name || 'User'}
          />

        </div>
      </div>
    </div>
  );
}