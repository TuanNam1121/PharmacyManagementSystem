package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloseShiftRequest {
    @NotNull(message = "Mã ca làm việc không được để trống")
    private Long shiftId;

    @NotNull(message = "Số tiền mặt thực kiểm không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền thực tế phải lớn hơn hoặc bằng 0")
    private BigDecimal closingCashActual;

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    private String note;
}
