import { useState, useCallback, useEffect } from 'react';
import { getGoodsReceiptList, getGoodsReceiptDetail, confirmGoodsReceipt } from '../../api/GoodsReceiptAPI';

export const useGoodsReceipt = () => {
    // ── List & Filter States ──
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [storeId, setStoreId] = useState(7); // Mặc định chi nhánh mẫu
    const [statusFilter, setStatusFilter] = useState('');
    const [listLoading, setListLoading] = useState(false);

    // ── Modal States ──
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
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
            setError(e.message || 'Lỗi tải danh sách phiếu nhập kho');
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
            setError(e.message || 'Lỗi tải chi tiết phiếu');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── Open Confirm Receipt Modal ──
    const openConfirmModal = useCallback(async (item) => {
        setConfirmModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getGoodsReceiptDetail(item.id);
            setSelectedItem(detail);
        } catch (e) {
            setError(e.message || 'Lỗi tải chi tiết phiếu để kiểm nhận');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── Handle Confirm Receipt (Step 4, 5) ──
    const handleConfirmReceipt = useCallback(async (receiptId, payload) => {
        setSubmitting(true);
        setError(null);
        try {
            await confirmGoodsReceipt(receiptId, payload);
            setSuccessMsg('Xác nhận nhập kho thành công! Tồn kho chi nhánh đã được cập nhật.');
            setConfirmModalOpen(false);
            setDetailModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Lỗi khi xác nhận nhập kho');
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
        detailLoading,
        submitting,
        openDetail,
        openConfirmModal,
        handleConfirmReceipt,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        fetchList,
    };
};
