import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function BudgetPage() {
    const { token, user } = useAuth();
    
    // Data States
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(false);
    
    // UI States
    const [q, setQ] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        category_id: '',
        amount_limit: '',
        period: 'MONTHLY',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });

    // 1. Initial Load
    useEffect(() => {
        loadData();
        // Load Categories (Mock or API)
        // You should eventually replace this with a real API call like: await apiRequest('/api/categories', ...)
        setCategories([
            { id: 1, name: 'Food & Dining' },
            { id: 2, name: 'Transportation' },
            { id: 3, name: 'Shopping' },
            { id: 4, name: 'Utilities' },
            { id: 5, name: 'Entertainment' },
            { id: 6, name: 'Groceries' }
        ]);
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            // FIX: Point to the correct Microservice URL (/api/budgets)
            const data = await apiRequest('/api/budgets', { token });
            
            // Handle response whether it's an array or object wrapper
            const rawList = Array.isArray(data) ? data : (data.budgets || []);

            const mapped = rawList.map(r => {
                const limit = Number(r.amount_limit || 0);
                const spent = Number(r.spent || 0);
                // Avoid division by zero
                const percent = limit > 0 ? (spent / limit) * 100 : (spent > 0 ? 100 : 0);

                let status = 'safe';
                if (spent > limit) status = 'danger';
                else if (percent > 80) status = 'warning';

                return {
                    ...r,
                    // Ensure these are numbers for the UI
                    amount_limit: limit,
                    spent: spent,
                    remaining: limit - spent,
                    percent: percent,
                    status: status
                };
            });
            setItems(mapped);
        } catch (e) {
            console.error("Failed to load budgets", e);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handlers
    const handleOpenModal = (budget = null) => {
        if (budget) {
            setEditingItem(budget);
            setFormData({
                category_id: budget.category_id || '', 
                amount_limit: budget.amount_limit,
                period: budget.period || 'MONTHLY',
                start_date: budget.start_date ? budget.start_date.split('T')[0] : '',
                end_date: budget.end_date ? budget.end_date.split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                category_id: categories[0]?.id || '',
                amount_limit: '',
                period: 'MONTHLY',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this budget?")) return;
        try {
            // FIX: Point to correct URL
            await apiRequest(`/api/budgets/${id}`, { 
                token, 
                method: 'DELETE'
            });
            loadData();
        } catch (e) {
            alert("Failed to delete budget");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // FIX: Construct proper payload
            const payload = {
                category_id: parseInt(formData.category_id),
                amount_limit: parseFloat(formData.amount_limit), // Ensure float
                period: formData.period,
                start_date: formData.start_date,
                end_date: formData.end_date,
                alert_threshold: 0.80 // Default
            };

            // FIX: Point to correct URL
            const url = editingItem 
                ? `/api/budgets/${editingItem.id}`
                : '/api/budgets';
            
            const method = editingItem ? 'PUT' : 'POST';

            await apiRequest(url, {
                token,
                method,
                body: payload
            });

            setIsModalOpen(false);
            loadData(); // Refresh list to see new data
        } catch (e) {
            console.error(e);
            alert("Failed to save budget. Check console for details.");
        }
    };

    // 3. UI Helpers
    const filtered = useMemo(() => {
        const term = q.toLowerCase();
        return items.filter(b => !term || (b.category_name || '').toLowerCase().includes(term));
    }, [items, q]);

    const totals = useMemo(() => {
        return items.reduce((acc, curr) => ({
            limit: acc.limit + curr.amount_limit,
            spent: acc.spent + curr.spent
        }), { limit: 0, spent: 0 });
    }, [items]);

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    
    const getStatusStyles = (status) => {
        switch (status) {
            case 'danger': return { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Over Limit' };
            case 'warning': return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Near Limit' };
            default: return { bar: 'bg-indigo-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'On Track' };
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Budgets</h2>
                    <p className="text-slate-500">Manage your monthly spending limits</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Create Budget
                </button>
            </div>

            {/* Total Summary */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border border-slate-200 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-1">Total Budget</div>
                        <div className="text-2xl font-bold text-slate-900">{formatMoney(totals.limit)}</div>
                    </Card>
                    <Card className="p-6 border border-slate-200 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-1">Total Spent</div>
                        <div className="text-2xl font-bold text-indigo-600">{formatMoney(totals.spent)}</div>
                    </Card>
                    <Card className="p-6 border border-slate-200 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-1">Total Remaining</div>
                        <div className={`text-2xl font-bold ${totals.limit - totals.spent < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatMoney(totals.limit - totals.spent)}
                        </div>
                    </Card>
                </div>
            )}

            {/* Main List */}
            <Card className="overflow-hidden border-0 shadow-md">
                <div className="border-b border-slate-100 bg-white p-5 flex justify-between items-center">
                    <div className="text-sm font-medium text-slate-500">{filtered.length} active budgets</div>
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search categories..."
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm w-64 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="overflow-x-auto bg-white">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500">Category</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Spent / Limit</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Remaining</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 w-1/3">Progress</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr> : filtered.map((b) => {
                                const style = getStatusStyles(b.status);
                                return (
                                    <tr key={b.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg bg-slate-100 text-slate-500`}>
                                                    {(b.category_name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{b.category_name || 'Uncategorized'}</div>
                                                    <div className="text-xs text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-0.5">{b.period}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-600 align-middle">
                                            <div className="text-slate-900 font-bold">{formatMoney(b.spent)}</div>
                                            <div className="text-xs text-slate-400">of {formatMoney(b.amount_limit)}</div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold align-middle ${b.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatMoney(b.remaining)}
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={`px-2 py-0.5 rounded border ${style.badge}`}>{style.text}</span>
                                                <span className="font-bold">{Math.round(b.percent)}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div className={`h-full transition-all duration-500 ${style.bar}`} style={{ width: `${Math.min(b.percent, 100)}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right align-middle">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(b)} className="text-indigo-600 hover:text-indigo-800 p-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(b.id)} className="text-rose-600 hover:text-rose-800 p-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">{editingItem ? 'Edit Budget' : 'Create Budget'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select 
                                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={formData.category_id}
                                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                                    required
                                    disabled={!!editingItem} 
                                >
                                    <option value="" disabled>Select a category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Spending Limit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400">₫</span>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-lg border border-slate-300 pl-7 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                                        value={formData.amount_limit}
                                        onChange={e => setFormData({...formData, amount_limit: e.target.value})}
                                        required
                                        placeholder="5000000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                                        value={formData.start_date}
                                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                                        value={formData.end_date}
                                        onChange={e => setFormData({...formData, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm">
                                    {editingItem ? 'Save Changes' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}