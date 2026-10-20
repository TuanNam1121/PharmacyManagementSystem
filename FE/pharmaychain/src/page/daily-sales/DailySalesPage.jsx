import { useState, useEffect } from "react";
import {
    DollarSign,
    CreditCard,
    QrCode,
    Wallet,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Search,
    Clock,
    FileSpreadsheet,
    Moon,
    Sun,
    ShieldAlert,
    Building2
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/ui/KpiCard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { DataTable } from "../../components/ui/DataTable";
import { Modal } from "../../components/ui/Modal";
import { vnd, date, time, dateTime } from "../../lib/format";
import { DailySalesAPI } from "../../api/DailySalesAPI";
import { useTheme } from "../../lib/useTheme";

export function DailySalesPage() {
    const { dark, toggle } = useTheme();

    // Filter params
    const [storeId] = useState(7);
    const [selectedDate, setSelectedDate] = useState("2026-10-19");

    // Data states
    const [overview, setOverview] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("invoices"); // "invoices" | "shifts"

    // Reconciliation form states (Main Flow Step 3 & AT01, AT02)
    const [actualCashInput, setActualCashInput] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [formError, setFormError] = useState("");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successToast, setSuccessToast] = useState("");

    // Invoice search & filter
    const [searchInvoice, setSearchInvoice] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("ALL");

    // Load data
    const loadData = async () => {
        setLoading(true);
        try {
            const [ov, invs, sfts] = await Promise.all([
                DailySalesAPI.getOverview(storeId, selectedDate),
                DailySalesAPI.getInvoices(storeId, selectedDate),
                DailySalesAPI.getShifts(storeId, selectedDate),
            ]);
            setOverview(ov);
            setInvoices(invs);
            setShifts(sfts);
            setActualCashInput(ov.actualCash != null ? ov.actualCash.toString() : ov.systemCash.toString());
            setNoteInput(ov.note || "");
            setFormError("");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate, storeId]);

    // Real-time calculation of Difference
    const systemCash = overview?.systemCash || 0;
    const parsedActualCash = parseFloat(actualCashInput) || 0;
    const difference = parsedActualCash - systemCash;
    const isDiff = Math.abs(difference) > 0;

    // Validation according to Step 4 & AT01
    const handleOpenConfirm = () => {
        if (isNaN(parsedActualCash) || parsedActualCash < 0) {
            setFormError("Số tiền thực tế kiểm đếm không hợp lệ hoặc đang âm.");
            return;
        }
        if (isDiff && (!noteInput || noteInput.trim() === "")) {
            setFormError("Phát hiện chênh lệch tiền mặt so với hệ thống. Bắt buộc nhập ghi chú giải trình!");
            return;
        }
        setFormError("");
        setConfirmModalOpen(true);
    };

    // Commit transaction according to Step 5 (POS-01, BR-02)
    const handleCommitReconciliation = async () => {
        setSubmitting(true);
        try {
            const updated = await DailySalesAPI.confirmReconcile({
                storeId,
                businessDate: selectedDate,
                actualCash: parsedActualCash,
                note: noteInput.trim(),
            });
            setOverview(updated);
            setConfirmModalOpen(false);
            setSuccessToast("Đã đối soát & chốt doanh thu ngày thành công! Vết kiểm toán đã được ghi nhận.");
            setTimeout(() => setSuccessToast(""), 5000);
        } catch (err) {
            setFormError("Không thể chốt đối soát: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Alternative Flow AT02: User cancels operation
    const handleCancelOperation = () => {
        if (overview) {
            setActualCashInput((overview.actualCash || overview.systemCash).toString());
            setNoteInput(overview.note || "");
            setFormError("");
        }
    };

    // Table Columns for Invoices
    const invoiceColumns = [
        { key: "code", header: "Mã hóa đơn", render: (r) => <span className="font-semibold text-primary-600 dark:text-primary-400">{r.code}</span> },
        { key: "createdAt", header: "Thời gian", render: (r) => time(r.createdAt) },
        {
            key: "prescriptionCode",
            header: "Đơn thuốc Rx",
            render: (r) => r.prescriptionCode ? <Badge tone="rx">{r.prescriptionCode}</Badge> : <span className="text-text-muted">Không kê đơn</span>
        },
        { key: "totalAmount", header: "Tổng tiền", numeric: true, render: (r) => vnd(r.totalAmount) },
        { key: "discount", header: "Giảm giá", numeric: true, render: (r) => r.discount > 0 ? <span className="text-amber-600">-{vnd(r.discount)}</span> : "—" },
        { key: "finalAmount", header: "Thực thu", numeric: true, render: (r) => <span className="font-bold text-text">{vnd(r.finalAmount)}</span> },
        {
            key: "paymentMethod",
            header: "PT Thanh toán",
            render: (r) => (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded bg-bg-subtle border border-border">
                    {r.paymentMethod === "Tiền mặt" && <Wallet size={12} className="text-emerald-600" />}
                    {r.paymentMethod === "Chuyển khoản" && <CreditCard size={12} className="text-sky-600" />}
                    {r.paymentMethod === "VNPay QR" && <QrCode size={12} className="text-red-600" />}
                    {r.paymentMethod}
                </span>
            )
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (r) => <Badge tone={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Đã thanh toán" : "Đã hủy"}</Badge>
        },
    ];

    // Table Columns for Shifts
    const shiftColumns = [
        { key: "id", header: "Mã ca", render: (r) => `#CA-0${r.id}` },
        { key: "cashierUsername", header: "Dược sĩ / Thu ngân", render: (r) => <span className="font-medium">{r.cashierUsername}</span> },
        { key: "openedAt", header: "Bắt đầu", render: (r) => time(r.openedAt) },
        { key: "closedAt", header: "Kết thúc", render: (r) => r.closedAt ? time(r.closedAt) : <Badge tone="info">Đang hoạt động</Badge> },
        { key: "openingCash", header: "Tiền đầu ca", numeric: true, render: (r) => vnd(r.openingCash) },
        { key: "closingCash", header: "Tiền bàn giao", numeric: true, render: (r) => r.closingCash ? vnd(r.closingCash) : "—" },
        {
            key: "difference",
            header: "Lệch két ca",
            numeric: true,
            render: (r) => r.difference === 0 ? (
                <span className="text-green-600 font-medium">0 ₫</span>
            ) : (
                <span className="text-red-600 font-semibold">{vnd(r.difference)}</span>
            )
        },
        { key: "status", header: "Trạng thái", render: (r) => <Badge tone={r.status === 2 ? "success" : "warning"}>{r.status === 2 ? "Đã chốt ca" : "Chưa chốt"}</Badge> },
    ];

    // Filtered invoices
    const filteredInvoices = invoices.filter((inv) => {
        const matchSearch = inv.code.toLowerCase().includes(searchInvoice.toLowerCase()) ||
            (inv.prescriptionCode && inv.prescriptionCode.toLowerCase().includes(searchInvoice.toLowerCase()));
        const matchPay = paymentFilter === "ALL" || inv.paymentMethod === paymentFilter;
        return matchSearch && matchPay;
    });

    return (
        <div className="space-y-6">
            {/* Top Header & Role Indicator */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">Doanh Thu Trong Ngày</h1>
                        
                        {overview?.status === 1 ? (
                            <Badge tone="success" icon={CheckCircle2}>Đã chốt đối soát</Badge>
                        ) : (
                            <Badge tone="warning" icon={AlertTriangle}>Chờ đối soát cuối ngày</Badge>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-text-muted flex items-center gap-2">
                        <Building2 size={16} /> {overview?.storeName || "Đang tải chi nhánh..."} · Ngày kinh doanh: {date(selectedDate)}
                    </p>
                </div>

                {/* Global Controls: Date picker, Refresh, Dark mode toggle */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-1.5 shadow-sm">
                        <span className="text-xs font-semibold text-text-muted uppercase">Ngày:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-text outline-none cursor-pointer"
                        />
                    </div>

                    <Button variant="secondary" size="md" onClick={loadData} title="Tải lại số liệu">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Làm mới
                    </Button>

                    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Đổi theme sáng/tối">
                        {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-text-muted" />}
                    </Button>
                </div>
            </div>

            {/* Success Notification Alert */}
            {successToast && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-300 transition">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium">{successToast}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSuccessToast("")}>Đóng</Button>
                </div>
            )}

            {/* Main Flow Step 2: Display Interface with 4 KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                <KpiCard
                    icon={DollarSign}
                    label="Tổng doanh thu thực tế"
                    value={vnd(overview?.systemTotal)}
                    delta={overview?.growthPercentageVsYesterday}
                />
                <KpiCard
                    icon={Wallet}
                    label="Tiền mặt (POS Drawer)"
                    value={vnd(overview?.systemCash)}
                />
                <KpiCard
                    icon={CreditCard}
                    label="Chuyển khoản ngân hàng"
                    value={vnd(overview?.systemBank)}
                />
                <KpiCard
                    icon={QrCode}
                    label="VNPay / Ví điện tử"
                    value={vnd(overview?.systemVnpay)}
                />
            </div>

            {/* Main Flow Step 3 & 4: Daily Reconciliation Form (Đối soát tiền mặt két) */}
            <Card className="border-primary-100 dark:border-primary-900/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-4 mb-5">
                    <div>
                        <h3 className="font-heading text-lg font-bold text-text flex items-center gap-2">
                            <FileSpreadsheet size={20} className="text-primary-600" />
                            Đối Soát & Chốt Tiền Mặt Cuối Ngày (Daily Reconciliation)
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            Cửa hàng trưởng kiểm đếm tiền mặt tại két và xác nhận đối soát với số liệu bán hàng hệ thống.
                        </p>
                    </div>
                    {overview?.reconciledAt && (
                        <div className="text-xs text-text-muted text-right">
                            Chốt bởi <strong className="text-text">{overview.reconciledByName}</strong> lúc {dateTime(overview.reconciledAt)}
                        </div>
                    )}
                </div>

                {formError && (
                    <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
                        <ShieldAlert size={16} />
                        {formError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Cột 1: Tiền mặt hệ thống */}
                    <div className="p-4 rounded-lg bg-bg-subtle border border-border space-y-1">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Tiền mặt hệ thống ghi nhận</span>
                        <p className="font-heading text-2xl font-bold tabular-nums text-primary-600 dark:text-primary-400">
                            {vnd(systemCash)}
                        </p>
                        <p className="text-xs text-text-muted">Tổng từ {overview?.totalInvoices || 0} hóa đơn & {overview?.totalShifts || 0} ca</p>
                    </div>

                    {/* Cột 2: Tiền mặt thực tế kiểm đếm (Input) */}
                    <div className="space-y-1">
                        <Input
                            label="Tiền mặt thực tế tại két quầy"
                            required
                            type="number"
                            min="0"
                            step="1000"
                            value={actualCashInput}
                            onChange={(e) => setActualCashInput(e.target.value)}
                            placeholder="Nhập số tiền đếm được..."
                        />
                        <span className="text-xs text-text-muted block mt-1">
                            Quy đổi: <strong className="text-text">{vnd(parsedActualCash)}</strong>
                        </span>
                    </div>

                    {/* Cột 3: Trạng thái chênh lệch */}
                    <div className="p-4 rounded-lg border border-border bg-bg-subtle space-y-1">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Chênh lệch két (Difference)</span>
                        <p className={`font-heading text-2xl font-bold tabular-nums ${difference === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {difference > 0 ? `+${vnd(difference)}` : vnd(difference)}
                        </p>
                        <p className="text-xs">
                            {difference === 0 ? (
                                <span className="text-green-600 font-medium">✓ Số liệu khớp tuyệt đối</span>
                            ) : (
                                <span className="text-red-600 font-semibold">⚠ Lệch {vnd(Math.abs(difference))} (Yêu cầu giải trình)</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Ghi chú giải trình nếu có chênh lệch */}
                <div className="mt-4 space-y-1.5">
                    <label className="text-sm font-medium text-text">
                        Ghi chú giải trình {isDiff && <span className="text-red-600 font-bold">* (Bắt buộc khi có lệch tiền)</span>}
                    </label>
                    <textarea
                        rows="2"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Nhập lý do chênh lệch (nếu có), chi phí phát sinh đột xuất hoặc ghi chú bàn giao..."
                        className="w-full rounded-md border border-border bg-surface p-3 text-sm text-text outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-600/25 transition"
                    />
                </div>

                {/* Form Actions (Main Flow Step 3 & Alternative Flow AT02) */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" size="md" onClick={handleCancelOperation}>
                        Hủy bỏ thay đổi (AT02)
                    </Button>
                    <Button variant="primary" size="md" onClick={handleOpenConfirm}>
                        Xác nhận đối soát & Chốt ngày
                    </Button>
                </div>
            </Card>

            {/* Tabs: Chi tiết Hóa đơn bán hàng & Ca làm việc */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("invoices")}
                            className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer ${activeTab === "invoices"
                                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                                    : "border-transparent text-text-muted hover:text-text"
                                }`}
                        >
                            Hóa đơn giao dịch trong ngày ({invoices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("shifts")}
                            className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer ${activeTab === "shifts"
                                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                                    : "border-transparent text-text-muted hover:text-text"
                                }`}
                        >
                            Ca làm việc dược sĩ ({shifts.length})
                        </button>
                    </div>

                    {/* Quick Filters for Invoices */}
                    {activeTab === "invoices" && (
                        <div className="flex items-center gap-3 pb-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Tìm mã hóa đơn / đơn Rx..."
                                    value={searchInvoice}
                                    onChange={(e) => setSearchInvoice(e.target.value)}
                                    className="h-9 w-56 rounded-md border border-border bg-surface pl-8 pr-3 text-xs outline-none focus:border-primary-500"
                                />
                            </div>

                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="h-9 rounded-md border border-border bg-surface px-2.5 text-xs text-text outline-none focus:border-primary-500 cursor-pointer"
                            >
                                <option value="ALL">Mọi phương thức</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="VNPay QR">VNPay QR</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Tab 1: Data Table for Invoices */}
                {activeTab === "invoices" && (
                    <DataTable
                        columns={invoiceColumns}
                        rows={filteredInvoices}
                        loading={loading}
                        empty="Không tìm thấy hóa đơn nào trong ngày kinh doanh này."
                    />
                )}

                {/* Tab 2: Data Table for Shifts */}
                {activeTab === "shifts" && (
                    <DataTable
                        columns={shiftColumns}
                        rows={shifts}
                        loading={loading}
                        empty="Chưa có dữ liệu ca làm việc được ghi nhận."
                    />
                )}
            </div>

            {/* Confirmation Modal (Step 4 & 5: Commit transaction & Record Audit Trail) */}
            <Modal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Xác nhận đối soát & Chốt doanh thu"
                footer={
                    <>
                        <Button variant="ghost" size="md" onClick={() => setConfirmModalOpen(false)} disabled={submitting}>
                            Quay lại kiểm tra
                        </Button>
                        <Button variant="accent" size="md" onClick={handleCommitReconciliation} disabled={submitting}>
                            {submitting ? "Đang lưu & ghi log..." : "Cam kết & Chốt số liệu"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 text-sm text-text">
                    <p>
                        Bạn đang thực hiện chốt doanh thu ngày <strong>{date(selectedDate)}</strong> cho chi nhánh <strong>{overview?.storeName}</strong>.
                    </p>

                    <div className="rounded-lg bg-bg-subtle border border-border p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Tổng doanh thu hệ thống:</span>
                            <strong className="font-semibold text-text">{vnd(overview?.systemTotal)}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Tiền mặt hệ thống:</span>
                            <span className="font-semibold text-text">{vnd(systemCash)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Tiền mặt thực tế kiểm đếm:</span>
                            <span className="font-semibold text-primary-600">{vnd(parsedActualCash)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-border">
                            <span className="text-text-muted">Chênh lệch:</span>
                            <strong className={difference === 0 ? "text-green-600" : "text-red-600"}>
                                {vnd(difference)}
                            </strong>
                        </div>
                    </div>

                    {noteInput && (
                        <p className="text-xs text-text-muted">
                            Ghi chú: <em className="text-text">"{noteInput}"</em>
                        </p>
                    )}

                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                        <strong>Lưu ý nghiệp vụ (BR-02):</strong> Thao tác này sẽ ghi nhận một bản ghi kiểm toán bất biến (Audit Log) kèm tài khoản Store Manager và thời gian chốt.
                    </div>
                </div>
            </Modal>
        </div>
    );
}