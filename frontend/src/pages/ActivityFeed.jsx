import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Filter } from 'lucide-react';
import { getActivities } from '../api/axios';

const ACTION_CONFIG = {
  deal_created: { emoji: '➕', color: 'bg-blue-100 text-blue-700' },
  deal_updated: { emoji: '✏️', color: 'bg-amber-100 text-amber-700' },
  deal_closed: { emoji: '🎉', color: 'bg-emerald-100 text-emerald-700' },
  status_changed: { emoji: '📊', color: 'bg-violet-100 text-violet-700' },
  lead_added: { emoji: '🔥', color: 'bg-orange-100 text-orange-700' },
  employee_added: { emoji: '👤', color: 'bg-primary-100 text-primary-700' },
  client_added: { emoji: '🏢', color: 'bg-teal-100 text-teal-700' },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getActivities({ team: teamFilter, limit: 50 })
      .then((res) => setActivities(res.data.activities))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamFilter]);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Activity Feed</h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time updates across all deals and pipelines</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="input text-sm"
          >
            <option value="all">All Teams</option>
            <option value="Team Alpha">Team Alpha</option>
            <option value="Team Beta">Team Beta</option>
            <option value="Team Gamma">Team Gamma</option>
            <option value="Team Delta">Team Delta</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ActivityIcon size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-1">Actions will appear here as they happen</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />

            <div className="space-y-0">
              {activities.map((a) => {
                const config = ACTION_CONFIG[a.action] || { emoji: '📋', color: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={a._id} className="flex items-start gap-4 py-4 relative">
                    <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-lg flex-shrink-0 z-10 border-2 border-white`}>
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-slate-700">{a.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                        {a.employeeId?.team && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{a.employeeId.team}</span>
                        )}
                        {a.metadata?.amount && (
                          <span className="text-xs font-semibold text-emerald-600">${a.metadata.amount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
