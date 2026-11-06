package com.pharmacy.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {
    private Long id;
    private String code;
    private String name;
    private Short type;
    private String typeName;
    private String address;
    private String phone;
    private Short status;
}

