package com.pharmacy.dto.rfq;

import jakarta.validation.constraints.NotEmpty;
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
public class RecordQuotationRequest {
    private String quotationCode;
    private LocalDate validUntil;
    private String note;

    @NotEmpty(message = "Danh sách mặt hàng báo giá không được để trống")
    private List<ItemQuoteDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemQuoteDto {
        private Long productId;
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private Integer quantity;
        private String note;
    }
}

