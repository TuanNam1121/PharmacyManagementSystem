package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.ConfirmGoodsReceiptRequest;
import com.pharmacy.dto.inventory.GoodsReceiptDto;
import com.pharmacy.entity.*;
import com.pharmacy.repository.*;
import com.pharmacy.service.GoodsReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.pharmacy.entity.enums.GoodsIssueStatus;
import com.pharmacy.entity.enums.StockRequisitionStatus;

@Service
@RequiredArgsConstructor
public class GoodsReceiptServiceImpl implements GoodsReceiptService {

    private final GoodsIssueRepository goodsIssueRepository;
    private final GoodsIssueDetailRepository goodsIssueDetailRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockRequisitionRepository stockRequisitionRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;

    private static String resolveStatusLabel(Short status) {
        return GoodsIssueStatus.resolveLabel(status);
    }

    private GoodsReceiptDto.DetailDto mapDetail(GoodsIssueDetail d) {
        int qty = d.getQuantity() != null ? d.getQuantity() : 0;
        Integer recQty = d.getReceivedQuantity();
        Integer diff = recQty != null ? (recQty - qty) : null;

        return GoodsReceiptDto.DetailDto.builder()
                .id(d.getId())
                .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                .productUnit(d.getProduct() != null ? d.getProduct().getUnit() : null)
                .barcode(d.getProduct() != null ? d.getProduct().getBarcode() : null)
                .batchId(d.getBatch() != null ? d.getBatch().getId() : null)
                .batchNumber(d.getBatch() != null ? d.getBatch().getBatchNumber() : null)
                .expiryDate(d.getBatch() != null ? d.getBatch().getExpiryDate() : null)
                .manufactureDate(d.getBatch() != null ? d.getBatch().getManufactureDate() : null)
                .quantity(qty)
                .receivedQuantity(recQty)
                .difference(diff)
                .build();
    }

