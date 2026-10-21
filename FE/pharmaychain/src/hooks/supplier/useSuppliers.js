import { useState, useCallback } from 'react';
import { viewSupplierList, viewSupplierDetail, createSupplier, updateSupplier, deleteSupplier } from '../../api/SupplierAPI';

export const useSuppliers = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState('id');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await viewSupplierList({
        page,
        size,
        sort,
        keyword: search,
        status: statusFilter,
      });
      const items = res?.content || [];
      setData(items);
      setTotal(res?.totalElements ?? items.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch supplier list');
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, search, statusFilter]);

  const fetchDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const res = await viewSupplierDetail(id);
      setDetail(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch supplier details');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (payload) => {
    try {
      setError(null);
      await createSupplier(payload);
      setSuccessMsg('Supplier partner added successfully!');
      await fetchList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create supplier');
      throw err;
    }
  }, [fetchList]);

  const handleUpdate = useCallback(async (id, payload) => {
    try {
      setError(null);
      await updateSupplier(id, payload);
      setSuccessMsg('Supplier partner updated successfully!');
      await fetchList();
      if (detail && detail.id === id) {
        await fetchDetail(id);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update supplier');
      throw err;
    }
  }, [fetchList, detail, fetchDetail]);

  const handleDelete = useCallback(async (id) => {
    try {
      setError(null);
      await deleteSupplier(id);
      setSuccessMsg('Supplier partner deactivated successfully!');
      await fetchList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete supplier');
      throw err;
    }
  }, [fetchList]);

  return {
    data,
    total,
    page,
    size,
    sort,
    search,
    statusFilter,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    setPage,
    setSize,
    setSort,
    setSearch,
    setStatusFilter,
    fetchList,
    fetchDetail,
    handleCreate,
    handleUpdate,
    handleDelete,
    detail,
    detailLoading,
    setDetail,
  };
};
