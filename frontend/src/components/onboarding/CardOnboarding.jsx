import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card as Panel } from '../common/Card';

export function CardOnboarding() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !nameOnCard || !expiry || !cvv || !consent) {
      setError('All fields are required and consent must be granted');
      return;
    }
    // store masked card and mark onboarded; LLM linkage can happen server-side later
    const masked = `**** **** **** ${cardNumber.slice(-4)}`;
    completeOnboarding({ cardLast4: masked, nameOnCard, expiry });
    navigate('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <Panel className="w-full max-w-md p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Add your card</h2>
        <p className="mb-4 text-xs text-gray-600">We use this to estimate your available balance via secure LLM insights.</p>
        {error && (<div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>)}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input type="text" inputMode="numeric" placeholder="Card number" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\s+/g,'').slice(0,16))} />
          <input type="text" placeholder="Name on card" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="MM/YY" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            <input type="password" placeholder="CVV" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={cvv} onChange={(e) => setCvv(e.target.value.slice(0,4))} />
          </div>
          <label className="mt-1 flex items-center text-xs text-gray-700">
            <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
            I consent to securely analyze my card data to estimate available funds.
          </label>
          <button type="submit" className="mt-2 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save & Continue</button>
        </form>
      </Panel>
    </div>
  );
}
