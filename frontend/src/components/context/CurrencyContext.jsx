import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // default to 'VND' if nothing is saved
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('appCurrency') || 'VND'; 
  });

  const EXCHANGE_RATE = 25000; 

  useEffect(() => {
    localStorage.setItem('appCurrency', currency);
  }, [currency]);

  const formatPrice = (amountInVnd) => {
    if (currency === 'USD') {
      const usdAmount = (amountInVnd / EXCHANGE_RATE).toFixed(2);
      return `$${usdAmount}`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountInVnd);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);