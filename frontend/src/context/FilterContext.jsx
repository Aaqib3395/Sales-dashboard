import { createContext, useContext, useState } from 'react';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [period, setPeriod] = useState('monthly');
  const [team, setTeam] = useState('all');
  const [employeeId, setEmployeeId] = useState('all');

  const filters = { period, team, employeeId };
  const setFilters = { setPeriod, setTeam, setEmployeeId };

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
};
