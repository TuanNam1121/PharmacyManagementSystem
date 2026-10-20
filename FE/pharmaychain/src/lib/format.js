// Định dạng tiền tệ VND vi-VN
export const vnd = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

// Định dạng số thông thường
export const num = (n) =>
    new Intl.NumberFormat("vi-VN").format(n || 0);

// Định dạng ngày: 19/10/2026
export const date = (d) =>
    d ? new Intl.DateTimeFormat("vi-VN").format(new Date(d)) : "—";

// Định dạng giờ: 14:30
export const time = (d) =>
    d ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "—";

// Định dạng ngày & giờ: 14:30 19/10/2026
export const dateTime = (d) =>
    d ? `${time(d)} ${date(d)}` : "—";