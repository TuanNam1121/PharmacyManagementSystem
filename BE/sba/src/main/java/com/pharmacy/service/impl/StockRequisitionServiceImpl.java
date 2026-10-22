package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import com.pharmacy.entity.StockRequisition;
import com.pharmacy.entity.StockRequisitionDetail;
import com.pharmacy.repository.StockRequisitionDetailRepository;
import com.pharmacy.repository.StockRequisitionRepository;
import com.pharmacy.service.StockRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.entity.enums.StockRequisitionStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockRequisitionServiceImpl implements StockRequisitionService {

    private final StockRequisitionRepository requisitionRepository;
    private final StockRequisitionDetailRepository detailRepository;

    // ─── helpers ────────────────────────────────────────────────────────────────

    private static String resolveStatusLabel(Short status) {
        return StockRequisitionStatus.resolveBranchLabel(status);
    }

    private StockRequisitionDto.DetailDto mapDetail(StockRequisitionDetail d) {
        return StockRequisitionDto.DetailDto.builder()
                .id(d.getId())
                .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                .productUnit(d.getProduct() != null ? d.getProduct().getUnit() : null)
                .barcode(d.getProduct() != null ? d.getProduct().getBarcode() : null)
                .requestedQty(d.getRequestedQty())
                .approvedQty(d.getApprovedQty())
                .receivedQty(d.getReceivedQty())
                .build();
    }

    private StockRequisitionDto mapRequisition(StockRequisition r, boolean withDetails) {
        StockRequisitionDto.StockRequisitionDtoBuilder builder = StockRequisitionDto.builder()
                .id(r.getId())
                .code(r.getCode())
                .storeId(r.getStore() != null ? r.getStore().getId() : null)
                .storeName(r.getStore() != null ? r.getStore().getName() : null)
                .createdByUsername(r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null)
                .approvedByUsername(r.getApprovedBy() != null ? r.getApprovedBy().getUsername() : null)
                .status(r.getStatus())
                .statusLabel(resolveStatusLabel(r.getStatus()))
                .rejectReason(r.getRejectReason())
                .createdAt(r.getCreatedAt())
                .approvedAt(r.getApprovedAt())
                .dispatchedAt(r.getDispatchedAt())
                .receivedAt(r.getReceivedAt());

        if (withDetails) {
            List<StockRequisitionDetail> details = detailRepository.findByStockRequisitionId(r.getId());
            builder.details(details.stream().map(this::mapDetail).toList());
        }
        return builder.build();
    }

    // ─── Stock Requisition flows ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockRequisitionDto> getRequisitionList(Long storeId, Short status, String search,
            Pageable pageable) {
        Page<StockRequisition> page = requisitionRepository.findAllWithFilter(storeId, status, search, pageable);
        Page<StockRequisitionDto> mapped = page.map(r -> mapRequisition(r, false));
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public StockRequisitionDto getRequisitionDetail(Long requisitionId) {
        StockRequisition r = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new IllegalArgumentException("Stock requisition not found with ID: " + requisitionId));
        return mapRequisition(r, true);
    }
}
