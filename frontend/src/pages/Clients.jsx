import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Building2, Mail, Phone, FileText, ArrowLeft } from 'lucide-react';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../api/axios';

function ClientForm({ client, onClose, onSaved }) {
  const [form, setForm] = useState(client || { name: '', company: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (client?._id) {
        await updateClient(client._id, form);
      } else {
        await createClient(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-800 text-lg">{client?._id ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Name *</label>
            <input required className="input w-full" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Company</label>
            <input className="input w-full" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
              <input type="email" className="input w-full" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone</label>
              <input className="input w-full" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea className="input w-full resize-none" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : 'Save Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientDetail({ clientId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getClient(clientId).then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div className="card h-40 animate-pulse bg-slate-50" />;
  if (!data) return <p className="text-slate-400">Client not found</p>;

  const { client, deals } = data;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Back to Clients</button>
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <Building2 size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-slate-800">{client.name}</h2>
            {client.company && <p className="text-sm text-slate-500">{client.company}</p>}
            <div className="flex flex-wrap gap-4 mt-2">
              {client.email && <span className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} /> {client.email}</span>}
              {client.phone && <span className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12} /> {client.phone}</span>}
            </div>
            {client.notes && <p className="text-sm text-slate-400 mt-2 flex items-start gap-1.5"><FileText size={12} className="mt-0.5 flex-shrink-0" /> {client.notes}</p>}
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Associated Deals ({deals.length})</h3>
        {deals.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No deals found for this client</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {['Product', 'Employee', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase py-2 px-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {deals.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{d.product}</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.employeeId?.name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">${d.amount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3"><span className={`status-${d.status}`}>{d.status}</span></td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(d.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [viewId, setViewId] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClients({ search, limit: 50 });
      setClients(res.data.clients);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  if (viewId) return (
    <div className="p-6 animate-fade-in">
      <ClientDetail clientId={viewId} onBack={() => setViewId(null)} />
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Clients</h2>
          <p className="text-sm text-slate-400 mt-0.5">{total} clients in CRM</p>
        </div>
        <button onClick={() => { setEditClient(null); setShowForm(true); }} className="btn-primary self-start sm:self-auto"><Plus size={16} /> Add Client</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input w-full pl-9" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : clients.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No clients found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {['Name', 'Company', 'Email', 'Phone', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase py-3 px-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewId(c._id)}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.company || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{c.phone || '—'}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditClient(c); setShowForm(true); }} className="text-xs text-primary-600 hover:underline mr-3">Edit</button>
                      <button onClick={async () => { await deleteClient(c._id); fetchClients(); }} className="text-xs text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <ClientForm client={editClient} onClose={() => setShowForm(false)} onSaved={fetchClients} />}
    </div>
  );
}
