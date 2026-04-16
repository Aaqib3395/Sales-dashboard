import { useState, useEffect } from 'react';
import { Shield, Users } from 'lucide-react';
import { getUsers, updateUserRole, updateUserTeam, updateUserStatus } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Admin', 'Manager', 'Sales Rep'];
const TEAMS = ['', 'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

const ROLE_BADGE = {
  Admin: 'bg-red-50 text-red-700',
  Manager: 'bg-violet-50 text-violet-700',
  'Sales Rep': 'bg-blue-50 text-blue-700',
};

export default function UserManagement() {
  const { hasRole, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUsers().then((res) => setUsers(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    const res = await updateUserRole(id, role);
    setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
  };

  const handleTeamChange = async (id, team) => {
    const res = await updateUserTeam(id, team);
    setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
  };

  const handleToggleActive = async (id, isActive) => {
    const res = await updateUserStatus(id, isActive);
    setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
  };

  if (!hasRole('Admin')) {
    return (
      <div className="p-6 text-center py-20">
        <Shield size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium">Admin access required</p>
        <p className="text-sm text-slate-400 mt-1">Only administrators can manage user roles</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield size={22} className="text-primary-600" /> User Management
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage roles and access control</p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ROLE_BADGE[role]}`}>
                <Users size={18} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-800">{count}</p>
                <p className="text-xs text-slate-400">{role}s</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {['User', 'Email', 'Role', 'Team', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase py-3 px-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === currentUser._id}
                        className="input text-xs py-1 px-2"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.team || ''}
                        onChange={(e) => handleTeamChange(u._id, e.target.value)}
                        className="input text-xs py-1 px-2"
                      >
                        {TEAMS.map((t) => <option key={t} value={t}>{t || 'None'}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(u._id, !u.isActive)}
                        disabled={u._id === currentUser._id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
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
