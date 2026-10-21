export const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US');
};

export const formatStatus = (status) => {
  return { label: String(status) === '1' ? 'Active' : 'Inactive', variant: 'dark' };
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
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US') + ' VND';
};
