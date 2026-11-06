import { useState, useCallback } from 'react';
import {
  viewProductList,
  viewProductDetail,
  createProduct,
  updateProduct,
  updateProductStatus,
  viewCategoryOptions,
} from '../../api/ProductAPI';

export const useProducts = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState('id');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await viewProductList({ page, size, sort });
      let items = res.content || [];

      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (x) =>
            (x.name || '').toLowerCase().includes(s) ||
            (x.barcode || '').toLowerCase().includes(s) ||
            (x.manufacturer || '').toLowerCase().includes(s)
        );
      }

      if (statusFilter !== '' && statusFilter !== null) {
        items = items.filter((x) => String(x.status) === String(statusFilter));
      }

      if (categoryFilter !== '' && categoryFilter !== null) {
        items = items.filter((x) => String(x.categoryId) === String(categoryFilter));
      }

      setData(items);
      setTotal(res.totalElements ?? items.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch product list');
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, search, statusFilter, categoryFilter]);

  const fetchDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const res = await viewProductDetail(id);
      setDetail(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCreate = useCallback(
    async (payload) => {
      try {
        setError(null);
        await createProduct(payload);
        setSuccessMsg('Product added to catalog successfully!');
        await fetchList();
        return true;
      } catch (err) {
        setError(err.message || 'Failed to create product');
        throw err;
      }
    },
    [fetchList]
  );

  const handleUpdate = useCallback(
    async (id, payload) => {
      try {
        setError(null);
        await updateProduct(id, payload);
        setSuccessMsg('Product updated successfully!');
        await fetchList();
        if (detail && detail.id === id) {
          await fetchDetail(id);
        }
        return true;
      } catch (err) {
        setError(err.message || 'Failed to update product');
        throw err;
      }
    },
    [fetchList, detail, fetchDetail]
  );

  const handleToggleStatus = useCallback(
    async (id, currentStatus) => {
      try {
        setError(null);
        const targetStatus = Number(currentStatus) === 1 ? 0 : 1;
        await updateProductStatus(id, targetStatus);
        setSuccessMsg(
          targetStatus === 0
            ? 'Đã vô hiệu hóa sản phẩm thành công!'
            : 'Đã kích hoạt lại sản phẩm thành công!'
        );
        await fetchList();
        if (detail && detail.id === id) {
          await fetchDetail(id);
        }
        return true;
      } catch (err) {
        setError(err.message || 'Không thể thay đổi trạng thái sản phẩm');
        throw err;
      }
    },
    [fetchList, detail, fetchDetail]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await viewCategoryOptions();
      const items = res.content || res || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch {
      // silently ignore category load failure
    }
  }, []);

  return {
    data,
    total,
    page,
    size,
    sort,
    search,
    statusFilter,
    categoryFilter,
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
    setCategoryFilter,
    fetchList,
    fetchDetail,
    handleCreate,
    handleUpdate,
    handleToggleStatus,
    detail,
    detailLoading,
    setDetail,
    categories,
    fetchCategories,
  };
};
