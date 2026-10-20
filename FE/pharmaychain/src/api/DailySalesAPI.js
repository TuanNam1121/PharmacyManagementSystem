const BASE_URL = "http://localhost:8080/api/daily-sales";

// Mock data chuẩn xác theo Entity BE phòng trường hợp BE chưa chạy
const MOCK_DATA = {
    storeId: 1,
    storeName: "Nhà thuốc Chi nhánh Quận 1",
    storeCode: "ST-Q1-01",
    businessDate: "2026-10-19",
    systemCash: 14500000,
    systemBank: 15200000,
    systemVnpay: 8750000,
    systemTotal: 38450000,
    actualCash: 14500000,
    difference: 0,
    status: 0, // 0: Chờ đối soát
    note: "",
    reconciledByName: null,
    reconciledAt: null,
    totalInvoices: 86,
    totalShifts: 2,
    growthPercentageVsYesterday: 12.5,
};

const MOCK_INVOICES = [
    { id: 101, code: "HD-20261019-001", prescriptionCode: "RX-49102", totalAmount: 480000, discount: 0, finalAmount: 480000, status: 1, createdAt: "2026-10-19T08:15:00", paymentMethod: "Tiền mặt" },
    { id: 102, code: "HD-20261019-002", prescriptionCode: null, totalAmount: 1250000, discount: 50000, finalAmount: 1200000, status: 1, createdAt: "2026-10-19T09:20:00", paymentMethod: "Chuyển khoản" },
    { id: 103, code: "HD-20261019-003", prescriptionCode: "RX-49115", totalAmount: 2350000, discount: 100000, finalAmount: 2250000, status: 1, createdAt: "2026-10-19T10:45:00", paymentMethod: "VNPay QR" },
    { id: 104, code: "HD-20261019-004", prescriptionCode: null, totalAmount: 180000, discount: 0, finalAmount: 180000, status: 1, createdAt: "2026-10-19T11:30:00", paymentMethod: "Tiền mặt" },
    { id: 105, code: "HD-20261019-005", prescriptionCode: null, totalAmount: 640000, discount: 20000, finalAmount: 620000, status: 1, createdAt: "2026-10-19T13:10:00", paymentMethod: "Tiền mặt" },
    { id: 106, code: "HD-20261019-006", prescriptionCode: "RX-49180", totalAmount: 3400000, discount: 150000, finalAmount: 3250000, status: 1, createdAt: "2026-10-19T14:40:00", paymentMethod: "Chuyển khoản" },
    { id: 107, code: "HD-20261019-007", prescriptionCode: null, totalAmount: 95000, discount: 0, finalAmount: 95000, status: 1, createdAt: "2026-10-19T15:25:00", paymentMethod: "VNPay QR" },
];

const MOCK_SHIFTS = [
    { id: 1, cashierUsername: "pharmacist_lan", openedAt: "2026-10-19T07:00:00", closedAt: "2026-10-19T14:30:00", openingCash: 2000000, closingCash: 8500000, expectedCash: 8500000, difference: 0, status: 2, note: "Ca sáng kết thúc bình thường" },
    { id: 2, cashierUsername: "pharmacist_minh", openedAt: "2026-10-19T14:30:00", closedAt: null, openingCash: 8500000, closingCash: 14500000, expectedCash: 14500000, difference: 0, status: 1, note: "Ca chiều đang vận hành" },
];

export const DailySalesAPI = {
    async getOverview(storeId = 1, date = "2026-10-19") {
        try {
            const res = await fetch(`${BASE_URL}/overview?storeId=${storeId}&date=${date}`);
            if (!res.ok) throw new Error("Network error");
            const json = await res.json();
            return json.data;
        } catch {
            // Fallback to mock data
            return { ...MOCK_DATA, businessDate: date };
        }
    },

    async getInvoices(storeId = 1, date = "2026-10-19") {
        try {
            const res = await fetch(`${BASE_URL}/invoices?storeId=${storeId}&date=${date}`);
            if (!res.ok) throw new Error("Network error");
            const json = await res.json();
            return json.data.content || json.data;
        } catch {
            return MOCK_INVOICES;
        }
    },

    async getShifts(storeId = 1, date = "2026-10-19") {
        try {
            const res = await fetch(`${BASE_URL}/shifts?storeId=${storeId}&date=${date}`);
            if (!res.ok) throw new Error("Network error");
            const json = await res.json();
            return json.data;
        } catch {
            return MOCK_SHIFTS;
        }
    },

    async confirmReconcile(payload) {
        try {
            const res = await fetch(`${BASE_URL}/reconcile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Reconciliation failed");
            const json = await res.json();
            return json.data;
        } catch {
            // Mock result update
            return {
                ...MOCK_DATA,
                actualCash: payload.actualCash,
                difference: payload.actualCash - MOCK_DATA.systemCash,
                note: payload.note,
                status: 1,
                reconciledByName: "Store Manager (Bạn)",
                reconciledAt: new Date().toISOString(),
            };
        }
    },
};