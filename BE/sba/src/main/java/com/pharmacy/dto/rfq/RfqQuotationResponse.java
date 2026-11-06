package com.pharmacy.dto.rfq;

import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.enums.RfqStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Builder
public record RfqQuotationResponse(
                Long rfqId,
                String rfqCode,
                RfqStatus status,
                SupplierResponse supplier,
                PurchaseProposalResponse purchaseProposal,
                SupplierQuotationResponse quotation, // nullable if no response yet
                List<QuotationItemResponse> items) {

        @Builder
        public record SupplierQuotationResponse(
                        Long id,
                        String code,
                        LocalDateTime quotationDate,
                        LocalDateTime validUntil,
                        BigDecimal totalAmount,
                        Short status // 0=pending review, 1=approved, 2=rejected
        ) {
        }

        @Builder
        public record QuotationItemResponse(
                        Long productId,
                        String productName,
                        String productCode,
                        String unit,
                        Integer requestedQuantity,
                        BigDecimal unitPrice,
                        BigDecimal subtotal,
                        String supplierNote) {
        }

        // Trong RfqQuotationResponse.java
        public static RfqQuotationResponse from(Rfq rfq, SupplierQuotation quotation) {
                // Pre-map quantity: ProductId -> RequestedQuantity O(1)
                Map<Long, Integer> reqQtyMap = Collections.emptyMap();
                if (rfq.getPurchaseProposal() != null && rfq.getPurchaseProposal().getDetails() != null) {
                        reqQtyMap = rfq.getPurchaseProposal().getDetails().stream()
                                        .filter(d -> d.getProduct() != null)
                                        .collect(Collectors.toMap(
                                                        d -> d.getProduct().getId(),
                                                        PurchaseProposalDetail::getQuantity,
                                                        (existing, replacement) -> existing));
                }

                List<QuotationItemResponse> items = Collections.emptyList();
                SupplierQuotationResponse quotationResponse = null;

                if (quotation != null) {
                        quotationResponse = SupplierQuotationResponse.builder()
                                        .id(quotation.getId())
                                        .code(quotation.getCode())
                                        .quotationDate(quotation.getCreatedAt())
                                        .validUntil(quotation.getValidUntil() != null
                                                        ? quotation.getValidUntil().atStartOfDay()
                                                        : null)
                                        .totalAmount(quotation.getTotalAmount())
                                        .status(quotation.getStatus())
                                        .build();

                        if (quotation.getDetails() != null) {
                                Map<Long, Integer> finalReqQtyMap = reqQtyMap;
                                items = quotation.getDetails().stream()
                                                .map(d -> {
                                                        Product p = d.getProduct();
                                                        BigDecimal price = d.getUnitPrice() != null ? d.getUnitPrice()
                                                                        : BigDecimal.ZERO;
                                                        int qty = d.getQuantity() != null ? d.getQuantity() : 0;
                                                        return QuotationItemResponse.builder()
                                                                        .productId(p != null ? p.getId() : null)
                                                                        .productName(p != null ? p.getName() : "")
                                                                        .productCode(p != null ? p.getBarcode() : "")
                                                                        .unit(p != null ? p.getUnit() : "")
                                                                        .requestedQuantity(p != null
                                                                                        ? finalReqQtyMap.getOrDefault(
                                                                                                        p.getId(), qty)
                                                                                        : qty)
                                                                        .unitPrice(price)
                                                                        .subtotal(price.multiply(
                                                                                        BigDecimal.valueOf(qty)))
                                                                        .supplierNote(null)
                                                                        .build();
                                                })
                                                .toList();
                        }
                } else if (rfq.getPurchaseProposal() != null && rfq.getPurchaseProposal().getDetails() != null) {
                        // When quotation hasn't arrived yet, show requested items from the proposal
                        items = rfq.getPurchaseProposal().getDetails().stream()
                                        .map(d -> {
                                                Product p = d.getProduct();
                                                int qty = d.getQuantity() != null ? d.getQuantity() : 0;
                                                BigDecimal cost = (p != null && p.getCostPrice() != null) ? p.getCostPrice() : BigDecimal.ZERO;
                                                return QuotationItemResponse.builder()
                                                                .productId(p != null ? p.getId() : null)
                                                                .productName(p != null ? p.getName() : "")
                                                                .productCode(p != null ? p.getBarcode() : "")
                                                                .unit(p != null ? p.getUnit() : "")
                                                                .requestedQuantity(qty)
                                                                .unitPrice(cost)
                                                                .subtotal(cost.multiply(BigDecimal.valueOf(qty)))
                                                                .supplierNote(null)
                                                                .build();
                                        })
                                        .toList();
                }

                return RfqQuotationResponse.builder()
                                .rfqId(rfq.getId())
                                .rfqCode(rfq.getCode())
                                .status(rfq.getStatus())
                                .supplier(SupplierResponse.fromEntityToDetail(rfq.getSupplier()))
                                .purchaseProposal(PurchaseProposalResponse.fromEntity(rfq.getPurchaseProposal()))
                                .quotation(quotationResponse)
                                .items(items)
                                .build();
        }
}