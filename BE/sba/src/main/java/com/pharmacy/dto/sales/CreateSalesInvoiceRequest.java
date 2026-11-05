package com.pharmacy.dto.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSalesInvoiceRequest {
    private Long storeId;
    private Long customerId;
    private Long shiftId;
    private String prescriptionCode;
    private BigDecimal discount;
    private String note;

    @NotEmpty(message = "Danh sách sản phẩm trong hóa đơn không được để trống")
    @Valid
    private List<InvoiceItemRequest> items;

    @Valid
    private ProcessPaymentRequest payment;
}
