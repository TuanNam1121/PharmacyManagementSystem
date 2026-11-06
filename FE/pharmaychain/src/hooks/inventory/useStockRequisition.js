import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRequisitionList, getRequisitionDetail, createStockRequisition } from '../../api/StockRequisitionAPI';

export const useStockRequisition = () => {
    const [searchParams] = useSearchParams();
    const initialStoreId = searchParams.get('storeId') || localStorage.getItem('pms_selected_store_id') || 3;

    // ── list state ──────────────────────────────────────────────────────────────
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [storeId, setStoreId] = useState(initialStoreId);
    const [statusFilter, setStatusFilter] = useState('');
    const [listLoading, setListLoading] = useState(false);

    useEffect(() => {
        const urlStoreId = searchParams.get('storeId');
        if (urlStoreId && String(urlStoreId) !== String(storeId)) {
            setStoreId(urlStoreId);
        }
    }, [searchParams, storeId]);

    useEffect(() => {
        const handleStoreChange = (e) => {
            if (e?.detail?.storeId && String(e.detail.storeId) !== String(storeId)) {
                setStoreId(e.detail.storeId);
            }
        };
        window.addEventListener('pms:store-changed', handleStoreChange);
        return () => window.removeEventListener('pms:store-changed', handleStoreChange);
    }, [storeId]);

    // ── detail modal state ───────────────────────────────────────────────────────
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── create modal state ───────────────────────────────────────────────────────
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
            setError(e.message || 'Failed to load stock requisitions list');
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
            setError(e.message || 'Failed to load requisition details');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── create requisition ────────────────────────────────────────────────────────
    const handleCreateRequisition = useCallback(async (payload) => {
        setSubmitting(true);
        setError(null);
        try {
            await createStockRequisition(payload);
            setSuccessMsg('Stock requisition created successfully!');
            setCreateModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Failed to create stock requisition');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

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
        createModalOpen, setCreateModalOpen,
        submitting,
        handleCreateRequisition,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    };
};
