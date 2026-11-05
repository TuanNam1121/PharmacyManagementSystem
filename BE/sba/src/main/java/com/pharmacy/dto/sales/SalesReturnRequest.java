package com.pharmacy.dto.sales;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReturnRequest {
    @NotNull(message = "Mã hóa đơn không được để trống")
    private Long invoiceId;

    @NotNull(message = "Lý do đổi trả không được để trống")
    private String reason;

    private Short refundMethod; // 1 cash, 2 bank transfer

    @NotEmpty(message = "Danh sách mặt hàng trả lại không được để trống")
    private List<ReturnItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemRequest {
        @NotNull(message = "Mã dòng hóa đơn không được để trống")
        private Long salesInvoiceDetailId;

        @NotNull(message = "Số lượng trả lại không được để trống")
        private Integer quantity;
    }
}

