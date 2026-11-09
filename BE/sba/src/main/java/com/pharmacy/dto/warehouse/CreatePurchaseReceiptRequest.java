package com.pharmacy.dto.warehouse;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseReceiptRequest {
    private Long purchaseProposalId;

    private Long supplierId;

    private Long storeId;
    private String note;
    private Short deliveryType; // 1 full, 2 partial
    private Boolean autoConfirm; // true: Xác nhận nhập kho và tăng tồn ngay

    @NotEmpty(message = "Receipt items list cannot be empty")
    private List<CreatePurchaseReceiptItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePurchaseReceiptItem {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        @NotNull(message = "Unit cost is required")
        private BigDecimal unitCost;

        @NotNull(message = "Batch number is required")
        private String batchNumber;

        private LocalDate manufactureDate;

        @NotNull(message = "Expiry date is required")
        private LocalDate expiryDate;

        private Long locationId;

        private Long unitId;
        private String unitName;
        private Integer conversionFactor;
    }
}
