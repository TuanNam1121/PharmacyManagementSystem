# Design System — Pharmacy Chain Management System (PCMS)

> **Phiên bản final** · Stack: **React + Tailwind CSS v4** · Phong cách tham chiếu: CardioCare (ThemeWagon) — y tế, sạch, thoáng, có Light/Dark.
> Mục tiêu: **gần như không viết CSS tay**. Toàn bộ giao diện dựng bằng utility class của Tailwind; file CSS duy nhất chỉ khai báo token (~50 dòng).

---

## 1. Quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Framework | React 18+/19, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Style | Chỉ utility class trong JSX. **Không** CSS module, không styled-components, không `@apply` |
| Token | Khai báo 1 lần trong `app.css` qua `@theme`; component chỉ dùng tên token |
| Theme | Class `dark` trên `<html>`, lưu `localStorage`, mặc định theo hệ điều hành |
| Màu chủ đạo | Xanh y tế `primary` + đỏ `accent` cho CTA + `teal` điểm nhấn phụ |
| Font | Heading: Plus Jakarta Sans · Body: Inter · Số liệu: Inter + `tabular-nums` |
| Icon | `lucide-react` (nét 1.75px) |
| Class helper | `cn()` tự viết (5 dòng), không thêm thư viện |
| Locale | `vi-VN` cho số, tiền, ngày |

---

## 2. Nguyên tắc thiết kế

1. **Sạch & thoáng** — nhiều khoảng trắng, mỗi màn hình một mục tiêu chính.
2. **Đáng tin cậy** — tông xanh y tế, bo góc mềm, số liệu chính xác, rõ ràng.
3. **Mobile-first** — viết class cho mobile trước, mở rộng bằng `md:` `lg:`. POS/kiểm kho chạy tốt trên tablet.
4. **Nhất quán** — một bộ token, một bộ component dùng toàn hệ thống.
5. **Truy cập được** — tương phản ≥ 4.5:1, focus rõ, không dùng màu làm tín hiệu duy nhất.

---

## 3. Cài đặt

### 3.1 Cấu trúc thư mục

```
src/
├─ app.css                  # DUY NHẤT file CSS
├─ lib/
│  ├─ cn.js                 # ghép className
│  ├─ format.js             # tiền, ngày, hạn dùng
│  └─ useTheme.js           # light/dark
└─ components/ui/
   ├─ Button.jsx  Card.jsx  Input.jsx  Badge.jsx
   ├─ KpiCard.jsx DataTable.jsx  Sidebar.jsx  Modal.jsx
```

