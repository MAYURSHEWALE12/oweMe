import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerPortal from './pages/portal/CustomerPortal';
import Transactions from './pages/transactions/Transactions';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isAuthenticated) return <Navigate to="/reports" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<AuthGate><AuthLayout><Login /></AuthLayout></AuthGate>} />
      <Route path="/register" element={<AuthGate><AuthLayout><Register /></AuthLayout></AuthGate>} />
      <Route path="/my-statement" element={<CustomerPortal />} />
      <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/reports" replace />} />
        <Route path="reports" element={<Reports />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!isAuthenticated) return <Navigate to="/landing" replace />;
  return children;
}