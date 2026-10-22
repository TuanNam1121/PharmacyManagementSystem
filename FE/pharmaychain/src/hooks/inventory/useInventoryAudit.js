import { useState, useCallback, useEffect } from 'react';
import { getAuditList, getAuditDetail, reviewAudit } from '../../api/InventoryAuditAPI';

export const useInventoryAudit = () => {
    // ── list state ──────────────────────────────────────────────────────────────
    const [auditList, setAuditList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '' | 0 | 1 | 2
    const [listLoading, setListLoading] = useState(false);

    // ── detail / modal state ────────────────────────────────────────────────────
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── review modal state ──────────────────────────────────────────────────────
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── alerts ──────────────────────────────────────────────────────────────────
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── fetch list ───────────────────────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await getAuditList({ status: statusFilter, search, page, size });
            setAuditList(data?.content ?? []);
            setTotal(data?.totalElements ?? 0);
        } catch (e) {
            setError(e.message || 'Failed to load inventory audits list');
        } finally {
            setListLoading(false);
        }
    }, [statusFilter, search, page, size]);

    useEffect(() => { fetchList(); }, [fetchList]);

    // ── open detail ──────────────────────────────────────────────────────────────
    const openDetail = useCallback(async (audit) => {
        setSelectedAudit(audit);
        setDetailModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getAuditDetail(audit.id);
            setSelectedAudit(detail);
        } catch (e) {
            setError(e.message || 'Failed to load audit details');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // ── open review modal ────────────────────────────────────────────────────────
    const openReview = useCallback((audit) => {
        setSelectedAudit(audit);
        setReviewModalOpen(true);
    }, []);

    // ── submit review ────────────────────────────────────────────────────────────
    const handleReview = useCallback(async ({ decision, reviewNote }) => {
        if (!selectedAudit) return;
        setSubmitting(true);
        setError(null);
        try {
            await reviewAudit({ auditId: selectedAudit.id, decision, reviewNote });
            setSuccessMsg(
                decision === 1
                    ? `Successfully confirmed audit ${selectedAudit.code}`
                    : `Successfully rejected audit ${selectedAudit.code} (recount requested)`
            );
            setReviewModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Audit review failed');
        } finally {
            setSubmitting(false);
        }
    }, [selectedAudit, fetchList]);

    return {
        // list
        auditList, total, page, setPage, size,
        search, setSearch,
        statusFilter, setStatusFilter,
        listLoading,
        // detail
        selectedAudit,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        // review
        reviewModalOpen, setReviewModalOpen,
        openReview,
        handleReview,
        submitting,
        // alerts
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    };
};
