import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { Card as Panel } from '../common/Card'; 
import { apiRequest } from '../../lib/api';

export function CardOnboarding() {
  const { refreshProfile,token } = useAuth(); 
  const navigate = useNavigate();
  
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [consent, setConsent] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !nameOnCard || !expiry || !cvv || !consent) {
      setError('All fields are required and consent must be granted');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        card_last4: cardNumber.slice(-4),
        card_name: nameOnCard,
      };

      await apiRequest('/api/users/onboard/card', {
        method: 'POST',
        body: payload,
        token: token
      });
      if (refreshProfile) {
        await refreshProfile(); 
      }

      navigate('/');
      
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.message || 'Failed to link card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 animate-in fade-in duration-500">
      <Panel className="w-full max-w-md p-6 border-indigo-100 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
             <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
             </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Connect your Card</h2>
          <p className="text-sm text-slate-500 mt-1">
            Link your primary account to unlock AI insights and dashboard analytics.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
            <input 
              type="text" 
              inputMode="numeric" 
              placeholder="0000 0000 0000 0000" 
              className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16))} 
            />
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
            <input 
              type="text" 
              placeholder="JON SNOW" 
              className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none uppercase" 
              value={nameOnCard} 
              onChange={(e) => setNameOnCard(e.target.value)} 
            />
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expiry</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                value={expiry} 
                onChange={(e) => setExpiry(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
              <input 
                type="password" 
                placeholder="123" 
                className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                value={cvv} 
                onChange={(e) => setCvv(e.target.value.slice(0,4))} 
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
            <input 
              type="checkbox" 
              className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
              checked={consent} 
              onChange={(e)=>setConsent(e.target.checked)} 
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I authorize <strong>AWAD Financial</strong> to analyze my transaction history for the purpose of generating AI budget insights.
            </span>
          </label>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Verifying Card...' : 'Link Card & Sync Data'}
          </button>
        </form>
      </Panel>
    </div>
  );
}