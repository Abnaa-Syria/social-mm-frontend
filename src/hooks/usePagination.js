import { useState, useCallback } from 'react';
import { PAGE_SIZE } from '../config/constants';

export const usePagination = (initial = { page: 1, limit: PAGE_SIZE }) => {
  const [pagination, setPagination] = useState(initial);

  const setPage = useCallback((page) => setPagination((p) => ({ ...p, page })), []);
  const setLimit = useCallback((limit) => setPagination((p) => ({ ...p, limit, page: 1 })), []);
  const resetPage = useCallback(() => setPagination((p) => ({ ...p, page: 1 })), []);

  return { ...pagination, setPage, setLimit, resetPage, setPagination };
};

export default usePagination;
