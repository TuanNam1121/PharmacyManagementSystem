import { useState, useCallback, useEffect } from 'react';
import { getRequisitionList, getRequisitionDetail } from '../../api/StockRequisitionAPI';

export const useStockRequisition = () => {
    // ── list state ──────────────────────────────────────────────────────────────
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [storeId, setStoreId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [listLoading, setListLoading] = useState(false);

    // ── detail modal state ───────────────────────────────────────────────────────
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── alerts ───────────────────────────────────────────────────────────────────
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── fetch list ───────────────────────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await getRequisitionList({ storeId, status: statusFilter, search, page, size });
            setList(data?.content ?? []);
            setTotal(data?.totalElements ?? 0);
        } catch (e) {
            setError(e.message || 'Lỗi tải danh sách đơn yêu cầu');
        } finally {
            setListLoading(false);
        }
    }, [storeId, statusFilter, search, page, size]);

    useEffect(() => { fetchList(); }, [fetchList]);

    // ── open detail ───────────────────────────────────────────────────────────────
    const openDetail = useCallback(async (item) => {
        setSelectedItem(item);
        setDetailModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getRequisitionDetail(item.id);
            setSelectedItem(detail);
        } catch (e) {
            setError(e.message || 'Lỗi tải chi tiết đơn yêu cầu');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    return {
        list, total, page, setPage, size,
        search, setSearch,
        storeId, setStoreId,
        statusFilter, setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    };
};
