import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarLink } from '../sidebar/SidebarLink';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex">
        {/* Mobile toggle button */}
        <button
          className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg lg:hidden"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
        >{open ? '✕' : '☰'}</button>
        <aside className={`w-[260px] h-screen sticky top-0 bg-white shadow-xl shadow-slate-100 px-6 py-6 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:static lg:block`}>        
          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-[12px] font-bold text-white">↺</div>
              <span className="text-xl font-semibold text-slate-900">iBudget</span>
            </div>
            <div className="mb-8 space-y-1">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Main Menu</div>
              <SidebarLink to="/" active={pathname === '/'}>Home</SidebarLink>
              <SidebarLink to="/analytics" active={pathname === '/analytics'}>Analytics</SidebarLink>
              <SidebarLink to="/transactions" active={pathname === '/transactions'}>Transaction</SidebarLink>
              <SidebarLink to="/budget" active={pathname === '/budget'}>Budget</SidebarLink>
            </div>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <SidebarLink to="/settings" active={pathname === '/settings'}>Setting</SidebarLink>
            <SidebarLink to="/logout" active={false}>Log out</SidebarLink>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-16 sm:h-20 items-center justify-between border-b bg-white px-4 sm:px-8">
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-gray-500 hover:bg-slate-50"><span className="text-[13px]">🔍</span></button>
              <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-gray-500 hover:bg-slate-50"><span className="text-[13px]">🔔</span></button>
              <button className="hidden md:inline-flex rounded-full border border-indigo-200 px-4 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50">Upgrade Now</button>
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/40?img=5" alt="User" className="h-8 w-8 rounded-full" />
                <span className="text-sm font-medium text-slate-800">{user?.name || 'Guest'}</span>
                {user?.phone && <span className="text-[11px] text-gray-500">({user.phone})</span>}
                <span className="text-[10px] text-gray-500">▼</span>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 sm:px-8 py-6 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
