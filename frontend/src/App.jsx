import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Pipeline from './pages/Pipeline';
import Reports from './pages/Reports';
import EmployeeDetail from './pages/EmployeeDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import Clients from './pages/Clients';
import Goals from './pages/Goals';
import ActivityFeed from './pages/ActivityFeed';
import UserManagement from './pages/UserManagement';
import { FilterProvider } from './context/FilterContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'FlowTech Sales Intelligence' },
  '/employees': { title: 'Employees', subtitle: 'Team performance overview' },
  '/pipeline': { title: 'Sales Pipeline', subtitle: 'Deal tracking & Kanban' },
  '/reports': { title: 'Reports', subtitle: 'Analytics & Insights' },
  '/settings': { title: 'Settings', subtitle: 'Preferences & Configuration' },
  '/analytics': { title: 'Advanced Analytics', subtitle: 'Forecasting & deep-dive analysis' },
  '/clients': { title: 'Clients', subtitle: 'CRM & client management' },
  '/goals': { title: 'Goals & Targets', subtitle: 'Revenue targets & tracking' },
  '/feed': { title: 'Activity Feed', subtitle: 'Real-time team updates' },
  '/users': { title: 'User Management', subtitle: 'Roles & access control' },
};

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => user?.darkMode || false);
  const path = window.location.pathname;
  const meta = PAGE_META[path] || PAGE_META['/'];
  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-[#f4f6fb]'}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          darkMode={darkMode}
          toggleDark={() => setDarkMode((d) => !d)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/feed" element={<ActivityFeed />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function LoginGate() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  );
}
