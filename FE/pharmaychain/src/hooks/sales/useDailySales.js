import { useState, useCallback, useEffect } from 'react';
import {
    getDailySalesOverview,
    getDailyInvoices,
    getDailyShifts,
    reconcileDailySales,
} from '../../api/DailySalesAPI';

export const useDailySales = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [storeId, setStoreId] = useState(7);
    const [date, setDate] = useState(todayStr);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'invoices' | 'shifts'

    // Overview state
    const [overview, setOverview] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(false);

    // Invoices state
    const [invoices, setInvoices] = useState([]);
    const [invPage, setInvPage] = useState(0);
    const [invSize] = useState(10);
    const [invTotal, setInvTotal] = useState(0);
    const [invLoading, setInvLoading] = useState(false);

    // Shifts state
    const [shifts, setShifts] = useState([]);
    const [shiftsLoading, setShiftsLoading] = useState(false);

    // Modal & Actions state
    const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
    const [reconciling, setReconciling] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Fetch overview
    const fetchOverview = useCallback(async () => {
        setOverviewLoading(true);
        setError(null);
        try {
            const data = await getDailySalesOverview({ storeId, date });
            setOverview(data);
        } catch (err) {
            setError(err?.message || 'Không thể tải tổng quan doanh thu ngày');
        } finally {
            setOverviewLoading(false);
        }
    }, [storeId, date]);

    // Fetch invoices
    const fetchInvoices = useCallback(async () => {
        setInvLoading(true);
        setError(null);
        try {
            const data = await getDailyInvoices({ storeId, date, page: invPage, size: invSize });
            setInvoices(data?.content || []);
            setInvTotal(data?.totalElements || 0);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách hóa đơn');
        } finally {
            setInvLoading(false);
        }
    }, [storeId, date, invPage, invSize]);

    // Fetch shifts
    const fetchShifts = useCallback(async () => {
        setShiftsLoading(true);
        setError(null);
        try {
            const data = await getDailyShifts({ storeId, date });
            setShifts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách ca làm việc');
        } finally {
            setShiftsLoading(false);
        }
    }, [storeId, date]);

    // Load all
    const reloadAll = useCallback(() => {
        fetchOverview();
        fetchInvoices();
        fetchShifts();
    }, [fetchOverview, fetchInvoices, fetchShifts]);

    useEffect(() => {
        reloadAll();
    }, [reloadAll]);

    // Reconcile action
    const handleReconcile = async ({ actualCash, note }) => {
        setReconciling(true);
        setError(null);
        try {
            const payload = {
                storeId: Number(storeId),
                businessDate: date,
                actualCash: Number(actualCash),
                note: note ? note.trim() : '',
            };
            const result = await reconcileDailySales(payload);
            setOverview(result);
            setSuccessMsg('Xác nhận đối soát và chốt sổ doanh thu ngày thành công!');
            setReconcileModalOpen(false);
            reloadAll();
            return result;
        } catch (err) {
            throw err;
        } finally {
            setReconciling(false);
        }
    };

    return {
        storeId,
        setStoreId,
        date,
        setDate,
        activeTab,
        setActiveTab,
        overview,
        overviewLoading,
        invoices,
        invPage,
        setInvPage,
        invSize,
        invTotal,
        invLoading,
        shifts,
        shiftsLoading,
        reconcileModalOpen,
        setReconcileModalOpen,
        reconciling,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        reloadAll,
        handleReconcile,
    };
};
