import { useState, useCallback, useEffect } from 'react';
import { getGoodsReceiptList, getGoodsReceiptDetail, confirmGoodsReceipt, rejectGoodsReceipt } from '../../api/GoodsReceiptAPI';

export const useGoodsReceipt = () => {
    // ── List & Filter States ──
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [storeId, setStoreId] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [listLoading, setListLoading] = useState(false);

    // ── Modal States ──
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Alerts ──
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── Fetch List ──
    const fetchList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await getGoodsReceiptList({
                storeId,
                status: statusFilter,
                search,
                page,
                size,
            });
            setList(data?.content ?? []);
            setTotal(data?.totalElements ?? 0);
        } catch (e) {
            setError(e.message || 'Failed to load goods receipts list');
        } finally {
            setListLoading(false);
        }
    }, [storeId, statusFilter, search, page, size]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // ── Open Detail Modal ──
    const openDetail = useCallback(async (item) => {
        setSelectedItem(item);
        setDetailModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getGoodsReceiptDetail(item.id);
            setSelectedItem(detail);
        } catch (e) {
            setError(e.message || 'Failed to load receipt details');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── Open Confirm (Approve) Modal ──
    const openConfirmModal = useCallback(async (item) => {
        setConfirmModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getGoodsReceiptDetail(item.id);
            setSelectedItem(detail);
        } catch (e) {
            setError(e.message || 'Failed to load receipt details for inspection');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── Open Reject Modal ──
    const openRejectModal = useCallback((item) => {
        setSelectedItem(item);
        setRejectModalOpen(true);
    }, []);

    // ── Handle Approve (Confirm Receipt + Update Inventory) ──
    const handleConfirmReceipt = useCallback(async (receiptId, payload) => {
        setSubmitting(true);
        setError(null);
        try {
            await confirmGoodsReceipt(receiptId, payload);
            setSuccessMsg('✅ Goods receipt approved! Branch inventory has been updated.');
            setConfirmModalOpen(false);
            setDetailModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Error confirming goods receipt');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

    // ── Handle Reject ──
    const handleRejectReceipt = useCallback(async (receiptId, reason) => {
        setSubmitting(true);
        setError(null);
        try {
            await rejectGoodsReceipt(receiptId, reason);
            setSuccessMsg('🚫 Goods receipt has been rejected.');
            setRejectModalOpen(false);
            setDetailModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Error rejecting goods receipt');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

    return {
        list,
        total,
        page,
        setPage,
        size,
        search,
        setSearch,
        storeId,
        setStoreId,
        statusFilter,
        setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen,
        setDetailModalOpen,
        confirmModalOpen,
        setConfirmModalOpen,
        rejectModalOpen,
        setRejectModalOpen,
        detailLoading,
        submitting,
        openDetail,
        openConfirmModal,
        openRejectModal,
        handleConfirmReceipt,
        handleRejectReceipt,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        fetchList,
    };
};
