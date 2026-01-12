import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Placeholder } from './common/Placeholder';
import { TransactionsPage } from './transactions/TransactionsPage';
import { AuthProvider } from './auth/AuthContext';
import { Login } from './auth/Login';
import { Logout } from './auth/Logout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Signup } from './auth/Signup';
import { CardOnboarding } from './onboarding/CardOnboarding';
import { useAuth } from './auth/AuthContext';
import { BudgetPage } from './budget/BudgetPage.jsx';
import { Dashboard } from './dashboard/Dashboard.jsx';
import { AnalyticsPage } from './analytics/AnalyticsPage.jsx';
import SettingsPage  from './settings/SettingPage.jsx';
export function AppShell() {
  const RequireOnboarded = ({ children }) => {
    const { onboarded } = useAuth();
    return onboarded ? children : <Layout><CardOnboarding /></Layout>;
  };

  const authDisabled = import.meta.env.VITE_AUTH_DISABLED === '1';

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/onboarding/card" element={
          <ProtectedRoute>
            <Layout><CardOnboarding /></Layout>
          </ProtectedRoute>
        } />

        {/* Protected section wrapped with app layout */}
        <Route
          path="/"
          element={
            authDisabled ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <ProtectedRoute>
                <RequireOnboarded>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireOnboarded>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/analytics"
          element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/transactions"
          element={<ProtectedRoute><Layout><TransactionsPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/budget"
          element={<ProtectedRoute><Layout><BudgetPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>}
        />
      </Routes>
    </AuthProvider>
  );
}