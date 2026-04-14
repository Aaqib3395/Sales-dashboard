import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import EmployeeTable from '../components/EmployeeTable';
import Filters from '../components/Filters';
import { getEmployeePerformance, getEmployees, createEmployee } from '../api/axios';

const TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];
const ROLES = ['Sales Rep', 'Senior Sales Rep', 'Account Executive', 'Team Lead', 'Sales Manager'];

function AddEmployeeModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'Sales Rep', team: 'Team Alpha', target: 50000, phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createEmployee(form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-800 text-lg">Add Employee</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
              <input required className="input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email *</label>
              <input required type="email" className="input w-full" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Role</label>
              <select className="input w-full" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Team</label>
              <select className="input w-full" value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))}>
                {TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Monthly Target ($)</label>
              <input type="number" min="0" className="input w-full" value={form.target} onChange={e => setForm(f => ({ ...f, target: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone</label>
              <input className="input w-full" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const { filters } = useFilters();
  const [performance, setPerformance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [perfRes, empRes] = await Promise.all([
        getEmployeePerformance({ period: filters.period, team: filters.team }),
        getEmployees(),
      ]);
      setPerformance(perfRes.data);
      setEmployees(empRes.data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.period, filters.team]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = performance.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Employees</h2>
          <p className="text-sm text-slate-400 mt-0.5">{employees.length} team members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary self-start sm:self-auto">
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* Filters row */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input w-full pl-9"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Filters employees={employees} showEmployee={false} />
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">Performance Overview</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {filters.period === 'weekly' ? 'This Week' : 'This Month'}
          </span>
        </div>
        <EmployeeTable data={filtered} loading={loading} />
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onSaved={fetchData} />}
    </div>
  );
}
