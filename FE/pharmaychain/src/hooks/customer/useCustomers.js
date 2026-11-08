import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCustomers } from '../../api/customerApi';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce keyword input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);

    return () => clearTimeout(handler);
  }, [keyword]);

  // Reset to first page when search criteria change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(0);
  }, [debouncedKeyword, statusFilter]);

  // Fetch customers list
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCustomers({
        keyword: debouncedKeyword,
        status: statusFilter,
        page,
        size,
        sortBy,
        sortDir,
      });

      if (res && res.content) {
        setCustomers(res.content);
        setTotalElements(res.totalElements ?? 0);
        setTotalPages(res.totalPages ?? 0);
      } else {
        setCustomers([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Không thể tải danh sách khách hàng');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, statusFilter, page, size, sortBy, sortDir]);

  // Load when dependencies change
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Clear all filters
  const resetFilters = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    setStatusFilter('');
    setPage(0);
  }, []);

  return {
    customers,
    totalElements,
    totalPages,
    page,
    setPage,
    size,
    setSize,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    loading,
    error,
    setError,
    reload: loadCustomers,
    resetFilters,
  };
}

