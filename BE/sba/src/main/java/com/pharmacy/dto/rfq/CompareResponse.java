package com.pharmacy.dto.rfq;

import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.RfqStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompareResponse {

    private Long purchaseProposalId;
    private String purchaseProposalCode;
    private List<RfqCompareColumn> columns;
    private List<ProductCompareRow> rows;
    private Map<Long, BigDecimal> totals;

    // --- Static Factory Method chính ---
    public static CompareResponse from(PurchaseProposal proposal, List<Rfq> rfqs, List<SupplierQuotation> quotations) {
        Map<Long, SupplierQuotation> quotationByRfqId = quotations.stream()
                .collect(Collectors.toMap(sq -> sq.getRfq().getId(), sq -> sq));

        Map<Long, Map<Long, BigDecimal>> priceLookup = buildPriceLookup(quotations);

        Map<Long, Integer> quantityByProductId = proposal.getDetails().stream()
                .filter(d -> d.getProduct() != null)
                .collect(Collectors.toMap(
                        d -> d.getProduct().getId(),
                        PurchaseProposalDetail::getQuantity,
                        (existing, replacement) -> existing
                ));

        return CompareResponse.builder()
                .purchaseProposalId(proposal.getId())
                .purchaseProposalCode(proposal.getCode())
                .columns(buildColumns(rfqs))
                .rows(buildRows(proposal, rfqs, priceLookup, quantityByProductId))
                .totals(buildTotals(rfqs, quotationByRfqId))
                .build();
    }

    private static Map<Long, Map<Long, BigDecimal>> buildPriceLookup(List<SupplierQuotation> quotations) {
        Map<Long, Map<Long, BigDecimal>> lookup = new HashMap<>();
        for (SupplierQuotation q : quotations) {
            if (q.getDetails() == null) continue;
            Long rfqId = q.getRfq().getId();
            for (SupplierQuotationDetail detail : q.getDetails()) {
                if (detail.getProduct() != null) {
                    lookup.computeIfAbsent(detail.getProduct().getId(), k -> new HashMap<>())
                            .put(rfqId, detail.getUnitPrice());
                }
            }
        }
        return lookup;
    }

    private static List<RfqCompareColumn> buildColumns(List<Rfq> rfqs) {
        return rfqs.stream()
                .map(rfq -> RfqCompareColumn.builder()
                        .rfqId(rfq.getId())
                        .rfqCode(rfq.getCode())
                        .supplier(SupplierResponse.fromEntityToDetail(rfq.getSupplier()))
                        .status(rfq.getStatus())
                        .build())
                .toList();
    }

    private static List<ProductCompareRow> buildRows(
            PurchaseProposal proposal,
            List<Rfq> rfqs,
            Map<Long, Map<Long, BigDecimal>> priceLookup,
            Map<Long, Integer> quantityByProductId) {

        return proposal.getDetails().stream()
                .map(PurchaseProposalDetail::getProduct)
                .filter(Objects::nonNull)
                .distinct()
                .map(product -> {
                    Map<Long, BigDecimal> unitPrices = new HashMap<>();
                    Map<Long, BigDecimal> productPrices = priceLookup.getOrDefault(product.getId(), Collections.emptyMap());

                    for (Rfq rfq : rfqs) {
                        unitPrices.put(rfq.getId(), productPrices.get(rfq.getId()));
                    }

                    return ProductCompareRow.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .productCode(product.getBarcode())
                            .unit(product.getUnit())
                            .requestedQuantity(quantityByProductId.getOrDefault(product.getId(), 0))
                            .unitPrices(unitPrices)
                            .build();
                })
                .toList();
    }

    private static Map<Long, BigDecimal> buildTotals(List<Rfq> rfqs, Map<Long, SupplierQuotation> quotationMap) {
        return rfqs.stream().collect(Collectors.toMap(
                Rfq::getId,
                rfq -> Optional.ofNullable(quotationMap.get(rfq.getId()))
                        .map(SupplierQuotation::getTotalAmount)
                        .orElse(BigDecimal.ZERO)
        ));
    }

    // --- Sub-DTOs giữ nguyên ---
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RfqCompareColumn {
        private Long rfqId;
        private String rfqCode;
        private Object supplier; // Giữ kiểu của SupplierResponse detail
        private RfqStatus status;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductCompareRow {
        private Long productId;
        private String productName;
        private String productCode;
        private String unit;
        private Integer requestedQuantity;
        private Map<Long, BigDecimal> unitPrices;
    }
}