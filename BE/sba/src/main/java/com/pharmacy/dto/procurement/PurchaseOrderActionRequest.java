package com.pharmacy.dto.procurement;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderActionRequest {

    // Username of the General Manager performing this action
    private String actionByUsername;

    // Optional note for approvals, or required justification for rejections (AT01)
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
