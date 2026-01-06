import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function TransactionTable({ limit = 5, showHeader = true }) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await apiRequest(`/api/transactions?limit=${limit}`, { token });
        
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id,
          date: r.occurred_at?.slice(0, 10) || r.occurred_at,
          desc: r.description || '',
          category: r.category_name || 'Uncategorized',
          merchant: r.merchant_name || '',
          amount: Number(r.amount || 0),
          type: r.type || 'EXPENSE',
        }));
        
        setTransactions(mapped);
      } catch (e) {
        setError(e.message || 'Failed to load transactions');
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [token, limit]);

  const formatAmount = (amount, type) => {
    const displayAmount = type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount);
    const color = displayAmount >= 0 ? 'text-emerald-600' : 'text-slate-900';
    return { displayAmount, color };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="p-4 sm:p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-5">
        <div className="text-sm text-red-600">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      {/* Header */}
      {showHeader && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
          <button className="flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-slate-50 transition-colors">
            Latest <span className="text-[10px] text-gray-400">▼</span>
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No transactions yet
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const { displayAmount, color } = formatAmount(tx.amount, tx.type);
                  return (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-sm font-medium text-slate-900">{tx.desc}</div>
                        {tx.merchant && (
                          <div className="text-[11px] text-gray-500">{tx.merchant}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' :
                          tx.type === 'EXPENSE' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className={`text-sm font-semibold ${color}`}>
                          {displayAmount > 0 ? '+' : ''}{displayAmount.toLocaleString()}₫
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW (hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => {
              const { displayAmount, color } = formatAmount(tx.amount, tx.type);
              return (
                <div 
                  key={tx.id} 
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                >
                  {/* Header: Description & Amount */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {tx.desc}
                      </div>
                      {tx.merchant && (
                        <div className="text-xs text-gray-500 truncate">{tx.merchant}</div>
                      )}
                    </div>
                    <div className={`text-sm font-semibold ${color} whitespace-nowrap`}>
                      {displayAmount > 0 ? '+' : ''}{displayAmount.toLocaleString()}₫
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' :
                        tx.type === 'EXPENSE' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {tx.category}
                      </span>
                    </div>
                    <span className="text-gray-500">{formatDate(tx.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}