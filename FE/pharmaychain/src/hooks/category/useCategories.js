import { useState, useCallback } from 'react';
import {
  viewCategoryList,
  viewCategoryDetail,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from '../../api/CategoryAPI';

export const useCategories = () => {
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
      const res = await viewCategoryList({ page, size, sort });
      // Support both paginated object {content, totalElements} and raw array response
      const isArray = Array.isArray(res);
      let items = isArray ? res : res.content || [];

      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (x) =>
            (x.name || '').toLowerCase().includes(s) ||
            (x.description || '').toLowerCase().includes(s)
        );
      }
      if (statusFilter !== '' && statusFilter !== null) {
        items = items.filter((x) => String(x.status) === String(statusFilter));
      }
      setData(items);
      const totalCount = isArray ? items.length : (res.totalElements != null ? res.totalElements : items.length);
      setTotal(totalCount);
    } catch (err) {
      setError(err.message || 'Failed to fetch category list');
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, search, statusFilter]);

  const fetchDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const res = await viewCategoryDetail(id);
      setDetail(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch category details');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (payload) => {
    try {
      setError(null);
      await createCategory(payload);
      setSuccessMsg('Category created successfully!');
      await fetchList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create category');
      throw err;
    }
  }, [fetchList]);

  const handleUpdate = useCallback(async (id, payload) => {
    try {
      setError(null);
      await updateCategory(id, payload);
      setSuccessMsg('Category updated successfully!');
      await fetchList();
      if (detail && detail.id === id) {
        await fetchDetail(id);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    }
  }, [fetchList, detail, fetchDetail]);

  const handleToggleStatus = useCallback(async (id, currentStatus) => {
    try {
      setError(null);
      const newStatus = Number(currentStatus) === 1 ? 0 : 1;
      await updateCategoryStatus(id, newStatus);
      const actionText = newStatus === 1 ? 'activated' : 'disabled';
      setSuccessMsg(`Category has been ${actionText} successfully.`);
      await fetchList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to change category status.');
      throw err;
    }
  }, [fetchList]);

  const handleDeleteCategory = useCallback(async (id) => {
    try {
      setError(null);
      await deleteCategory(id);
      setSuccessMsg('Category deleted successfully.');
      await fetchList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete category.');
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
    handleToggleStatus,
    handleDeleteCategory,
    detail,
    detailLoading,
    setDetail,
  };
};
