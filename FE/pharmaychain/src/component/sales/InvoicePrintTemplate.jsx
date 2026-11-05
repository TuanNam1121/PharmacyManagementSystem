import React, { useRef } from 'react';
import { money, formatDateTime } from '../../utils/format';

export default function InvoicePrintTemplate({
    isOpen,
    onClose,
    invoice,
}) {
    const printAreaRef = useRef(null);

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="pms-modal-backdrop" style={{ zIndex: 1100 }}>
            <div className="pms-modal" style={{ maxWidth: 460, width: '100%', padding: 0, overflow: 'hidden' }}>
                <div className="pms-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="pms-modal-title" style={{ margin: 0, fontSize: 16 }}>
                        Hóa Đơn Bán Lẻ ({invoice.invoiceCode})
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            type="button"
                            className="btn-pms btn-pms-primary"
                            style={{ fontSize: 12, padding: '4px 10px' }}
                            onClick={handlePrint}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            In Hóa Đơn (Print)
                        </button>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div
                    ref={printAreaRef}
                    className="pms-receipt-print-area"
                    style={{
                        padding: '24px 28px',
                        background: '#fff',
                        fontFamily: "'Courier New', Courier, monospace, sans-serif",
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: '#000',
                        maxHeight: '75vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase' }}>
                            HỆ THỐNG NHÀ THUỐC PHARMACHAIN
                        </div>
                        <div style={{ fontSize: 12 }}>{invoice.storeName || 'Chi nhánh Hà Nội'}</div>
                        <div style={{ fontSize: 11, color: '#444' }}>Hotline: 1900 6868 - CSKH: 024.7300.8888</div>
                        <div style={{ margin: '8px 0', borderBottom: '1px dashed #000' }}></div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>PHIẾU THANH TOÁN BÁN LẺ</div>
                        <div style={{ fontSize: 11 }}>Số HĐ: {invoice.invoiceCode}</div>
                        <div style={{ fontSize: 11 }}>Ngày: {formatDateTime(invoice.createdAt || invoice.paidAt)}</div>
                    </div>

                    {/* Metadata */}
                    <div style={{ marginBottom: 10, fontSize: 11 }}>
                        <div>Thu ngân: <strong>{invoice.cashierName || 'Dược sĩ'}</strong></div>
                        <div>Khách hàng: <strong>{invoice.customerName || 'Khách vãng lai'}</strong></div>
                        {invoice.customerPhone && <div>Điện thoại: {invoice.customerPhone}</div>}
                        {invoice.prescriptionCode && <div>Mã đơn thuốc: <strong>{invoice.prescriptionCode}</strong></div>}
                    </div>

                    <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left', paddingBottom: 4 }}>Tên thuốc</th>
                                <th style={{ textAlign: 'center', width: 35, paddingBottom: 4 }}>SL</th>
                                <th style={{ textAlign: 'right', width: 65, paddingBottom: 4 }}>Đơn giá</th>
                                <th style={{ textAlign: 'right', width: 75, paddingBottom: 4 }}>T.Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td style={{ paddingTop: 4, fontWeight: 600 }}>{item.productName}</td>
                                        <td style={{ textAlign: 'center', paddingTop: 4 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', paddingTop: 4 }}>{money(item.unitPrice)}</td>
                                        <td style={{ textAlign: 'right', paddingTop: 4, fontWeight: 600 }}>{money(item.lineTotal)}</td>
                                    </tr>
                                    {(item.dosageInstruction || item.batchNumber) && (
                                        <tr>
                                            <td colSpan={4} style={{ fontSize: 10, color: '#555', paddingBottom: 4 }}>
                                                {item.batchNumber && `[Lô: ${item.batchNumber}] `}
                                                {item.dosageInstruction && `HDSD: ${item.dosageInstruction}`}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

                    {/* Totals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tổng tiền hàng:</span>
                            <span>{money(invoice.totalAmount)}</span>
                        </div>
                        {Number(invoice.discountAmount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Chiết khấu / Giảm giá:</span>
                                <span>-{money(invoice.discountAmount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
                            <span>TỔNG CỘNG:</span>
                            <span>{money(invoice.finalAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Phương thức:</span>
                            <span>{invoice.paymentMethod || 'Tiền mặt'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tiền khách đưa:</span>
                            <span>{money(invoice.paidAmount || invoice.finalAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tiền thối lại:</span>
                            <span>{money(invoice.changeAmount || 0)}</span>
                        </div>
                        {invoice.earnedPoints > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                                <span>Điểm tích lũy đợt này:</span>
                                <span>+{invoice.earnedPoints} điểm</span>
                            </div>
                        )}
                    </div>

                    <div style={{ borderBottom: '1px dashed #000', margin: '14px 0' }}></div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#333' }}>
                        <div>Thuốc đã mua vui lòng đổi trả trong vòng 48h kèm hóa đơn.</div>
                        <div>Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp.</div>
                        <div style={{ marginTop: 6, fontWeight: 700 }}>CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</div>
                    </div>
                </div>

                <div className="pms-modal-footer" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-pms btn-pms-secondary"
                        onClick={onClose}
                    >
                        Đóng (Close)
                    </button>
                </div>
            </div>
        </div>
    );
}
