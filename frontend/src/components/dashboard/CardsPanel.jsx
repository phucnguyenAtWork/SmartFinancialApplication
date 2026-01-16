import React from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';

export function CardsPanel() {
  const { user } = useAuth();

  return (
    <Card>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Cards</h3>
        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">•••</button>
      </div>
      
      {/* Credit Card Graphic */}
      <div className="h-44 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Background Decor */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

        {/* Top Row: Chip & Brand */}
        <div className="flex justify-between items-start">
          <div className="h-8 w-11 rounded bg-white/20 border border-white/30 backdrop-blur-md"></div>
          <span className="text-lg font-bold italic tracking-wider opacity-90">VISA</span>
        </div>

        {/* Middle Row: Card Number (FIXED SIZING) */}
        {/* Changed text-lg -> text-base, and tracking-widest -> tracking-wider */}
        <div className="flex justify-between items-center mt-2 w-full px-1">
          <span className="text-base font-mono tracking-wider">****</span>
          <span className="text-base font-mono tracking-wider">****</span>
          <span className="text-base font-mono tracking-wider">****</span>
          <span className="text-base font-mono tracking-wider">{user?.card_last4 || '0000'}</span>
        </div>

        {/* Bottom Row: Name & Date */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-75 mb-0.5">Card Holder</span>
            <span className="text-xs font-bold tracking-wide uppercase truncate max-w-[140px]">
              {user?.card_name || user?.name || 'MEMBER'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider opacity-75 mb-0.5">Expires</span>
            <span className="text-xs font-bold tracking-wide">12/28</span>
          </div>
        </div>

      </div>
    </Card>
  );
}