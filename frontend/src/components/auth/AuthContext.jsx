import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwt') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [onboarded, setOnboarded] = useState(() => {
    const raw = localStorage.getItem('onboarded');
    return raw ? raw === 'true' : false;
  });
  const [card, setCard] = useState(() => {
    const raw = localStorage.getItem('card');
    return raw ? JSON.parse(raw) : null;
  });

  const setSession = (t, u) => {
    setToken(t);
    localStorage.setItem('jwt', t);
    setUser(u || null);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  };

  const login = async ({ phone, password }) => {
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { phone, password },
      });
      setSession(data.token, data.user);
    } catch (e) {
      console.error('[auth] login error', e.name, e.status, e.message, e.data);
      throw e;
    }
  };

  const register = async ({ name, phone, password }) => {
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name, phone, password },
      });
      setSession(data.token, data.user);
    } catch (e) {
      console.error('[auth] register error', e.name, e.status, e.message, e.data);
      throw e;
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setOnboarded(false);
    setCard(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarded');
    localStorage.removeItem('card');
  };

  function completeOnboarding(cardInfo) {
    setCard(cardInfo);
    setOnboarded(true);
    localStorage.setItem('card', JSON.stringify(cardInfo));
    localStorage.setItem('onboarded', 'true');
  }

  useEffect(() => {}, [token, user, onboarded, card]);
  return (
    <AuthContext.Provider value={{ token, user, card, onboarded, isAuthed: !!token, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
