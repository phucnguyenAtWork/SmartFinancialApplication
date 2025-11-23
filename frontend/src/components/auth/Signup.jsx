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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed && !loading) {
        navigate('/'); 
    }
  }, [isAuthed, navigate, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !phone || !password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    
    try {
      await register({ name, phone, password }); 
      
      console.log('[Signup] register success');
      
      // Now we manually navigate to onboarding
      navigate('/onboarding/card');
    } catch (err) {
      console.error('[Signup] register error', err.name, err.status, err.message, err.data);
      const detail = err && err.data && typeof err.data === 'object' ? (err.data.error || err.data.message) : '';
      const statusPart = err.status ? ` (status ${err.status})` : '';
      setError(`${err.message}${statusPart}${detail ? ` - ${detail}` : ''}`);
      setLoading(false); // Only turn off loading if we failed
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        {}
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Create account</h2>
  {error && <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600 whitespace-pre-wrap">{error}</div>}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input type="text" placeholder="Name" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="tel" placeholder="Phone number" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 rounded-xl py-2 text-sm font-semibold text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          <div className="mt-2 text-xs text-gray-600">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link></div>
        </form>
      </Card>
    </div>
  );
}