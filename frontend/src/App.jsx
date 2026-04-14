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
import { FilterProvider } from './context/FilterContext';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'FlowTech Sales Intelligence' },
  '/employees': { title: 'Employees', subtitle: 'Team performance overview' },
  '/pipeline': { title: 'Sales Pipeline', subtitle: 'Deal tracking & Kanban' },
  '/reports': { title: 'Reports', subtitle: 'Analytics & Insights' },
  '/settings': { title: 'Settings', subtitle: 'Preferences & Configuration' },
};

function Layout({ children, darkMode, toggleDark }) {
  const [collapsed, setCollapsed] = useState(false);
  const path = window.location.pathname;
  const meta = PAGE_META[path] || PAGE_META['/'];
  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-[#f4f6fb]'}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          darkMode={darkMode}
          toggleDark={toggleDark}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <FilterProvider>
      <BrowserRouter>
        <Layout darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FilterProvider>
  );
}
