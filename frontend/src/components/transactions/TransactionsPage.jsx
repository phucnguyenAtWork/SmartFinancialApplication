import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function TransactionsPage() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [items, setItems] = useState(() => ([]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        setError('');
        let data;
        try {
          data = await apiRequest('/api/transactions/transactions?limit=100', { token });
        } catch (e1) {
          data = await apiRequest('/api/transactions?limit=100', { token });
        }
        if (aborted) return;
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id,
          date: r.occurred_at?.slice(0,10) || r.occurred_at,
          flow: r.type ? (r.type.charAt(0) + r.type.slice(1).toLowerCase()) : 'Expense',
          account: r.account_name || '—',
          toAccount: r.to_account_name || '',
          desc: r.description || '',
          category: r.category_name || '',
          merchant: r.merchant_name || '',
          amount: Number(r.amount || 0),
        }));
        setItems(mapped);
      } catch (e) {
        if (!aborted) setError(e.message || 'Error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(t => (
      `${t.date} ${t.flow} ${t.account} ${t.desc} ${t.category} ${t.merchant}`
        .toLowerCase()
        .includes(term)
    ));
  }, [q, items]);

  const openEdit = (t) => setEditing({ ...t, typeTab: t.amount >= 0 ? 'INCOME' : 'EXPENSE', essential: true, toAccount: '', tags: '' });
  const closeEdit = () => setEditing(null);
  const saveEdit = () => {
    if (!editing) return;
    const value = Number(editing.amount);
    if (!editing.date || !editing.desc || !editing.account || Number.isNaN(value)) return;
    setItems(prev => prev.map(it => it.id === editing.id ? {
      ...it,
      date: editing.date,
      desc: editing.desc,
      account: editing.account,
      category: editing.category,
      merchant: editing.merchant,
      amount: editing.typeTab === 'INCOME' ? Math.abs(value) : -Math.abs(value),
      flow: editing.typeTab === 'TRANSFER' ? 'Transfer' : (editing.typeTab === 'INCOME' ? 'Income' : 'Expense'),
    } : it));
    closeEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500">All your transactions live here</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add Transaction</button>
          <button className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Import Transactions</button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-slate-500">
            {loading ? 'Loading…' : error ? <span className="text-rose-600">{error}</span> : `${items.length} items`}
          </div>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search"
            className="w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Flow</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{t.flow} · {t.account}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    <div className="font-medium">{t.desc}</div>
                    <div className="text-slate-500 text-xs">{t.category} · {t.merchant}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${t.amount >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-800'}`}>
                      {t.amount >= 0 ? 
                      `$${t.amount.toLocaleString('vi-VN')}` : `€${Math.abs(t.amount).toLocaleString('vi-VN')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-3">
                      <button className="rounded-md bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700" onClick={() => openEdit(t)}>Edit</button>
                      <button className="rounded-md bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500 text-sm" colSpan={5}>No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-4xl rounded-xl bg-slate-800 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">★</span>
                <h3 className="text-lg font-semibold">Edit transaction #{editing.id}</h3>
              </div>
              <div className="flex gap-2">
                {['EXPENSE','TRANSFER','INCOME'].map(tab => (
                  <button
                    key={tab}
                    className={`rounded-md px-3 py-1 text-sm ${editing.typeTab === tab ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 text-white'}`}
                    onClick={() => setEditing(e => ({ ...e, typeTab: tab }))}
                  >{tab.charAt(0) + tab.slice(1).toLowerCase()}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-300">Value *</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-slate-700 px-3 py-2 text-sm">đ</span>
                  <input type="number" value={editing.amount}
                    onChange={e => setEditing(ed => ({ ...ed, amount: e.target.value }))}
                    className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300">Date of transaction *</label>
                <input type="date" value={editing.date}
                  onChange={e => setEditing(ed => ({ ...ed, date: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300">Description</label>
                <input type="text" value={editing.desc}
                  onChange={e => setEditing(ed => ({ ...ed, desc: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm text-slate-300">From account *</label>
                <select value={editing.account}
                  onChange={e => setEditing(ed => ({ ...ed, account: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[...new Set(items.map(i => i.account))].map(acc => (<option key={acc} value={acc}>{acc}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300">To account</label>
                <select value={editing.toAccount}
                  onChange={e => setEditing(ed => ({ ...ed, toAccount: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">—</option>
                  {[...new Set(items.map(i => i.account))].map(acc => (<option key={acc} value={acc}>{acc}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300">Category</label>
                <select value={editing.category}
                  onChange={e => setEditing(ed => ({ ...ed, category: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[...new Set(items.map(i => i.category))].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300">Entity</label>
                <select value={editing.merchant}
                  onChange={e => setEditing(ed => ({ ...ed, merchant: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[...new Set(items.map(i => i.merchant))].map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300">Tags</label>
                <input type="text" value={editing.tags}
                  onChange={e => setEditing(ed => ({ ...ed, tags: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-700 px-6 py-4">
              <button className="text-sm text-indigo-300">↳ Split transaction</button>
              <div className="flex gap-2">
                <button onClick={closeEdit} className="rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600">Cancel</button>
                <button onClick={saveEdit} className="rounded-md bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400">Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;