package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseLocationResponse {
    private Long id;
    private String code;
    private String aisle;
    private String shelf;
    private String bin;
    private Short status;
}
