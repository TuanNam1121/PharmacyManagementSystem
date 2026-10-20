import { useState, useCallback } from 'react';
import { viewSupplierList, viewSupplierDetail } from '../../api/SupplierAPI';

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
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await viewSupplierList({ page, size, sort });
      let items = res.content || [];
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (x) =>
            (x.code || '').toLowerCase().includes(s) ||
            (x.name || '').toLowerCase().includes(s) ||
            (x.contactPerson || '').toLowerCase().includes(s) ||
            (x.phone || '').toLowerCase().includes(s)
        );
      }
      if (statusFilter) {
        items = items.filter((x) => x.status === statusFilter);
      }
      setData(items);
      setTotal(res.totalElements ?? items.length);
    } catch (err) {
      setError(err.message || 'Lấy danh sách nhà cung cấp thất bại');
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
      setError(err.message || 'Lấy chi tiết nhà cung cấp thất bại');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    data, total, page, size, sort, search, statusFilter, loading, error,
    setPage, setSize, setSort, setSearch, setStatusFilter,
    fetchList, fetchDetail, detail, detailLoading, setDetail,
  };
};
