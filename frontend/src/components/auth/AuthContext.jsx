import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'; // 1. Import useCallback
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

  const setSession = useCallback((t, u) => {
    setToken(t);
    localStorage.setItem('jwt', t);
    setUser(u || null);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  }, []);

  const login = useCallback(async ({ phone, password }) => {
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
  }, [setSession]);

  const register = useCallback(async ({ name, phone, password }) => {
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
  }, [setSession]);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setOnboarded(false);
    setCard(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarded');
    localStorage.removeItem('card');
  }, []);

  const completeOnboarding = useCallback((cardInfo) => {
    setCard(cardInfo);
    setOnboarded(true);
    localStorage.setItem('card', JSON.stringify(cardInfo));
    localStorage.setItem('onboarded', 'true');
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      if (!token) return;
      const data = await apiRequest('/api/users/me',{token}); 
       setUser(prev => ({ ...prev, ...data }));
       if (data.card_last4) {
         setOnboarded(true);
         setCard({ last4: data.card_last4, name: data.card_name });
         localStorage.setItem('onboarded', 'true');
         localStorage.setItem('card', JSON.stringify({ last4: data.card_last4, name: data.card_name }));
       }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  }, [token]);


  // useEffect(() => {
  //   if (import.meta.env.VITE_AUTH_DISABLED === '1' && !token) {
  //     const dummy = { id: 0, name: 'Dev User', phone: '0000000000', bypass: true };
  //     setSession('dev-bypass-token', dummy);
  //   }
  // }, [token, setSession]);

  return (
    <AuthContext.Provider value={{ token, user, card, onboarded, isAuthed: !!token, login, register, logout, completeOnboarding, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}