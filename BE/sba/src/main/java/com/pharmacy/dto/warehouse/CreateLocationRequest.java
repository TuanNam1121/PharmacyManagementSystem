package com.pharmacy.dto.warehouse;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLocationRequest {
    @NotBlank(message = "Location code is required")
    private String code;
    private String aisle;
    private String shelf;
    private String bin;
}
