import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getAuditList,
    getAuditDetail,
    requestAuditSession,
    approveAuditRequest,
    submitAuditCount,
    reviewAudit,
} from '../../api/InventoryAuditAPI';
import { getAuthorizedStores } from '../../api/StoreAPI';

export const useInventoryAudit = () => {
    const [searchParams] = useSearchParams();
    const initialStoreId = searchParams.get('storeId') || localStorage.getItem('pms_selected_store_id') || 3;
    console.log(initialStoreId);

    // ── List state ──────────────────────────────────────────────────────────────
    const [auditList, setAuditList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [search, setSearch] = useState('');
    const [storeId, setStoreId] = useState(initialStoreId);
    const [statusFilter, setStatusFilter] = useState(''); // '' | 0 | 1 | 2 | 3 | 4
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

    // ── Modal states ────────────────────────────────────────────────────────────
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [countModalOpen, setCountModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Notifications ───────────────────────────────────────────────────────────
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── Fetch list ──────────────────────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await getAuditList({ storeId, status: statusFilter, search, page, size });
            setAuditList(data?.content ?? []);
            setTotal(data?.totalElements ?? 0);
        } catch (e) {
            setError(e.message || 'Failed to load inventory audits list');
        } finally {
            setListLoading(false);
        }
    }, [storeId, statusFilter, search, page, size]);

    useEffect(() => { fetchList(); }, [fetchList]);

    // ── View Detail ─────────────────────────────────────────────────────────────
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

    // ── 1. Pharmacist: Request Audit ────────────────────────────────────────────
    const handleRequestAudit = useCallback(async (payload) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await requestAuditSession(payload);
            setSuccessMsg(`Audit request ${res.code} submitted successfully. Waiting for Store Manager approval.`);
            fetchList();
        } catch (e) {
            setError(e.message || 'Failed to request audit session');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

    // ── 2. Store Manager: Approve Request ───────────────────────────────────────
    const openApproveModal = useCallback((audit) => {
        setSelectedAudit(audit);
        setApproveModalOpen(true);
    }, []);

    const handleApproveRequest = useCallback(async (payload) => {
        setSubmitting(true);
        setError(null);
        try {
            await approveAuditRequest(payload);
            setSuccessMsg(payload.decision === 1 ? 'Audit request approved! Pharmacist may now start counting.' : 'Audit request rejected.');
            fetchList();
        } catch (e) {
            setError(e.message || 'Failed to review audit request');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

    // ── 3. Pharmacist: Start Counting ───────────────────────────────────────────
    const openCountModal = useCallback(async (audit) => {
        setSelectedAudit(audit);
        setCountModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getAuditDetail(audit.id);
            setSelectedAudit(detail);
        } catch (e) {
            setError(e.message || 'Failed to load items for counting');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleSubmitCount = useCallback(async (payload) => {
        setSubmitting(true);
        setError(null);
        try {
            await submitAuditCount(payload);
            setSuccessMsg('Count results submitted successfully! Waiting for Manager final confirmation.');
            fetchList();
        } catch (e) {
            setError(e.message || 'Failed to submit count results');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [fetchList]);

    // ── 4. Store Manager: Final Review ──────────────────────────────────────────
    const openReviewModal = useCallback(async (audit) => {
        setSelectedAudit(audit);
        setReviewModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = await getAuditDetail(audit.id);
            setSelectedAudit(detail);
        } catch (e) {
            setError(e.message || 'Failed to load details for review');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleFinalReview = useCallback(async ({ decision, reviewNote }) => {
        if (!selectedAudit) return;
        setSubmitting(true);
        setError(null);
        try {
            await reviewAudit({ auditId: selectedAudit.id, decision, reviewNote });
            setSuccessMsg(decision === 3 ? `Audit ${selectedAudit.code} confirmed and approved!` : `Recount requested for audit ${selectedAudit.code}`);
            setReviewModalOpen(false);
            fetchList();
        } catch (e) {
            setError(e.message || 'Final review failed');
            throw e;   // thêm dòng này
        } finally {
            setSubmitting(false);
        }
    }, [selectedAudit, fetchList]);

    return {
        // List
        auditList, total, page, setPage, size,
        
        search, setSearch,
        statusFilter, setStatusFilter,
        listLoading,
        storeId,
        // Selected & Detail
        selectedAudit,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        // Step 1: Request
        requestModalOpen, setRequestModalOpen,
        handleRequestAudit,
        // Step 2: Approve Request
        approveModalOpen, setApproveModalOpen,
        openApproveModal,
        handleApproveRequest,
        // Step 3: Count
        countModalOpen, setCountModalOpen,
        openCountModal,
        handleSubmitCount,
        // Step 4: Final Review
        reviewModalOpen, setReviewModalOpen,
        openReviewModal,
        handleFinalReview,
        // Common
        submitting,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    };
};
