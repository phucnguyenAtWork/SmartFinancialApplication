import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../common/Card';

export function Signup() {
  const { register, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthed) navigate('/');
  }, [isAuthed, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError('All fields are required');
      return;
    }
    register({ name, phone, password })
      .then(() => navigate('/onboarding/card'))
      .catch((e) => setError(e.message || 'Signup failed'));
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Create account</h2>
        {error && <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input type="text" placeholder="Name" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="tel" placeholder="Phone number" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="mt-2 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Sign up</button>
          <div className="mt-2 text-xs text-gray-600">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link></div>
        </form>
      </Card>
    </div>
  );
}
