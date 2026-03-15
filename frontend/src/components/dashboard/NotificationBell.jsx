import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

import dangerImg from '../../assets/icons/danger.png';
import warningImg from '../../assets/icons/warning.png';
import expenseImg from '../../assets/icons/expenses.png';
import incomeImg from '../../assets/icons/income.png';
import systemImg from '../../assets/icons/system.png';

const NotificationItem = ({ notification, onRead }) => {
  const typeConfigs = {
    budget_danger: { icon: dangerImg, bgColor: 'bg-rose-100' },
    budget_warning: { icon: warningImg, bgColor: 'bg-amber-100' },
    spending: { icon: expenseImg, bgColor: 'bg-indigo-100' },
    income: { icon: incomeImg, bgColor: 'bg-emerald-100' },
    system: { icon: systemImg, bgColor: 'bg-slate-100' },
  };

  const config = typeConfigs[notification.type] || typeConfigs.system;

  return (
    <div 
      className={`flex items-start gap-4 p-4 ${notification.read ? 'opacity-60' : ''} hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      {/* Icon Circle */}
      <div className={`flex items-center justify-center size-10 rounded-full ${config.bgColor} shrink-0`}>
        <img 
          src={config.icon} 
          alt={`${notification.type} icon`} 
          className="size-5 object-contain" 
        />
      </div>
      
      {/* Text Content */}
      <div className="flex-grow space-y-1">
        <p className="text-sm font-semibold text-slate-900 leading-tight">
          {notification.title}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 font-medium pt-1">
          {notification.timestamp}
        </p>
      </div>

      {/* Unread Dot indicator */}
      {!notification.read && (
        <div className="size-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" title="Unread"></div>
      )}
    </div>
  );
};

export function NotificationBell() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if(!isOpen||!token) return;
    let aborted = false;
    async function fetchNotifications() {
      if (!token) return;
      
      try {
        const data = await apiRequest(`/api/transactions/notifications?t=${Date.now()}`, { token });
        if (aborted) return;

        const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');

        if (data && data.notifications) {
          const mergedNotifs = data.notifications.map(n => ({
            ...n,
            read: readIds.includes(n.id) 
          }));
          setNotifications(mergedNotifs);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }

    fetchNotifications();
    return () => { aborted = true; };
  }, [isOpen, token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!readIds.includes(id)) {
      localStorage.setItem('read_notifications', JSON.stringify([...readIds, id]));
    }
  };

  // 3. Handle marking ALL items as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const allIds = notifications.map(n => n.id);
    const existingReadIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    
    const newReadIds = [...new Set([...existingReadIds, ...allIds])];
    localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors relative"
        aria-label="Notifications"
      >
        {/* Main Bell SVG Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        
        {/* Unread Badge (Red bubble with number) */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[420px] max-w-[90vw] origin-top-right rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h3 className="text-lg font-bold text-slate-950">Notifications</h3>
            {unreadCount > 0 && (
                <button 
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                    Mark all as read
                </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onRead={markAsRead}
                />
              ))
            ) : (
              <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-12 opacity-40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span>All caught up! No new notifications.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <button className="text-sm font-semibold text-indigo-600 hover:underline">
              View all notification history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}