import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import PipelineKanban from '../components/PipelineKanban';
import Filters from '../components/Filters';
import { useFilters } from '../context/FilterContext';
import { getKanban, createSale, getEmployees } from '../api/axios';

function AddDealModal({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({ employeeId: '', clientName: '', product: '', amount: '', status: 'lead', probability: 50, notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createSale({ ...form, amount: Number(form.amount), date: new Date() });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-800 text-lg">Add Deal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Assigned To *</label>
            <select required className="input w-full" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}>
              <option value="">Select employee...</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Client Name *</label>
              <input required className="input w-full" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Product *</label>
              <input required className="input w-full" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} placeholder="Enterprise CRM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Amount ($) *</label>
              <input required type="number" min="0" className="input w-full" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Stage</label>
              <select className="input w-full" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="lead">Hot Lead</option>
                <option value="follow-up">Follow-up</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Probability: {form.probability}%</label>
            <input type="range" min="0" max="100" className="w-full accent-primary-600" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea className="input w-full resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any relevant notes..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Add Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { filters } = useFilters();
  const [kanban, setKanban] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [kanbanRes, empRes] = await Promise.all([
        getKanban({ team: filters.team, employeeId: filters.employeeId }),
        getEmployees(),
      ]);
      setKanban(kanbanRes.data);
      setEmployees(empRes.data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.team, filters.employeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDeals = Object.values(kanban).flat().length;
  const totalValue = Object.values(kanban).flat().reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Sales Pipeline</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalDeals} deals · ${totalValue.toLocaleString()} pipeline value
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filters employees={employees} />
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="card">
        <PipelineKanban data={kanban} loading={loading} onRefresh={fetchData} />
      </div>

      {showAdd && <AddDealModal employees={employees} onClose={() => setShowAdd(false)} onSaved={fetchData} />}
    </div>
  );
}
