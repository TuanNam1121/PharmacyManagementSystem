package com.pharmacy.service;

import com.pharmacy.dto.procurement.PurchaseOrderActionRequest;
import com.pharmacy.dto.procurement.PurchaseOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {
    Page<PurchaseOrderResponse> getPurchaseOrders(Pageable pageable, String search, Short status);

    PurchaseOrderResponse getPurchaseOrderDetail(Long id);

    PurchaseOrderResponse approvePurchaseOrder(Long id, PurchaseOrderActionRequest request, String clientIp);

    PurchaseOrderResponse rejectPurchaseOrder(Long id, PurchaseOrderActionRequest request, String clientIp);
}
