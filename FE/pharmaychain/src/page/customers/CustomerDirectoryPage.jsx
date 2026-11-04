import { useState } from 'react';
import { useCustomers } from '../../hooks/customer/useCustomers';
import CustomerStats from '../../component/customer/CustomerStats';
import CustomerFilters from '../../component/customer/CustomerFilters';
import CustomerTable from '../../component/customer/CustomerTable';
import CustomerPagination from '../../component/customer/CustomerPagination';

export default function CustomerDirectoryPage() {
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
    membershipTier,
    setMembershipTier,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    resetFilters,
  } = useCustomers();

  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddNew = () => {
    showNotification('Tính năng [Thêm mới khách hàng (UC32)] sẽ được phát triển ở nhánh tiếp theo (customer-add).', 'info');
  };

  const handleView = (customer) => {
    showNotification(`Tính năng [Xem chi tiết khách hàng ${customer.customerCode || customer.fullName} (UC31)] sẽ được phát triển ở nhánh tiếp theo (customer-view-detail).`, 'info');
  };

  const handleEdit = (customer) => {
    showNotification(`Tính năng [Chỉnh sửa thông tin khách hàng ${customer.customerCode || customer.fullName} (UC33)] sẽ được phát triển ở nhánh tiếp theo (customer-edit).`, 'info');
  };

  const handleDelete = (customer) => {
    showNotification(`Tính năng [Xóa khách hàng ${customer.customerCode || customer.fullName} (UC34)] sẽ được phát triển ở nhánh tiếp theo (customer-delete).`, 'warning');
  };

  const handleExport = () => {
    showNotification('Đang tạo báo cáo danh sách khách hàng...', 'info');
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
            backgroundColor: toast.type === 'warning' ? '#b45309' : '#047857',
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
            Danh sách khách hàng, điểm tích lũy, phân hạng thành viên và cảnh báo tiền sử dị ứng thuốc
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
        membershipTier={membershipTier}
        statusFilter={statusFilter}
        onKeywordChange={setKeyword}
        onTierChange={setMembershipTier}
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
    </div>
  );
}

