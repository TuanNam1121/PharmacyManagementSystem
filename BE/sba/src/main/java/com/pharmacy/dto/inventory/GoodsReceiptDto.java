package com.pharmacy.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptDto {
    private Long id;
    private String code;

    // Liên kết Requisition
    private Long stockRequisitionId;
    private String stockRequisitionCode;

    // Kho gửi & nhận
    private Long fromStoreId;
    private String fromStoreName;
    private Long toStoreId;
    private String toStoreName;

    // Trạng thái & Vận chuyển
    private Short status;
    private String statusLabel;
    private String carrier;
    private String note;

    // Nhân sự & Thời gian
    private String createdByUsername;
    private String dispatchedByUsername;
    private String receivedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime receivedAt;

    // Tổng quan số lượng
    private Integer totalItems;
    private Integer totalQuantity;
    private Integer totalReceivedQuantity;

    // Danh sách dòng sản phẩm chi tiết
    private List<DetailDto> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailDto {
        private Long id;
        private Long productId;
        private String productName;
        private String productUnit;
        private String barcode;

        private Long batchId;
        private String batchNumber;
        private LocalDate expiryDate;
        private LocalDate manufactureDate;

        private Integer quantity; // SL xuất từ kho tổng
        private Integer receivedQuantity; // SL chi nhánh thực nhận
        private Integer difference; // Chênh lệch (received - quantity)
    }
}
