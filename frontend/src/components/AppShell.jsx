import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { YearlySummary } from './dashboard/YearlySummary';
import { DonutCard } from './dashboard/DonutCard';
import { OverviewChart } from './dashboard/OverviewChart';
import { TransactionTable } from './dashboard/TransactionTable';
import { CardsPanel } from './dashboard/CardsPanel';
import { BankAccountCard } from './dashboard/BankAccountCard';
import { DailyLimitCard } from './dashboard/DailyLimitCard';
import { Placeholder } from './common/Placeholder';
import { Card } from './common/Card';
import { AuthProvider } from './auth/AuthContext';
import { Login } from './auth/Login';
import { Logout } from './auth/Logout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Signup } from './auth/Signup';
import { CardOnboarding } from './onboarding/CardOnboarding';
import { useAuth } from './auth/AuthContext';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-9">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1"><YearlySummary /></div>
          <div className="md:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DonutCard title="Received" amount="$1,263.00" change="↑ 11.2%" positive />
            <DonutCard title="Sent" amount="$163.00" change="↓ 11.2%" positive={false} />
          </div>
        </div>
        <OverviewChart />
        <TransactionTable />
      </div>
      <div className="space-y-6 lg:col-span-3">
        <CardsPanel />
        <BankAccountCard />
        <DailyLimitCard />
      </div>
    </div>
  );
}

export function AppShell() {
  const RequireOnboarded = ({ children }) => {
    const { onboarded } = useAuth();
    // If not onboarded, show onboarding instead of dashboard content
    return onboarded ? children : <Layout><CardOnboarding /></Layout>;
  };
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/onboarding/card" element={<ProtectedRoute><Layout><CardOnboarding /></Layout></ProtectedRoute>} />
        {/* Protected section wrapped with app layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RequireOnboarded>
                <Layout>
                  <Dashboard />
                </Layout>
              </RequireOnboarded>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={<ProtectedRoute><Layout><Placeholder title="Messages Inbox" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/analytics"
          element={<ProtectedRoute><Layout><Placeholder title="Analytics View" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/transactions"
          element={<ProtectedRoute><Layout><Placeholder title="Transactions" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/payment"
          element={<ProtectedRoute><Layout><Placeholder title="Payment History" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/balance"
          element={<ProtectedRoute><Layout><Placeholder title="Account Balance" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/spending"
          element={<ProtectedRoute><Layout><Placeholder title="Spending Analysis" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/refund"
          element={<ProtectedRoute><Layout><Placeholder title="Refund Management" /></Layout></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Layout><Placeholder title="Settings" /></Layout></ProtectedRoute>}
        />
      </Routes>
    </AuthProvider>
  );
}
