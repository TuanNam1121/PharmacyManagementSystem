import { useState, useCallback, useEffect } from 'react';
import {
    getBranchInventory,
    getBranchInventorySummary,
    getInventoryDetail,
    updateStockThreshold,
    auditStockCheck,
} from '../../api/BranchInventoryAPI';

export const useBranchInventory = () => {
    const [storeId, setStoreId] = useState(2);
    const [search, setSearch] = useState('');
    const [warningFilter, setWarningFilter] = useState('ALL'); // ALL, LOW_STOCK, EXPIRING_SOON, EXPIRED, OUT_OF_STOCK
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [total, setTotal] = useState(0);

    const [inventoryList, setInventoryList] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Modals
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const data = await getBranchInventorySummary(storeId);
            setSummary(data);
        } catch (err) {
            console.error('Error loading branch inventory summary:', err);
        } finally {
            setSummaryLoading(false);
        }
    }, [storeId]);

    // Fetch inventory items
    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBranchInventory({
                storeId,
                page,
                size,
                search,
                warningFilter,
            });
            setInventoryList(data?.content || []);
            setTotal(data?.totalElements || 0);
        } catch (err) {
            setError(err?.message || 'Failed to load branch inventory list');
        } finally {
            setLoading(false);
        }
    }, [storeId, page, size, search, warningFilter]);

    const reloadAll = useCallback(() => {
        fetchSummary();
        fetchInventory();
    }, [fetchSummary, fetchInventory]);

    useEffect(() => {
        reloadAll();
    }, [reloadAll]);

    // Handle Threshold Update
    const handleUpdateThreshold = async ({ productId, minQuantity, note }) => {
        setSubmitting(true);
        setError(null);
        try {
            await updateStockThreshold({ productId, minQuantity: Number(minQuantity), note });
            setSuccessMsg('Minimum stock threshold updated successfully!');
            setThresholdModalOpen(false);
            reloadAll();
        } catch (err) {
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Audit Check
    const handleAuditCheck = async ({ note }) => {
        setSubmitting(true);
        setError(null);
        try {
            await auditStockCheck({
                storeId: Number(storeId),
                inventoryId: selectedItem?.id || null,
                note,
            });
            setSuccessMsg('Stock audit check confirmed and recorded successfully!');
            setAuditModalOpen(false);
            reloadAll();
        } catch (err) {
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        storeId,
        setStoreId,
        search,
        setSearch,
        warningFilter,
        setWarningFilter,
        page,
        setPage,
        size,
        total,
        inventoryList,
        summary,
        loading,
        summaryLoading,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        reloadAll,
        selectedItem,
        setSelectedItem,
        detailModalOpen,
        setDetailModalOpen,
        thresholdModalOpen,
        setThresholdModalOpen,
        auditModalOpen,
        setAuditModalOpen,
        submitting,
        handleUpdateThreshold,
        handleAuditCheck,
    };
};
