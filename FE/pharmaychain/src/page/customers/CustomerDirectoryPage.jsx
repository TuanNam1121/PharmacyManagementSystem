import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../../hooks/customer/useCustomers';
import {
  fetchCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  reactivateCustomer,
} from '../../api/customerApi';
import CustomerStats from '../../component/customer/CustomerStats';
import CustomerFilters from '../../component/customer/CustomerFilters';
import CustomerTable from '../../component/customer/CustomerTable';
import CustomerPagination from '../../component/customer/CustomerPagination';
import CustomerDetailModal from '../../component/customer/CustomerDetailModal';
import CustomerFormModal from '../../component/customer/CustomerFormModal';
import CustomerDeleteModal from '../../component/customer/CustomerDeleteModal';

export default function CustomerDirectoryPage() {
  const navigate = useNavigate();
  const {
    customers,
    totalElements,
    totalPages,
    page,
    setPage,
    size,
    setSize,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    reload,
    resetFilters,
  } = useCustomers();

  // State for Customer Detail Drawer
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // State for Create / Edit Form Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // State for Delete / Deactivate Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // View Customer Details
  const handleView = async (customer) => {
    const custId = customer.customerId || customer.id;
    if (!custId) return;

    setSelectedCustomer(customer);
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const fullDetail = await fetchCustomerDetail(custId);
      setSelectedCustomer(fullDetail);
    } catch (err) {
      console.error('Error fetching customer detail:', err);
      showNotification(err.message || 'Không thể tải chi tiết khách hàng', 'warning');
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Create Customer Form
  const handleAddNew = () => {
    setFormMode('create');
    setEditingCustomer(null);
    setFormModalOpen(true);
  };

  // Open Edit Customer Form
  const handleEdit = async (customer) => {
    const custId = customer.customerId || customer.id;
    setFormMode('edit');
    setEditingCustomer(customer);
    setFormModalOpen(true);

    try {
      // Fetch fresh detail to populate form completely
      const full = await fetchCustomerDetail(custId);
      setEditingCustomer(full);
    } catch {
      // fallback to initial customer object
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (payload) => {
    try {
      setFormSubmitting(true);
      if (formMode === 'create') {
        const created = await createCustomer(payload);
        showNotification(`Đăng ký khách hàng ${created.fullName} thành công!`, 'success');
      } else {
        const custId = editingCustomer.customerId || editingCustomer.id;
        const updated = await updateCustomer(custId, payload);
        showNotification(`Cập nhật thông tin khách hàng ${updated.fullName} thành công!`, 'success');
      }
      setFormModalOpen(false);
      reload();
    } catch (err) {
      console.error('Error saving customer:', err);
      showNotification(err.message || 'Lỗi khi lưu thông tin khách hàng', 'warning');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleDelete = (customer) => {
    setDeletingCustomer(customer);
    setDeleteModalOpen(true);
  };

  // Confirm Deactivate
  const handleConfirmDelete = async (customerId, reason) => {
    try {
      setDeleteSubmitting(true);
      await deleteCustomer(customerId, reason);
      showNotification('Đã vô hiệu hóa khách hàng thành công!', 'success');
      setDeleteModalOpen(false);
      reload();
    } catch (err) {
      console.error('Error deactivating customer:', err);
      showNotification(err.message || 'Lỗi khi vô hiệu hóa khách hàng', 'warning');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Reactivate Inactive Customer
  const handleReactivate = async (customer) => {
    const custId = customer.customerId || customer.id;
    try {
      await reactivateCustomer(custId);
      showNotification(`Đã kích hoạt lại tài khoản khách hàng ${customer.fullName}!`, 'success');
      reload();
    } catch (err) {
      console.error('Error reactivating customer:', err);
      showNotification(err.message || 'Lỗi khi kích hoạt lại khách hàng', 'warning');
    }
  };

  const handleExport = () => {
    showNotification('Đang tạo báo cáo danh sách khách hàng...', 'info');
  };

  const handleNewSale = (customer) => {
    const custData = {
      id: customer.customerId || customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      allergies: customer.allergies,
      hasAllergies: customer.hasAllergies,
    };
    showNotification(`Đang mở quầy bán lẻ POS cho khách hàng ${custData.fullName}...`, 'success');
    setDetailModalOpen(false);
    setTimeout(() => {
      navigate('/pos', { state: { selectedCustomer: custData } });
    }, 300);
  };

  return (
    <div className="pms-page-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 8,
            backgroundColor: toast.type === 'warning' ? '#b45309' : toast.type === 'success' ? '#059669' : '#047857',
            color: '#fff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Quản Lý Khách Hàng</h1>
          <p className="pms-page-subtitle">
            Danh sách hồ sơ khách hàng, lịch sử mua thuốc và cảnh báo tiền sử dị ứng y tế
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <CustomerStats total={totalElements} customers={customers} />

      {/* Error alert if any */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Filter and Action Bar */}
      <CustomerFilters
        keyword={keyword}
        statusFilter={statusFilter}
        onKeywordChange={setKeyword}
        onStatusChange={setStatusFilter}
        onAddNew={handleAddNew}
        onExport={handleExport}
        total={totalElements}
      />

      {/* Table Data */}
      <CustomerTable
        customers={customers}
        loading={loading}
        page={page}
        size={size}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
        onClearFilters={resetFilters}
      />

      {/* Pagination */}
      <CustomerPagination
        total={totalElements}
        page={page}
        size={size}
        onPageChange={setPage}
        onSizeChange={setSize}
      />

      {/* Customer Detail Drawer / Modal (UC29) */}
      <CustomerDetailModal
        show={detailModalOpen}
        onHide={() => setDetailModalOpen(false)}
        customer={selectedCustomer}
        loading={detailLoading}
        onEdit={(cust) => {
          setDetailModalOpen(false);
          handleEdit(cust);
        }}
        onNewSale={handleNewSale}
      />

      {/* Customer Form Modal: Create & Edit (UC27 & UC28) */}
      <CustomerFormModal
        show={formModalOpen}
        onHide={() => setFormModalOpen(false)}
        mode={formMode}
        customer={editingCustomer}
        onSubmit={handleFormSubmit}
        loading={formSubmitting}
      />

      {/* Customer Delete Modal: Soft Delete (UC31) */}
      <CustomerDeleteModal
        show={deleteModalOpen}
        onHide={() => setDeleteModalOpen(false)}
        customer={deletingCustomer}
        onConfirm={handleConfirmDelete}
        loading={deleteSubmitting}
      />
    </div>
  );
}
