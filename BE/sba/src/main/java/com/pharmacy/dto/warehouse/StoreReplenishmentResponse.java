package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreReplenishmentResponse {
    private Long id;
    private String code;
    private Long storeId;
    private String storeName;
    private String createdByUsername;
    private String createdByFullName;
    private String approvedByUsername;
    private Short status; // 0 draft, 1 pending, 2 approved, 3 rejected, 4 dispatched, 5 received, 6 cancelled
    private String statusText;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime receivedAt;
    private List<StoreReplenishmentItemResponse> items;
}
