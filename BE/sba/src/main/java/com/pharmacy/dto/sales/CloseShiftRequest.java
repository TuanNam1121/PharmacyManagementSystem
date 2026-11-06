package com.pharmacy.dto.sales;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
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
    @JsonAlias({"shift_id"})
    private Long shiftId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền thực tế phải lớn hơn hoặc bằng 0")
    @JsonAlias({"closingCash", "closing_cash", "closing_cash_actual"})
    private BigDecimal closingCashActual;

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    private String note;
}

