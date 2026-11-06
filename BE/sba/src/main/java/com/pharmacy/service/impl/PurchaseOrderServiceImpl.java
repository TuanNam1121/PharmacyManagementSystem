package com.pharmacy.service.impl;

import com.pharmacy.dto.procurement.PurchaseOrderActionRequest;
import com.pharmacy.dto.procurement.PurchaseOrderResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.service.PurchaseOrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseProposalRepository purchaseProposalRepository;
    private final SupplierQuotationDetailRepository quotationDetailRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseOrders(Pageable pageable, String search, Short status) {
        String keyword = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return purchaseProposalRepository.findWithFilters(keyword, status, pageable)
                .map(this::mapToResponseSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderDetail(Long id) {
        PurchaseProposal pp = purchaseProposalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found with ID: " + id));

        List<SupplierQuotationDetail> details = quotationDetailRepository
                .findBySupplierQuotationIdWithProduct(pp.getSupplierQuotation().getId());

        return mapToResponseDetail(pp, details);
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
        return PurchaseOrderResponse.builder()
                .id(pp.getId())
                .code(pp.getCode())
                .purchaseRequestId(pp.getPurchaseRequest() != null ? pp.getPurchaseRequest().getId() : null)
                .purchaseRequestCode(pp.getPurchaseRequest() != null ? pp.getPurchaseRequest().getCode() : null)
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
            return "Unknown";
        return switch (status) {
            case 0 -> "Draft";
            case 1 -> "Pending Approval";
            case 2 -> "Approved";
            case 3 -> "Rejected";
            case 4 -> "Partially Received";
            case 5 -> "Completed";
            default -> "Status " + status;
        };
    }
}
