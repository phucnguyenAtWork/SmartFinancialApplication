import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function TransactionsPage() {
  const { token } = useAuth();
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [currentTx, setCurrentTx] = useState(null);
  const [saving, setSaving] = useState(false);

  // -- 1. READ: Fetch Transactions --
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiRequest('/api/transactions?limit=500', { token });
      
      const mapped = (Array.isArray(data) ? data : []).map(r => ({
        id: r.id,
        date: r.occurred_at?.slice(0,10) || r.occurred_at,
        desc: r.description || '',
        category: r.category_name || 'Uncategorized',
        merchant: r.merchant_name || '',
        amount: Number(r.amount || 0),
        type: r.type || 'EXPENSE',
        essential: r.essential || false,
        tags: Array.isArray(r.tags) ? r.tags : []
      }));
      
      setItems(mapped);
    } catch (e) {
      setError(e.message || 'Failed to load transactions');
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== id));
      
      await apiRequest(`/api/transactions/${id}`, { 
        token, 
        method: 'DELETE' 
      });
    } catch (err) {
      alert("Failed to delete transaction: " + err.message);
      loadTransactions(); // Reload on error
    }
  };

  const openAddModal = () => {
    setModalMode('CREATE');
    setCurrentTx({
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      desc: '',
      category: 'General',
      merchant: '',
      type: 'EXPENSE',
      essential: false,
      tags: []
    });
    setModalOpen(true);
  };

  const openEditModal = (tx) => {
    setModalMode('EDIT');
    setCurrentTx({
      id: tx.id,
      date: tx.date,
      amount: Math.abs(tx.amount),
      desc: tx.desc,
      category: tx.category,
      merchant: tx.merchant,
      type: tx.type,
      essential: tx.essential,
      tags: tx.tags
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!currentTx.date || !currentTx.amount || !currentTx.desc) {
      alert("Please fill in Date, Amount, and Description");
      return;
    }

    if (!['EXPENSE', 'INCOME', 'TRANSFER'].includes(currentTx.type)) {
      alert("Please select a valid transaction type");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        occurred_at: currentTx.date,
        amount: Number(currentTx.amount),
        description: currentTx.desc,
        category_name: currentTx.category || 'General',
        merchant_name: currentTx.merchant || null,
        type: currentTx.type,
        essential: currentTx.essential || false,
        tags: currentTx.tags || []
      };

      console.log('Sending payload:', payload);

      if (modalMode === 'CREATE') {
        await apiRequest('/api/transactions', {
          token,
          method: 'POST',
          body: payload
        });
      } else {
        await apiRequest(`/api/transactions/${currentTx.id}`, {
          token,
          method: 'PUT',
          body: payload
        });
      }

      setModalOpen(false);
      loadTransactions(); // Refresh list
    } catch (err) {
      console.error('Save error:', err);
      alert(`Failed to ${modalMode === 'CREATE' ? 'create' : 'update'}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // -- Filter Logic --
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(t => (
      `${t.date} ${t.type} ${t.desc} ${t.category} ${t.merchant}`
        .toLowerCase()
        .includes(term)
    ));
  }, [q, items]);

  // -- Helper: Format Amount Display --
  const formatAmount = (amount, type) => {
    const displayAmount = type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount);
    const color = displayAmount >= 0 ? 'text-emerald-600' : 'text-slate-900';
    const sign = displayAmount >= 0 ? '+' : '';
    return { displayAmount, color, sign };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500">Manage your income and expenses</p>
        </div>
        <button 
          onClick={openAddModal}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* TABLE CARD */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${filtered.length} of ${items.length} transactions`}
          </div>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search transactions..."
            className="w-64 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(t => {
                const { displayAmount, color, sign } = formatAmount(t.amount, t.type);
                return (
                  <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' :
                        t.type === 'EXPENSE' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {t.category}
                      </span>
                      {t.essential && (
                        <span className="ml-1 text-xs text-amber-600" title="Essential"></span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="font-medium">{t.desc}</div>
                      {t.merchant && (
                        <div className="text-slate-400 text-xs">{t.merchant}</div>
                      )}
                      {t.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {t.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      <span className={`${color} font-bold`}>
                        {sign}{displayAmount.toLocaleString()}₫
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(t)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-xs uppercase"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="text-rose-600 hover:text-rose-900 font-medium text-xs uppercase"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400 text-sm" colSpan={6}>
                    No transactions found. Click "Add Transaction" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && currentTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {modalMode === 'CREATE' ? 'New Transaction' : 'Edit Transaction'}
              </h3>
              
              {/* Type Switcher */}
              <div className="flex rounded-lg bg-slate-200 p-1">
                {['EXPENSE', 'INCOME', 'TRANSFER'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTx(prev => ({ ...prev, type: tab }))}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                      currentTx.type === tab 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Form */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amount Field (Big) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amount *</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₫</span>
                   <input 
                      type="number" 
                      value={currentTx.amount}
                      onChange={e => setCurrentTx(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4 py-4 text-2xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      autoFocus
                      required
                   />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date *</label>
                <input 
                  type="date" 
                  value={currentTx.date}
                  onChange={e => setCurrentTx(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" 
                  required
                />
              </div>

              {/* Category */}
              <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                 <input 
                    type="text" 
                    list="category-suggestions"
                    value={currentTx.category}
                    onChange={e => setCurrentTx(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                 />
                 <datalist id="category-suggestions">
                    <option value="General" />
                    <option value="Food & Dining" />
                    <option value="Transportation" />
                    <option value="Shopping" />
                    <option value="Salary" />
                    <option value="Bills" />
                    <option value="Entertainment" />
                    <option value="Healthcare" />
                 </datalist>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
                <input 
                  type="text" 
                  value={currentTx.desc}
                  onChange={e => setCurrentTx(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="What was this for?"
                  className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" 
                  required
                />
              </div>

              {/* Merchant (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Merchant</label>
                <input 
                  type="text" 
                  value={currentTx.merchant}
                  onChange={e => setCurrentTx(prev => ({ ...prev, merchant: e.target.value }))}
                  placeholder="Store or vendor name"
                  className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" 
                />
              </div>

              {/* Essential Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={currentTx.essential}
                    onChange={e => setCurrentTx(prev => ({ ...prev, essential: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Essential Expense </span>
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
               <button 
                 onClick={() => setModalOpen(false)}
                 className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
               >
                 {saving ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Transaction' : 'Save Changes')}
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;