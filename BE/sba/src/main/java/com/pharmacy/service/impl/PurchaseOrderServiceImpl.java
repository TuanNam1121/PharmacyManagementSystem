package com.pharmacy.service.impl;

import com.pharmacy.dto.procurement.PurchaseOrderActionRequest;
import com.pharmacy.dto.procurement.PurchaseOrderResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.service.PurchaseOrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseProposalRepository purchaseProposalRepository;
    private final SupplierQuotationDetailRepository quotationDetailRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseOrders(Pageable pageable, String search, Short status) {
        String keyword = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<PurchaseOrderResponse> page = purchaseProposalRepository.findWithFilters(keyword, status, pageable)
                .map(this::mapToResponseSummary);

        // Danh sách phải hiển thị cùng con số với màn chi tiết, không dùng
        // total_amount lưu sẵn (vốn có thể đã cũ so với báo giá đã chốt).
        applyDerivedTotals(page.getContent());

        return page;
    }

    /**
     * Suy tổng tiền cho danh sách PO theo đúng công thức của màn chi tiết:
     * - Có báo giá   -> Σ supplier_quotation_details.subtotal
     * - Chưa có báo giá -> Σ (products.cost_price × purchase_proposal_details.quantity)
     * Dùng truy vấn gộp theo lô (2 query cho cả trang) để tránh N+1.
     */
    private void applyDerivedTotals(List<PurchaseOrderResponse> rows) {
        if (rows == null || rows.isEmpty()) {
            return;
        }

        List<Long> quotationIds = rows.stream()
                .map(PurchaseOrderResponse::getSupplierQuotationId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, BigDecimal> quotedTotals = quotationIds.isEmpty()
                ? Collections.emptyMap()
                : quotationDetailRepository.sumSubtotalByQuotationIds(quotationIds).stream()
                        .collect(Collectors.toMap(
                                row -> (Long) row[0],
                                row -> row[1] == null ? BigDecimal.ZERO : new BigDecimal(row[1].toString())));

        List<Long> proposalIdsWithoutQuotation = rows.stream()
                .filter(row -> row.getSupplierQuotationId() == null)
                .map(PurchaseOrderResponse::getId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, BigDecimal> estimatedTotals = new HashMap<>();
        if (!proposalIdsWithoutQuotation.isEmpty()) {
            for (PurchaseProposalDetail detail : purchaseProposalRepository
                    .findDetailsWithProductByProposalIds(proposalIdsWithoutQuotation)) {
                BigDecimal cost = (detail.getProduct() != null && detail.getProduct().getCostPrice() != null)
                        ? detail.getProduct().getCostPrice()
                        : BigDecimal.ZERO;
                int quantity = detail.getQuantity() != null ? detail.getQuantity() : 0;
                estimatedTotals.merge(detail.getPurchaseProposal().getId(),
                        cost.multiply(BigDecimal.valueOf(quantity)), BigDecimal::add);
            }
        }

        for (PurchaseOrderResponse row : rows) {
            if (row.getSupplierQuotationId() != null) {
                row.setTotalAmount(quotedTotals.getOrDefault(row.getSupplierQuotationId(), BigDecimal.ZERO));
            } else if (estimatedTotals.containsKey(row.getId())) {
                row.setTotalAmount(estimatedTotals.get(row.getId()));
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderDetail(Long id) {
        PurchaseProposal pp = purchaseProposalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found with ID: " + id));

        List<SupplierQuotationDetail> details = (pp.getSupplierQuotation() != null)
                ? quotationDetailRepository.findBySupplierQuotationIdWithProduct(pp.getSupplierQuotation().getId())
                : Collections.emptyList();

        PurchaseOrderResponse res = mapToResponseDetail(pp, details);

        // Fallback to proposal details if no supplier quotation is linked yet
        if ((res.getItems() == null || res.getItems().isEmpty()) && pp.getDetails() != null && !pp.getDetails().isEmpty()) {
            List<PurchaseOrderResponse.PurchaseOrderItemDto> items = pp.getDetails().stream()
                    .map(d -> PurchaseOrderResponse.PurchaseOrderItemDto.builder()
                            .id(d.getId())
                            .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                            .productBarcode(d.getProduct() != null ? d.getProduct().getBarcode() : null)
                            .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                            .unit(d.getProduct() != null ? d.getProduct().getUnit() : null)
                            .quantity(d.getQuantity())
                            .unitPrice(d.getProduct() != null && d.getProduct().getCostPrice() != null ? d.getProduct().getCostPrice() : BigDecimal.ZERO)
                            .taxRate(BigDecimal.ZERO)
                            .subtotal(d.getProduct() != null && d.getProduct().getCostPrice() != null
                                    ? d.getProduct().getCostPrice().multiply(BigDecimal.valueOf(d.getQuantity()))
                                    : BigDecimal.ZERO)
                            .build())
                    .collect(Collectors.toList());
            res.setItems(items);
        }

        // Tổng tiền luôn khớp tổng các dòng hàng đang hiển thị
        // (áp dụng cho cả nhánh có báo giá và nhánh dự phòng từ chi tiết đề xuất)
        if (res.getItems() != null) {
            res.setTotalAmount(res.getItems().stream()
                    .map(i -> i.getSubtotal() != null ? i.getSubtotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
        }

        return res;
    }

    @Override
    @Transactional
    public PurchaseOrderResponse approvePurchaseOrder(Long id, PurchaseOrderActionRequest request, String clientIp) {
        PurchaseProposal pp = purchaseProposalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found with ID: " + id));

        // BR-03: Validate state transition
        if (pp.getStatus() != 0 && pp.getStatus() != 1) {
            throw new IllegalStateException(
                    "Only Draft (0) or Pending Approval (1) Purchase Orders can be approved. Current status: "
                            + pp.getStatus());
        }

        // BR-01: Authenticate actor session
        Account approver = resolveActor(request.getActionByUsername());

        Short oldStatus = pp.getStatus();
        pp.setStatus((short) 2); // 2 = Approved
        pp.setApprovedBy(approver);
        pp.setApprovedAt(LocalDateTime.now());
        purchaseProposalRepository.save(pp);

        // Synchronize linked purchase requests to COMPLETED / approved (status 4)
        if (pp.getRequests() != null) {
            for (PurchaseProposalRequest link : pp.getRequests()) {
                PurchaseRequest pr = link.getPurchaseRequest();
                if (pr != null) {
                    pr.setStatus(PurchaseRequestStatus.COMPLETED.getCode());
                    pr.setUpdatedAt(LocalDateTime.now());
                    purchaseRequestRepository.save(pr);
                }
            }
        }

        // BR-02: Write immutable audit log
        AuditLog log = new AuditLog();
        log.setAccount(approver);
        log.setAction((short) 2); // 2 = UPDATE / APPROVE
        log.setEntityName("PurchaseProposal");
        log.setEntityId(pp.getId());
        log.setOldValue("status=" + oldStatus);
        log.setNewValue("status=2 (Approved), approver=" + (approver != null ? approver.getUsername() : "N/A") +
                (request.getReason() != null ? ", note=" + request.getReason().trim() : ""));
        log.setIpAddress(clientIp);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);

        return getPurchaseOrderDetail(id);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse rejectPurchaseOrder(Long id, PurchaseOrderActionRequest request, String clientIp) {
        PurchaseProposal pp = purchaseProposalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found with ID: " + id));

        // BR-03: Validate state transition
        if (pp.getStatus() != 0 && pp.getStatus() != 1) {
            throw new IllegalStateException(
                    "Only Draft (0) or Pending Approval (1) Purchase Orders can be rejected. Current status: "
                            + pp.getStatus());
        }

        // AT01: Validation failure on missing reject reason
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required to reject a Purchase Order.");
        }

        // BR-01: Authenticate actor session
        Account reviewer = resolveActor(request.getActionByUsername());

        Short oldStatus = pp.getStatus();
        pp.setStatus((short) 3); // 3 = Rejected
        pp.setRejectReason(request.getReason().trim());
        pp.setApprovedBy(reviewer);
        pp.setApprovedAt(LocalDateTime.now());
        purchaseProposalRepository.save(pp);

        // BR-02: Write immutable audit log
        AuditLog log = new AuditLog();
        log.setAccount(reviewer);
        log.setAction((short) 2); // 2 = UPDATE / REJECT
        log.setEntityName("PurchaseProposal");
        log.setEntityId(pp.getId());
        log.setOldValue("status=" + oldStatus);
        log.setNewValue("status=3 (Rejected), reason=" + request.getReason().trim());
        log.setIpAddress(clientIp);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);

        return getPurchaseOrderDetail(id);
    }

    private Account resolveActor(String username) {
        if (username != null && !username.trim().isEmpty()) {
            return accountRepository.findByUsername(username.trim())
                    .orElse(null);
        }
        return null;
    }

    private PurchaseOrderResponse mapToResponseSummary(PurchaseProposal pp) {
        com.pharmacy.entity.PurchaseRequest firstPr = (pp.getRequests() != null && !pp.getRequests().isEmpty())
                ? pp.getRequests().get(0).getPurchaseRequest()
                : null;

        return PurchaseOrderResponse.builder()
                .id(pp.getId())
                .code(pp.getCode())
                .purchaseRequestId(firstPr != null ? firstPr.getId() : null)
                .purchaseRequestCode(firstPr != null ? firstPr.getCode() : null)
                .supplierQuotationId(pp.getSupplierQuotation() != null ? pp.getSupplierQuotation().getId() : null)
                .supplierQuotationCode(pp.getSupplierQuotation() != null ? pp.getSupplierQuotation().getCode() : null)
                .supplierId(pp.getSupplierQuotation() != null && pp.getSupplierQuotation().getSupplier() != null
                        ? pp.getSupplierQuotation().getSupplier().getId()
                        : null)
                .supplierCode(pp.getSupplierQuotation() != null && pp.getSupplierQuotation().getSupplier() != null
                        ? pp.getSupplierQuotation().getSupplier().getCode()
                        : null)
                .supplierName(pp.getSupplierQuotation() != null && pp.getSupplierQuotation().getSupplier() != null
                        ? pp.getSupplierQuotation().getSupplier().getName()
                        : null)
                .createdByUsername(pp.getCreatedBy() != null ? pp.getCreatedBy().getUsername() : null)
                .approvedByUsername(pp.getApprovedBy() != null ? pp.getApprovedBy().getUsername() : null)
                .status(pp.getStatus())
                .statusText(getStatusText(pp.getStatus()))
                .rejectReason(pp.getRejectReason())
                .totalAmount(pp.getTotalAmount())
                .createdAt(pp.getCreatedAt())
                .approvedAt(pp.getApprovedAt())
                .items(Collections.emptyList())
                .build();
    }

    private PurchaseOrderResponse mapToResponseDetail(PurchaseProposal pp, List<SupplierQuotationDetail> details) {
        PurchaseOrderResponse res = mapToResponseSummary(pp);

        if (details != null && !details.isEmpty()) {
            List<PurchaseOrderResponse.PurchaseOrderItemDto> items = details.stream()
                    .map(d -> PurchaseOrderResponse.PurchaseOrderItemDto.builder()
                            .id(d.getId())
                            .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                            .productBarcode(d.getProduct() != null ? d.getProduct().getBarcode() : null)
                            .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                            .unit(d.getProduct() != null ? d.getProduct().getUnit() : null)
                            .quantity(d.getQuantity())
                            .unitPrice(d.getUnitPrice())
                            .taxRate(d.getTaxRate())
                            .subtotal(d.getSubtotal())
                            .build())
                    .collect(Collectors.toList());
            res.setItems(items);
        }

        return res;
    }

    private String getStatusText(Short status) {
        if (status == null)
            return "Không xác định";
        return switch (status) {
            case 0 -> "Bản nháp";
            case 1 -> "Chờ phê duyệt";
            case 2 -> "Đã phê duyệt";
            case 3 -> "Đã từ chối";
            case 4 -> "Nhập một phần";
            case 5 -> "Hoàn tất";
            default -> "Trạng thái " + status;
        };
    }
}
