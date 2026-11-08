package com.pharmacy.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUnitDto {
    private Long id;
    private String unitName;
    private Integer conversionFactor;
    private BigDecimal sellingPrice;
    private Boolean isBaseUnit;
    private String barcode;
}
