package com.pharmacy.service;

import com.pharmacy.dto.sales.CloseShiftRequest;
import com.pharmacy.dto.sales.OpenShiftRequest;
import com.pharmacy.dto.sales.ShiftDetailResponse;
import com.pharmacy.dto.sales.ShiftSummaryResponse;

public interface ShiftService {
    ShiftDetailResponse openShift(OpenShiftRequest request, Long accountId);

    ShiftDetailResponse closeShift(CloseShiftRequest request, Long accountId);

    ShiftDetailResponse getCurrentShift(Long accountId);

    ShiftSummaryResponse getCurrentShiftSummary(Long accountId);
}