    private GoodsReceiptDto mapGoodsReceipt(GoodsIssue gi, boolean withDetails) {
        GoodsReceiptDto.GoodsReceiptDtoBuilder builder = GoodsReceiptDto.builder()
                .id(gi.getId())
                .code(gi.getCode())
                .stockRequisitionId(gi.getStockRequisition() != null ? gi.getStockRequisition().getId() : null)
                .stockRequisitionCode(gi.getStockRequisition() != null ? gi.getStockRequisition().getCode() : null)
                .fromStoreId(gi.getFromStore() != null ? gi.getFromStore().getId() : null)
                .fromStoreName(gi.getFromStore() != null ? gi.getFromStore().getName() : null)
                .toStoreId(gi.getToStore() != null ? gi.getToStore().getId() : null)
                .toStoreName(gi.getToStore() != null ? gi.getToStore().getName() : null)
                .status(gi.getStatus())
                .statusLabel(resolveStatusLabel(gi.getStatus()))
                .carrier(gi.getCarrier())
                .note(gi.getNote())
                .createdByUsername(gi.getCreatedBy() != null ? gi.getCreatedBy().getUsername() : null)
                .dispatchedByUsername(gi.getDispatchedBy() != null ? gi.getDispatchedBy().getUsername() : null)
                .receivedByUsername(gi.getReceivedBy() != null ? gi.getReceivedBy().getUsername() : null)
                .createdAt(gi.getCreatedAt())
                .dispatchedAt(gi.getDispatchedAt())
                .receivedAt(gi.getReceivedAt());

        List<GoodsIssueDetail> details = goodsIssueDetailRepository.findByGoodsIssueIdWithProductAndBatch(gi.getId());
        int totalQty = 0;
        int totalRecQty = 0;
        for (GoodsIssueDetail d : details) {
            totalQty += (d.getQuantity() != null ? d.getQuantity() : 0);
            if (d.getReceivedQuantity() != null) {
                totalRecQty += d.getReceivedQuantity();
            }
        }
        builder.totalItems(details.size());
        builder.totalQuantity(totalQty);
        builder.totalReceivedQuantity(totalRecQty);

        if (withDetails) {
            builder.details(details.stream().map(this::mapDetail).toList());
        }

        return builder.build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GoodsReceiptDto> getGoodsReceiptList(Long storeId, Short status, String search,
            Pageable pageable) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<GoodsIssue> page = goodsIssueRepository.findAllReceipts(storeId, status, querySearch, pageable);
        List<GoodsReceiptDto> dtoList = page.getContent().stream()
                .map(gi -> mapGoodsReceipt(gi, false))
                .toList();

        return PageResponse.<GoodsReceiptDto>builder()
                .content(dtoList)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GoodsReceiptDto getGoodsReceiptDetail(Long id) {
        GoodsIssue gi = goodsIssueRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Goods receipt not found with ID: " + id));
        return mapGoodsReceipt(gi, true);
    }

    @Override
    @Transactional
    public GoodsReceiptDto confirmGoodsReceipt(Long id, ConfirmGoodsReceiptRequest request, String clientIp) {
        // Step 4: Validate operational inputs against business constraints
        GoodsIssue gi = goodsIssueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goods receipt not found with ID: " + id));

        if (gi.getStatus() != null && (gi.getStatus().equals(GoodsIssueStatus.RECEIVED.getCode())
                || gi.getStatus().equals(GoodsIssueStatus.RECEIVED_DISCREPANCY.getCode()))) {
            throw new IllegalStateException("This receipt has already been confirmed!");
        }
        if (gi.getStatus() != null && gi.getStatus().equals(GoodsIssueStatus.CANCELLED.getCode())) {
            throw new IllegalStateException("This receipt has been cancelled and cannot be confirmed!");
        }

        List<GoodsIssueDetail> details = goodsIssueDetailRepository.findByGoodsIssueIdWithProductAndBatch(gi.getId());
        Map<Long, Integer> inputMap = request.getItems().stream()
                .collect(Collectors.toMap(ConfirmGoodsReceiptRequest.ItemConfirmDto::getDetailId,
                        ConfirmGoodsReceiptRequest.ItemConfirmDto::getReceivedQuantity));

        boolean hasDiscrepancy = false;
        Store destinationStore = gi.getToStore();

        // Step 5: Update details and increment branch inventory
        for (GoodsIssueDetail d : details) {
            Integer recQty = inputMap.getOrDefault(d.getId(), d.getQuantity());
            if (recQty == null || recQty < 0) {
                throw new IllegalArgumentException("Invalid actual received quantity for product: "
                        + (d.getProduct() != null ? d.getProduct().getName() : d.getId()));
            }
            d.setReceivedQuantity(recQty);
            if (!recQty.equals(d.getQuantity())) {
                hasDiscrepancy = true;
            }
            goodsIssueDetailRepository.save(d);

            // Update inventory at destination store
            if (recQty > 0) {
                Inventory inv = inventoryRepository.findByStoreIdAndProductIdAndBatchId(
                        destinationStore.getId(),
                        d.getProduct().getId(),
                        d.getBatch().getId()).orElseGet(() -> {
                            Inventory newInv = new Inventory();
                            newInv.setStore(destinationStore);
                            newInv.setProduct(d.getProduct());
                            newInv.setBatch(d.getBatch());
                            newInv.setQuantity(0);
                            newInv.setVersion(0);
                            newInv.setUpdatedAt(LocalDateTime.now());
                            return newInv;
                        });

                int oldQty = inv.getQuantity() != null ? inv.getQuantity() : 0;
                int newQty = oldQty + recQty;
                inv.setQuantity(newQty);
                inv.setUpdatedAt(LocalDateTime.now());
                inventoryRepository.save(inv);

                // Record stock movement: movement_type = 3 (goods issue in)
                StockMovement sm = new StockMovement();
                sm.setStore(destinationStore);
                sm.setProduct(d.getProduct());
                sm.setBatch(d.getBatch());
                sm.setMovementType((short) 3); // 3: goods issue in
                sm.setQuantityChange(recQty);
                sm.setQuantityAfter(newQty);
                sm.setReferenceType("goods_issues");
                sm.setReferenceId(gi.getId());
                sm.setCreatedAt(LocalDateTime.now());
                sm.setNote("Goods receipt from voucher " + gi.getCode());
                stockMovementRepository.save(sm);
            }
        }

        // Update GoodsIssue status: RECEIVED or RECEIVED_DISCREPANCY
        Short finalStatus = hasDiscrepancy ? GoodsIssueStatus.RECEIVED_DISCREPANCY.getCode() : GoodsIssueStatus.RECEIVED.getCode();
        gi.setStatus(finalStatus);
        gi.setReceivedAt(LocalDateTime.now());
        if (request.getNote() != null && !request.getNote().trim().isEmpty()) {
            gi.setNote(request.getNote().trim());
        }

        Account receiver = null;
        if (request.getReceivedByUsername() != null) {
            receiver = accountRepository.findByUsername(request.getReceivedByUsername()).orElse(null);
        }
        gi.setReceivedBy(receiver);
        goodsIssueRepository.save(gi);

        // Sync StockRequisition status -> RECEIVED
        if (gi.getStockRequisition() != null) {
            StockRequisition sr = gi.getStockRequisition();
            sr.setStatus(StockRequisitionStatus.RECEIVED.getCode());
            sr.setReceivedAt(LocalDateTime.now());
            stockRequisitionRepository.save(sr);
        }

        // Immutable AuditLog
        AuditLog log = new AuditLog();
        log.setAccount(receiver);
        log.setAction((short) 2); // 2: UPDATE / CONFIRM
        log.setEntityName("GoodsIssue_Receipt");
        log.setEntityId(gi.getId());
        log.setOldValue("status=1 (dispatched)");
        log.setNewValue("status=" + finalStatus + ", discrepancy=" + hasDiscrepancy + ", note=" + request.getNote());
        log.setIpAddress(clientIp);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);

        return mapGoodsReceipt(gi, true);
    }
}
