export const formatDate = (iso) => {
  if (!iso || iso === 'Invalid Date') return '-';
  if (typeof iso === 'string') {
    const trimmed = iso.trim();
    if (!trimmed || trimmed === 'Invalid Date') return '-';
    if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
      return trimmed.split(' ')[0];
    }
  }
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const formatStatus = (status) => {
  const isActive = String(status) === '1' || status === true || status === 'ACTIVE';
  return {
    label: isActive ? 'Hoạt động' : 'Tạm khóa',
    variant: isActive ? 'success' : 'danger',
  };
};

export const formatPaymentMethod = (method) => {
  if (!method) return 'Tiền mặt';
  const m = String(method).toUpperCase().trim();
  if (m === 'CASH') return 'Tiền mặt';
  if (m === 'BANK_TRANSFER' || m === 'TRANSFER' || m === 'BANK') return 'Chuyển khoản / Thẻ';
  if (m === 'VNPAY_QR' || m === 'VIETQR' || m === 'QR') return 'Ví VietQR';
  return method;
};

export const getInitials = (text) => {
  if (!text) return '?';
  return text
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const money = (n) => {
  if (n == null || isNaN(n)) return '0 VND';
  return Number(n).toLocaleString('en-US') + ' VND';
};

export const getLocalDateStr = (date = new Date()) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

