import { useState } from 'react';
import { DollarSign, User, Calendar, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { updateSaleStatus } from '../api/axios';

const COLUMNS = [
  { key: 'lead', label: 'Hot Leads', color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { key: 'follow-up', label: 'Follow-ups', color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { key: 'closed', label: 'Contracts Signed', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
];

function KanbanCard({ card, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);

  const probColor =
    card.probability >= 75 ? 'text-emerald-600' :
    card.probability >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="kanban-card animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-slate-800 leading-tight pr-2">{card.clientName}</p>
        <span className={`text-xs font-bold ${probColor} flex-shrink-0`}>{card.probability}%</span>
      </div>
      <p className="text-xs text-slate-500 mb-2.5">{card.product}</p>
      <div className="flex items-center gap-1.5 mb-2.5">
        <DollarSign size={12} className="text-emerald-600" />
        <span className="text-sm font-bold text-emerald-700">${card.amount?.toLocaleString()}</span>
      </div>

      {card.employee && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={9} className="text-primary-600" />
          </div>
          <span className="text-xs text-slate-500">{card.employee?.name}</span>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5 mb-2"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {expanded ? 'Less' : 'More'}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-500 italic mb-2">{card.notes}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={10} />
            {new Date(card.date).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Move to next stage */}
      {card.status !== 'closed' && (
        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          <select
            defaultValue={card.status}
            onChange={(e) => onStatusChange(card._id, e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300 cursor-pointer"
          >
            <option value="lead">→ Hot Lead</option>
            <option value="follow-up">→ Follow-up</option>
            <option value="negotiation">→ Negotiation</option>
            <option value="closed">→ Close Deal</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default function PipelineKanban({ data = {}, loading, onRefresh }) {
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateSaleStatus(id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[400px]">
      {COLUMNS.map((col) => {
        const cards = data[col.key] || [];
        const totalValue = cards.reduce((s, c) => s + (c.amount || 0), 0);
        return (
          <div key={col.key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className={`${col.light} border ${col.border} rounded-xl px-3 py-2.5 mb-3 flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.light} ${col.text} border ${col.border}`}>
                  {cards.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-4.5">
                ${totalValue?.toLocaleString()}
              </p>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[520px] pr-0.5 scrollbar-hide">
              {cards.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                  <p className="text-xs text-slate-400">No records</p>
                </div>
              ) : (
                cards.slice(0, 15).map((card) => (
                  <KanbanCard
                    key={card._id}
                    card={{ ...card, status: col.key }}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