### 3.2 `index.html` — font + chống nháy theme

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap&subset=vietnamese" rel="stylesheet" />
<script>
  const t = localStorage.getItem("theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches))
    document.documentElement.classList.add("dark");
</script>
```

### 3.3 `app.css` — file CSS duy nhất

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* Token cố định (không đổi theo theme) */
@theme {
  --color-primary-50:  #eef7ff;
  --color-primary-100: #d9edff;
  --color-primary-400: #5b9bf0;
  --color-primary-500: #2b7de9;
  --color-primary-600: #1f63c4;
  --color-primary-700: #194fa0;
  --color-accent-600:  #c9303a;   /* nền nút CTA, trắng trên nền này đạt AA */
  --color-accent-700:  #a82730;
  --color-teal-500:    #14b8a6;

  --font-sans:    "Inter", system-ui, sans-serif;
  --font-heading: "Plus Jakarta Sans", system-ui, sans-serif;

  --radius-sm: 6px;  --radius-md: 10px;
  --radius-lg: 16px; --radius-xl: 24px;

  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-md: 0 6px 16px -4px rgb(15 23 42 / 0.10);
  --shadow-lg: 0 16px 40px -12px rgb(31 99 196 / 0.25);
}

/* Token đổi theo theme → class như bg-surface, text-muted tự đổi màu */
:root {
  --bg: #ffffff;  --bg-subtle: #f8fafc;  --surface: #ffffff;
  --border: #e2e8f0;  --text: #0f172a;  --text-muted: #64748b;
}
.dark {
  --bg: #0f172a;  --bg-subtle: #111c33;  --surface: #16213a;
  --border: #26334f;  --text: #e6ebf5;  --text-muted: #94a3b8;
}
@theme inline {
  --color-bg: var(--bg);           --color-bg-subtle: var(--bg-subtle);
  --color-surface: var(--surface); --color-border: var(--border);
  --color-text: var(--text);       --color-text-muted: var(--text-muted);
}

body { @apply bg-bg text-text font-sans antialiased; }
```

> Dòng `body` là chỗ duy nhất dùng `@apply`. Nếu muốn 0 `@apply`, đặt `className="bg-bg text-text font-sans antialiased"` lên thẻ `<body>`.

### 3.4 Helper

```js
// lib/cn.js
export const cn = (...c) => c.filter(Boolean).join(" ");
```

```js
// lib/format.js
export const vnd  = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
export const num  = (n) => new Intl.NumberFormat("vi-VN").format(n);
export const date = (d) => new Intl.DateTimeFormat("vi-VN").format(new Date(d));   // 19/10/2026

// Trạng thái hạn dùng → dùng cho <Badge tone=...>
export function expiryStatus(expiry) {
  const days = Math.ceil((new Date(expiry) - Date.now()) / 864e5);
  if (days <= 0)  return { tone: "danger",  label: "Hết hạn" };
  if (days < 90)  return { tone: "warning", label: `Còn ${days} ngày` };
  return { tone: "success", label: "Còn hạn" };
}
```

```js
// lib/useTheme.js
import { useEffect, useState } from "react";
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}
```

---

## 4. Token

### 4.1 Màu thương hiệu

| Token (class) | Light | Dark | Dùng cho |
|---|---|---|---|
| `primary-50` | `#EEF7FF` | dùng `primary-600/15` | Hover hàng bảng, mục sidebar đang chọn |
| `primary-100` | `#D9EDFF` | dùng `primary-600/25` | Nền icon tròn, chip |
| `primary-400` | `#5B9BF0` | — | Link / icon chính trong dark mode |
| `primary-500` | `#2B7DE9` | — | Focus ring, link light mode |
| `primary-600` | `#1F63C4` | giữ nguyên | **Nút chính**, tiêu đề nhấn |
| `primary-700` | `#194FA0` | giữ nguyên | Hover nút chính |
| `accent-600` | `#C9303A` | giữ nguyên | CTA nổi bật (Đặt hàng) |
| `teal-500` | `#14B8A6` | — | Biểu đồ, điểm nhấn phụ |

### 4.2 Nền / chữ / viền (tự đổi theo theme)

| Class | Light | Dark |
|---|---|---|
| `bg-bg` | `#FFFFFF` | `#0F172A` |
| `bg-bg-subtle` | `#F8FAFC` | `#111C33` |
| `bg-surface` (card) | `#FFFFFF` | `#16213A` |
| `border-border` | `#E2E8F0` | `#26334F` |
| `text-text` | `#0F172A` | `#E6EBF5` |
| `text-text-muted` | `#64748B` | `#94A3B8` |

### 4.3 Trạng thái nghiệp vụ (dùng palette có sẵn của Tailwind, không khai báo thêm)

| Ý nghĩa PCMS | Tone | Màu Tailwind |
|---|---|---|
| Còn hàng · Hoàn tất · Đã thanh toán | `success` | `green` |
| **Sắp hết hạn (< 90 ngày)** · Tồn thấp | `warning` | `amber` |
| **Hết hạn** · Hết hàng · Thu hồi · Lỗi | `danger` | `red` |
| Đang xử lý · Chờ duyệt | `info` | `sky` |
| Thuốc kê đơn (Rx) | `rx` | `violet` |

> Luôn kèm **icon + nhãn chữ**, không chỉ dùng màu.

### 4.4 Typography (class Tailwind)

| Vai trò | Class | Ghi chú |
|---|---|---|
| Display (hero công khai) | `font-heading text-5xl lg:text-6xl font-extrabold leading-tight` | |
| H1 — tiêu đề trang | `font-heading text-4xl font-bold leading-tight` | 36px |
| H2 — section | `font-heading text-3xl font-bold` | 30px |
| H3 — tiêu đề card | `font-heading text-xl font-semibold` | 20px |
| H4 — nhóm field | `font-heading text-lg font-semibold` | 18px |
| Body | `text-base` | 16px |
| Small — label, bảng | `text-sm font-medium` | 14px |
| XS — badge, helper | `text-xs font-semibold` | 12px |
| Số liệu | thêm `tabular-nums` | Căn phải trong bảng |

### 4.5 Spacing · Radius · Shadow

| Mục | Quy ước |
|---|---|
| Spacing | Thang 4px của Tailwind (`1 2 3 4 6 8 12 16 24`) |
| Trang quản trị | `p-4 md:p-6` · khoảng cách giữa khối `gap-6` |
| Section công khai | `py-16 md:py-24` |
| `rounded-sm` 6px | Badge nhỏ |
| `rounded-md` 10px | Nút, input |
| `rounded-lg` 16px | Card |
| `rounded-xl` 24px | Modal, hero image |
| `rounded-full` | Avatar, pill |
| `shadow-sm` | Card mặc định |
| `shadow-lg` | Hover card tương tác |

Dark mode: ít shadow, dựa vào `border-border`.

---

## 5. Layout

- Trang công khai: `mx-auto max-w-7xl px-4 md:px-6`
- Trang quản trị: sidebar `w-64` (thu gọn `w-[72px]`) + vùng nội dung `flex-1`
- Grid: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6`
- Breakpoint mặc định Tailwind: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`

Khung trang quản trị:

```jsx
<div className="flex min-h-screen bg-bg-subtle">
  <Sidebar />
  <main className="flex-1 p-4 md:p-6">
    <div className="mx-auto max-w-7xl space-y-6">{/* nội dung */}</div>
  </main>
</div>
```

---

## 6. Component

> Mẫu code dưới đây là **chuẩn**. Màn hình mới chỉ ghép các component này, không tự chế style.

### 6.1 Button

```jsx
// components/ui/Button.jsx
import { cn } from "../../lib/cn";

const variants = {
  primary:   "bg-primary-600 text-white hover:bg-primary-700",
  accent:    "bg-accent-600 text-white hover:bg-accent-700",
  secondary: "border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-600/15",
  ghost:     "text-text hover:bg-primary-50 dark:hover:bg-primary-600/15",
  danger:    "bg-red-600 text-white hover:bg-red-700",
};
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-5 text-sm", lg: "h-12 px-6 text-base" };

export function Button({ variant = "primary", size = "md", className, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant], sizes[size], className
      )}
      {...props}
    />
  );
}
```

Quy tắc: mỗi màn hình chỉ **1** nút `primary` (hoặc `accent`) làm hành động chính. Trên POS/cảm ứng dùng `size="lg"`.

### 6.2 Card

```jsx
// components/ui/Card.jsx
import { cn } from "../../lib/cn";

export function Card({ interactive, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-6 shadow-sm",
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    />
  );
}
```

Cấu trúc nội dung: icon/ảnh → `h3` → mô tả `text-text-muted` → link/nút.

### 6.3 Input (form field)

```jsx
// components/ui/Input.jsx
import { useId } from "react";
import { cn } from "../../lib/cn";

export function Input({ label, hint, error, required, className, ...props }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn(
          "h-11 w-full rounded-md border bg-surface px-3 text-base outline-none transition",
          "focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-600/25",
          error ? "border-red-600" : "border-border",
          className
        )}
        {...props}
      />
      {error
        ? <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        : hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
```

Form dài (nhập hàng, tạo đơn): chia nhóm bằng `h4` + `border-t border-border pt-6`.

### 6.4 Badge trạng thái

```jsx
// components/ui/Badge.jsx
import { cn } from "../../lib/cn";

const tones = {
  success: "bg-green-100  text-green-800  dark:bg-green-500/15  dark:text-green-300",
  warning: "bg-amber-100  text-amber-800  dark:bg-amber-500/15  dark:text-amber-300",
  danger:  "bg-red-100    text-red-800    dark:bg-red-500/15    dark:text-red-300",
  info:    "bg-sky-100    text-sky-800    dark:bg-sky-500/15    dark:text-sky-300",
  rx:      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export function Badge({ tone = "info", icon: Icon, className, children }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {Icon ? <Icon size={12} aria-hidden /> : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
```

Dùng kèm `expiryStatus()`:

```jsx
const s = expiryStatus(lot.expiry);
<Badge tone={s.tone}>{s.label}</Badge>
<Badge tone="rx">Thuốc kê đơn</Badge>
```

### 6.5 KPI Card

```jsx
// components/ui/KpiCard.jsx
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../../lib/cn";

export function KpiCard({ icon: Icon, label, value, delta }) {
  const up = delta >= 0;
  return (
    <Card>
      <div className="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-600/25 dark:text-primary-400">
        <Icon size={20} aria-hidden />
      </div>
      <p className="mt-4 font-heading text-4xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
      {delta != null && (
        <p className={cn("mt-3 inline-flex items-center gap-1 text-xs font-semibold",
          up ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(delta)}% so với hôm qua
        </p>
      )}
    </Card>
  );
}
```

KPI chuẩn cho dashboard: **Doanh thu hôm nay · Số đơn · Tồn kho thấp · Thuốc sắp hết hạn**.

### 6.6 DataTable (đặc thù ERP)

```jsx
// components/ui/DataTable.jsx
import { cn } from "../../lib/cn";

/** columns: [{ key, header, numeric?, render?(row) }] */
export function DataTable({ columns, rows, loading, empty = "Không có dữ liệu", compact }) {
  const cell = compact ? "h-10" : "h-12";
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-subtle">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 font-semibold", c.numeric ? "text-right" : "text-left")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              <td colSpan={columns.length} className="px-4 py-3">
                <div className="h-4 animate-pulse rounded bg-bg-subtle" />
              </td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">{empty}</td></tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-primary-50 dark:hover:bg-primary-600/10">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4", cell, c.numeric && "text-right tabular-nums")}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Mọi bảng phải có: tìm kiếm · lọc · phân trang · chọn số dòng/trang · trạng thái **loading (skeleton)** và **rỗng**.

### 6.7 Sidebar quản trị

```jsx
// components/ui/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Boxes, Truck, Pill, BarChart3, Settings } from "lucide-react";
import { cn } from "../../lib/cn";

const nav = [
  { to: "/",         label: "Dashboard",  icon: LayoutDashboard },
  { to: "/pos",      label: "Bán hàng",   icon: ShoppingCart },
  { to: "/kho",      label: "Kho & tồn",  icon: Boxes },
  { to: "/nhap-hang",label: "Nhập hàng",  icon: Truck },
  { to: "/danh-muc", label: "Danh mục thuốc", icon: Pill },
  { to: "/bao-cao",  label: "Báo cáo",    icon: BarChart3 },
  { to: "/he-thong", label: "Hệ thống",   icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-3 lg:block">
      <nav className="space-y-1" aria-label="Điều hướng chính">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) => cn(
              "flex h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-sm font-medium transition",
              isActive
                ? "border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400"
                : "border-transparent text-text-muted hover:bg-bg-subtle hover:text-text"
            )}>
            <Icon size={20} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

Mobile/tablet (< `lg`): ẩn sidebar, mở bằng nút burger dạng drawer (`fixed inset-y-0 left-0 w-64` + overlay `bg-slate-900/50`).

### 6.8 Modal

```jsx
// components/ui/Modal.jsx — dùng <dialog> native: có sẵn Esc + bẫy focus, không cần thư viện
import { useEffect, useRef } from "react";

export function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose}
      className="m-auto w-full max-w-lg rounded-xl bg-surface p-0 text-text shadow-lg backdrop:bg-slate-900/50">
      <div className="space-y-4 p-6">
        <h3 className="font-heading text-xl font-semibold">{title}</h3>
        {children}
      </div>
      {footer && <div className="flex justify-end gap-3 border-t border-border p-4">{footer}</div>}
    </dialog>
  );
}
```

### 6.9 Toast · Accordion · Navbar công khai

| Component | Quy ước |
|---|---|
| Toast | Góc trên phải (`fixed right-4 top-4`), tự ẩn 4–5s (lỗi 8s), có icon trạng thái. Gợi ý thư viện: `sonner` |
| Accordion | Dùng `<details>`/`<summary>` + `group-open:rotate-180` cho mũi tên, tiêu đề `h4`. Không cần JS |
| Navbar công khai | `sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur`; logo trái · menu giữa · CTA + toggle theme phải |
| Footer | Chi nhánh · giờ mở cửa · hotline · số giấy phép kinh doanh dược |

### 6.10 Chuyển hoá từ CardioCare

| CardioCare | PCMS |
|---|---|
| Hero Header | Banner cổng khách hàng / lời chào dashboard |
| Appointment Form | Form đặt thuốc / yêu cầu tư vấn dược sĩ |
| Fun Fact Counters | `KpiCard` |
| Testimonial · Gallery · Blog | Đánh giá · ảnh chi nhánh/sản phẩm · tin sức khoẻ (chỉ cổng công khai) |
| FAQ Accordion | FAQ khách hàng, hướng dẫn nội bộ |
| Newsletter | Đăng ký nhận khuyến mãi |
| Preloader · Back-to-top | Chỉ cổng công khai |

---

## 7. Dark mode

- Class `dark` trên `<html>` (xử lý bằng `useTheme` + script ở `index.html`).
- **Màu nền/chữ/viền luôn dùng token** (`bg-surface`, `text-text-muted`, `border-border`) → tự đổi theme, không cần `dark:`.
- Chỉ viết `dark:` cho màu có sắc (badge, link, nền nhấn) — theo mẫu ở mục 6.
- Không dùng `#000` thuần. Ảnh: thêm `dark:brightness-90`.

Toggle:

```jsx
const { dark, toggle } = useTheme();
<Button variant="ghost" size="sm" onClick={toggle} aria-label="Đổi giao diện sáng/tối">
  {dark ? <Sun size={18} /> : <Moon size={18} />}
</Button>
```

---

## 8. Chuyển động

| Hiệu ứng | Class |
|---|---|
| Hover nút/card | `transition duration-200` |
| Accordion/dropdown | `transition duration-200 ease-in-out` |
| Skeleton | `animate-pulse` |
| Mọi animation không thiết yếu | thêm `motion-reduce:transition-none` / `motion-reduce:animate-none` |

---

## 9. Truy cập (A11y)

- Tương phản chữ ≥ 4.5:1 (chữ lớn/icon ≥ 3:1). Nút accent dùng `accent-600`, **không** dùng đỏ nhạt hơn với chữ trắng.
- Mọi phần tử tương tác có `focus-visible` rõ; dùng được bằng bàn phím.
- Icon-only button bắt buộc có `aria-label`; input bắt buộc có `label` (component `Input` đã xử lý).
- Vùng bấm tối thiểu 40×40px, khuyến nghị 44px trên POS/cảm ứng.
- Trạng thái = màu + icon + chữ.

---

## 10. Quy tắc code (để giữ CSS ở mức tối thiểu)

**Nên**
- Dùng utility class; tái sử dụng bằng **component React**, không bằng CSS.
- Dùng `cn()` để ghép class có điều kiện.
- Dùng token (`bg-surface`, `text-text-muted`, `primary-600`...).
- Dùng palette Tailwind sẵn có cho trạng thái nghiệp vụ.

**Không**
- Không viết file `.css` mới, không `@apply` (trừ dòng `body`), không `style={{...}}` cho màu/khoảng cách.
- Không hard-code hex trong JSX (`bg-[#1F63C4]` ❌ → `bg-primary-600` ✅).
- Không tạo màu/size ngoài thang (`text-[17px]`, `p-[13px]` ❌).
- Không dùng gradient trong bảng dữ liệu. Gradient chỉ cho hero:
  `bg-linear-to-br from-primary-600 to-teal-500`.

---

## 11. Cấu trúc trang

**Cổng công khai:** Trang chủ · Giới thiệu · Danh mục sản phẩm · Chi nhánh · Tin tức · FAQ · Liên hệ · Đặt hàng/Tư vấn.

**Quản trị (ERP):** Dashboard · Bán hàng/POS · Đơn hàng · Kho & tồn · Nhập hàng/NCC · Chuyển kho giữa chi nhánh · Danh mục thuốc (lô, hạn dùng) · Khách hàng · Báo cáo · Người dùng & phân quyền · Cài đặt.

---

## 12. Checklist cho mỗi màn hình mới

- [ ] Chỉ dùng token và component trong tài liệu này
- [ ] Không thêm CSS tay, không hard-code hex
- [ ] Đúng ở Light và Dark mode
- [ ] Responsive: kiểm tra `sm`, `md`, `lg`
- [ ] Đủ 4 trạng thái: loading · rỗng · lỗi · thành công
- [ ] Trạng thái nghiệp vụ dùng `Badge` (icon + chữ); hạn dùng dùng `expiryStatus()`
- [ ] Focus bàn phím rõ, vùng bấm ≥ 40px
- [ ] Tiếng Việt; số/tiền/ngày theo `vi-VN` (`1.250.000 ₫`, `19/10/2026`)

---

## 13. Ghi chú nguồn & bản quyền

Phong cách tham chiếu từ **CardioCare** (ThemeWagon, tác giả K29Solutions). Các giá trị màu, font, kích thước ở tài liệu này là **đặc tả riêng của PCMS**, không sao chép mã nguồn template. Nếu dùng trực tiếp mã nguồn/hình ảnh của template bản miễn phí, cần giữ credit theo giấy phép của ThemeWagon.
