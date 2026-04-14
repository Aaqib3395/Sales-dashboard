import { useFilters } from '../context/FilterContext';
import { Filter, Calendar, Users, User } from 'lucide-react';

export default function Filters({ employees = [], showEmployee = true }) {
  const { filters, setFilters } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Filter size={14} />
        <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
      </div>

      {/* Period */}
      <div className="relative flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
        <Calendar size={13} className="text-slate-400" />
        <select
          value={filters.period}
          onChange={(e) => setFilters.setPeriod(e.target.value)}
          className="appearance-none bg-transparent pr-4 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Team */}
      <div className="relative flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
        <Users size={13} className="text-slate-400" />
        <select
          value={filters.team}
          onChange={(e) => setFilters.setTeam(e.target.value)}
          className="appearance-none bg-transparent pr-4 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="all">All Teams</option>
          <option value="Team Alpha">Team Alpha</option>
          <option value="Team Beta">Team Beta</option>
          <option value="Team Gamma">Team Gamma</option>
          <option value="Team Delta">Team Delta</option>
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Employee */}
      {showEmployee && employees.length > 0 && (
        <div className="relative flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
          <User size={13} className="text-slate-400" />
          <select
            value={filters.employeeId}
            onChange={(e) => setFilters.setEmployeeId(e.target.value)}
            className="appearance-none bg-transparent pr-4 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer max-w-[140px]"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}
