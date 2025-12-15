import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function BudgetPage() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    // 1. Fetch Budgets from API
    useEffect(() => {
        let aborted = false;
        async function load() {
            try {
                setLoading(true);
                setError('');
                // Assuming your gateway routes /api/budgets to the budget service
                const data = await apiRequest('/api/budgets', { token });
                
                if (aborted) return;

                const mapped = (Array.isArray(data) ? data : []).map(r => {
                    const limit = Number(r.amount || 0);
                    const spent = Number(r.spent || 0); // Assuming backend sends 'spent'
                    const remaining = limit - spent;
                    const percent = limit > 0 ? (spent / limit) * 100 : 0;

                    return {
                        id: r.id,
                        name: r.category_name || r.name || 'General Budget',
                        period: r.period || 'Monthly',
                        limit: limit,
                        spent: spent,
                        remaining: remaining,
                        percent: Math.min(percent, 100),
                        isOver: spent > limit
                    };
                });
                setItems(mapped);
            } catch (e) {
                // Fallback for demo if API isn't ready yet
                if (!aborted) {
                    console.warn("Budget API failed, using empty list or mock", e);
                    setError(e.message || 'Error loading budgets');
                }
            } finally {
                if (!aborted) setLoading(false);
            }
        }
        load();
        return () => { aborted = true; };
    }, [token]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return items.filter(b => 
            !term || `${b.name} ${b.period}`.toLowerCase().includes(term)
        );
    }, [q, items]);

    // Helper for VND Currency
    const formatMoney = (amount) => {
        return `${amount.toLocaleString('vi-VN')} ₫`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Budgets</h2>
                    <p className="text-sm text-slate-500">Track your spending limits and goals</p>
                </div>
                <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                    Create Budget
                </button>
            </div>

            <Card>
                <div className="flex items-center justify-between p-4">
                    <div className="text-sm text-slate-500">
                        {loading ? 'Loading...' : error ? <span className="text-rose-600">{error}</span> : `${filtered.length} budgets active`}
                    </div>
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search budgets..."
                        className="w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">Limit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">Spent</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">Remaining</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 w-1/4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filtered.map(b => (
                                <tr key={b.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-800">
                                        <div className="font-medium">{b.name}</div>
                                        <div className="text-xs text-slate-500">{b.period}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-600">
                                        {formatMoney(b.limit)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-800">
                                        {formatMoney(b.spent)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <span className={`font-semibold ${b.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatMoney(b.remaining)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={b.isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                                    {b.percent.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-200">
                                                <div 
                                                    className={`h-2 rounded-full ${b.isOver ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${b.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td className="px-4 py-6 text-center text-slate-500 text-sm" colSpan={5}>
                                        No budgets found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}