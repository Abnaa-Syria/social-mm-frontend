import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export default function useReportFilters(defaults = {}) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => ({
    boardId: params.get('boardId') || defaults.boardId || '',
    campaignId: params.get('campaignId') || defaults.campaignId || '',
    teamId: params.get('teamId') || defaults.teamId || '',
    userId: params.get('userId') || defaults.userId || '',
    status: params.get('status') || defaults.status || '',
    priority: params.get('priority') || defaults.priority || '',
    type: params.get('type') || defaults.type || '',
    taskTypeId: params.get('taskTypeId') || defaults.taskTypeId || '',
    startDate: params.get('startDate') || defaults.startDate || '',
    endDate: params.get('endDate') || defaults.endDate || '',
    action: params.get('action') || defaults.action || '',
  }), [params, defaults]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const setDateRange = ({ startDate, endDate }) => {
    const next = new URLSearchParams(params);
    if (startDate) next.set('startDate', startDate);
    else next.delete('startDate');
    if (endDate) next.set('endDate', endDate);
    else next.delete('endDate');
    setParams(next);
  };

  const clearFilters = () => setParams(new URLSearchParams());

  const queryParams = useMemo(() => {
    const q = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) q[k] = v; });
    return q;
  }, [filters]);

  return { filters, setFilter, setDateRange, clearFilters, queryParams };
};
