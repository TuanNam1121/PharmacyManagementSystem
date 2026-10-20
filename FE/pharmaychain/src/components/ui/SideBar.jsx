import { LayoutDashboard, ShoppingCart, Boxes, Truck, Pill, BarChart3, Settings } from "lucide-react";
import { cn } from "../../lib/cn";

const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "#" },
    { id: "pos", label: "Bán hàng", icon: ShoppingCart, href: "#" },
    { id: "kho", label: "Kho & tồn", icon: Boxes, href: "#" },
    { id: "nhap-hang", label: "Nhập hàng", icon: Truck, href: "#" },
    { id: "danh-muc", label: "Danh mục thuốc", icon: Pill, href: "#" },
    { id: "bao-cao", label: "Doanh thu ngày", icon: BarChart3, href: "#", active: true },
    { id: "he-thong", label: "Hệ thống", icon: Settings, href: "#" },
];

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-3 lg:block min-h-screen">
            <div className="flex items-center gap-2 px-3 py-4 border-b border-border mb-3">
                <div className="size-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">P</div>
                <div>
                    <h2 className="font-heading font-bold text-base text-primary-600 leading-tight">PCMS Pharma</h2>
                    <p className="text-xs text-text-muted">Hệ thống chuỗi nhà thuốc</p>
                </div>
            </div>
            <nav className="space-y-1" aria-label="Điều hướng chính">
                {nav.map(({ id, label, icon: Icon, active }) => (
                    <a
                        key={id}
                        href="#"
                        className={cn(
                            "flex h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-sm font-medium transition",
                            active
                                ? "border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400 font-semibold"
                                : "border-transparent text-text-muted hover:bg-bg-subtle hover:text-text"
                        )}
                    >
                        <Icon size={20} aria-hidden /> {label}
                    </a>
                ))}
            </nav>
        </aside>
    );
}