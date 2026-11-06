import { useState, useEffect, useCallback } from 'react';
import {
  getRfqs,
  getRfqQuotationDetails,
  compareRfqs,
  getEligibleProposals,
  sendRfq,
} from '../../api/RfqAPI';
import { getRfqDetails, submitQuotation } from '../../api/PublicRfqAPI';
import { viewSupplierList } from '../../api/SupplierAPI';

/**
 * Hook: Fetch danh sách RFQ (dùng cho RfqPage)
 */
export function useRfq({ search, status, supplierId, purchaseProposalId, page, size }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRfqs({
        search,
        status: status || undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        purchaseProposalId: purchaseProposalId ? Number(purchaseProposalId) : undefined,
        page,
        size,
      });
      setData(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
      setError(err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  }, [search, status, supplierId, purchaseProposalId, page, size]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getRfqs({
          search,
          status: status || undefined,
          supplierId: supplierId ? Number(supplierId) : undefined,
          purchaseProposalId: purchaseProposalId ? Number(purchaseProposalId) : undefined,
          page,
          size,
        });
        if (!ignore) {
          setData(response.content || []);
          setTotal(response.totalElements || 0);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch RFQs:', err);
          setError(err.message || 'Failed to load RFQs');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, search, status, supplierId, purchaseProposalId, size]);

  return {
    data,
    total,
    loading,
    error,
    refetch: fetchRfqs,
  };
}

/**
 * Hook: Fetch chi tiết + báo giá của một RFQ
 */
export function useRfqDetail(rfqId) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!rfqId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRfqQuotationDetails(rfqId);
      setDetail(data);
    } catch (err) {
      console.error('Failed to fetch RFQ details:', err);
      setError(err.message || 'Failed to load RFQ details');
    } finally {
      setLoading(false);
    }
  }, [rfqId]);

  useEffect(() => {
    let ignore = false;

    if (!rfqId) return;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRfqQuotationDetails(rfqId);
        if (!ignore) setDetail(data);
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch RFQ details:', err);
          setError(err.message || 'Failed to load RFQ details');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [rfqId]);

  return { detail, loading, error, refetch: fetchDetail };
}

/**
 * Hook: So sánh nhiều RFQ
 */
export function useCompareRfqs() {
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState(null);

  const compare = useCallback(async (rfqIds) => {
    setCompareLoading(true);
    setError(null);
    try {
      const data = await compareRfqs(rfqIds);
      setCompareData(data);
    } catch (err) {
      console.error('Failed to compare RFQs:', err);
      setError(err.message || 'Failed to compare RFQs');
    } finally {
      setCompareLoading(false);
    }
  }, []);

  return { compareData, compareLoading, error, compare };
}

/**
 * Hook: Quản lý danh sách RFQ được chọn
 */
export function useRfqSelection(data) {
  const [selectedRfqs, setSelectedRfqs] = useState([]);

  const toggleSelect = useCallback(
    (rfqId, rfqPurchaseProposalId) => {
      setSelectedRfqs((prev) => {
        // prev là danh sách object chứa { id, ... } nên dùng some thay vì includes
        const exists = prev.some((item) => item.id === rfqId);
        if (exists) {
          return prev.filter((item) => item.id !== rfqId);
        }
        const rfq = data?.find((r) => r.id === rfqId);
        return [
          ...prev,
          {
            id: rfqId,
            code: rfq ? rfq.code : '',
            supplierName: rfq ? rfq.supplierName : null,
            purchaseProposalId: rfqPurchaseProposalId,
          },
        ];
      });
    },
    [data]
  );

  const clearSelection = useCallback(() => {
    setSelectedRfqs([]);
  }, []);

  const handleCompareSelected = useCallback(() => {
    return selectedRfqs.map((r) => r.id);
  }, [selectedRfqs]);

  return {
    selectedRfqs,
    toggleSelect,
    clearSelection,
    handleCompareSelected,
    setSelectedRfqs,
    selectedCount: selectedRfqs.length,
  };
}

/**
 * Hook: Gửi RFQ đến nhà cung cấp
 */
export function useSendRfq(supplier) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(supplier?.id ?? '');

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const data = await viewSupplierList({ page: 0, size: 100, status: 'ACTIVE' });
      setSuppliers(data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEligibleProposals();
      setProposals(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load purchase proposals');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supplierId = selectedSupplierId || supplier?.id;
    if (!supplierId) {
      setError('Please select a supplier');
      return false;
    }
    if (!selectedProposalId) {
      setError('Please select a purchase proposal');
      return false;
    }
    if (!subject.trim()) {
      setError('Please enter email subject');
      return false;
    }
    if (!content.trim()) {
      setError('Please enter email content');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await sendRfq({
        supplierId: Number(supplierId),
        purchaseProposalId: Number(selectedProposalId),
        subject: subject.trim(),
        content: content.trim(),
      });
      resetForm();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send RFQ');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProposalId('');
    setSubject('');
    setContent('');
    setSelectedSupplierId(supplier?.id ?? '');
    setError(null);
  };

  return {
    proposals,
    loading,
    submitting,
    error,
    selectedProposalId,
    setSelectedProposalId,
    subject,
    setSubject,
    content,
    setContent,
    suppliers,
    suppliersLoading,
    selectedSupplierId,
    setSelectedSupplierId,
    fetchProposals,
    fetchSuppliers,
    handleSubmit,
    resetForm,
  };
}

/**
 * Hook: Trang phản hồi RFQ công khai
 */
export function useRfqResponse(token) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    let ignore = false;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRfqDetails(token);
        if (!ignore) {
          setRfqData(data);
          setItems(
            data?.items?.map((item) => ({
              ...item,
              unitPrice: item.unitPrice || '',
              supplierNote: item.supplierNote || '',
            })) || []
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.message ||
              'Failed to load RFQ details. The link may be expired or invalid.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handlePriceChange = useCallback((index, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setItems((prev) => {
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], unitPrice: value };
        return newItems;
      });
    }
  }, []);

  const handleNoteChange = useCallback((index, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], supplierNote: value };
      return newItems;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidItems = items.filter(
      (item) => !item.unitPrice || item.unitPrice.toString().trim() === ''
    );
    if (invalidItems.length > 0) {
      setError('Please enter unit price for all items');
      return;
    }

    const submissionItems = items.map((item) => ({
      itemId: item.id,
      unitPrice: parseFloat(item.unitPrice),
      note: item.supplierNote || '',
    }));

    setSubmitting(true);
    setError(null);
    try {
      await submitQuotation(token, { items: submissionItems });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return {
    rfqData,
    items,
    loading,
    submitting,
    error,
    success,
    handlePriceChange,
    handleNoteChange,
    handleSubmit,
    formatDate,
  };
}