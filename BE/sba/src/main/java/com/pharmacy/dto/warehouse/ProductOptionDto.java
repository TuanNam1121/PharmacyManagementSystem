package com.pharmacy.dto.warehouse;

import com.pharmacy.dto.product.ProductUnitDto;
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
public class ProductOptionDto {
    private Long id;
    private String name;
    private String barcode;
    private String unit;
    private BigDecimal purchasePrice;
    private Long defaultLocationId;
    private String defaultLocationCode;
    private List<ProductUnitDto> units;
}
