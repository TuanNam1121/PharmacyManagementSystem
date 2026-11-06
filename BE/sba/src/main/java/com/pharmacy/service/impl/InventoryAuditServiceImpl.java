package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.*;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.InventoryAuditStatus;
import com.pharmacy.repository.*;
import com.pharmacy.service.InventoryAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class InventoryAuditServiceImpl implements InventoryAuditService {

    private final InventoryAuditRepository auditRepository;
    private final InventoryAuditDetailRepository detailRepository;
    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private String generateAuditCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 100 + new Random().nextInt(900);
        return "IA-" + timestamp + "-" + rand;
    }

    private Account resolveAccount(String username) {
        if (username == null || username.trim().isEmpty()) {
            return accountRepository.findAll().stream().findFirst().orElse(null);
        }
        return accountRepository.findByUsername(username.trim())
                .orElseGet(() -> accountRepository.findAll().stream().findFirst().orElse(null));
    }

    private InventoryAuditDto.InventoryAuditDetailDto mapDetail(InventoryAuditDetail d) {
        return InventoryAuditDto.InventoryAuditDetailDto.builder()
                .id(d.getId())
                .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                .batchNumber(d.getBatch() != null ? d.getBatch().getBatchNumber() : null)
                .systemQuantity(d.getSystemQuantity())
                .countedQuantity(d.getCountedQuantity())
                .variance(d.getVariance())
                .note(d.getNote())
                .build();
    }

    private InventoryAuditDto mapAudit(InventoryAudit a, boolean withDetails) {
        InventoryAuditDto.InventoryAuditDtoBuilder builder = InventoryAuditDto.builder()
                .id(a.getId())
                .code(a.getCode())
                .storeId(a.getStore() != null ? a.getStore().getId() : null)
                .storeName(a.getStore() != null ? a.getStore().getName() : null)
                .requestedByUsername(a.getRequestedBy() != null ? a.getRequestedBy().getUsername() : null)
                .countedByUsername(a.getCountedBy() != null ? a.getCountedBy().getUsername() : null)
                .reviewedByUsername(a.getReviewedBy() != null ? a.getReviewedBy().getUsername() : null)
                .status(a.getStatus())
                .statusLabel(InventoryAuditStatus.resolveLabel(a.getStatus()))
                .auditDate(a.getAuditDate())
                .reviewNote(a.getReviewNote())
                .createdAt(a.getCreatedAt())
                .reviewedAt(a.getReviewedAt());

        if (withDetails) {
            List<InventoryAuditDetail> details = detailRepository.findByInventoryAuditId(a.getId());
            builder.details(details.stream().map(this::mapDetail).toList());
        }
        return builder.build();
    }

    private void recordAuditLog(String action, Long entityId, String oldValue, String newValue, String clientIp) {
        AuditLog log = new AuditLog();
        log.setAction((short) 2);
        log.setEntityName("InventoryAudit");
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(clientIp);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    // ─── 1. Pharmacist: Request Audit Session ──────────────────────────────────

    @Override
    @Transactional
    public InventoryAuditDto requestAuditSession(CreateAuditRequest request, String username, String clientIp) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Store not found with ID: " + request.getStoreId()));

        Account requester = resolveAccount(username);
        if (requester == null) {
            throw new IllegalStateException("User account not found");
        }

        // Snapshot current branch inventory
        List<Inventory> currentInventories = inventoryRepository.findByStoreId(store.getId());
        if (currentInventories.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot create audit session: No active inventory found in this store branch.");
        }

        InventoryAudit audit = new InventoryAudit();
        audit.setCode(generateAuditCode());
        audit.setStore(store);
        audit.setRequestedBy(requester);
        audit.setStatus(InventoryAuditStatus.REQUESTED.getCode()); // 0: Requested
        audit.setAuditDate(request.getAuditDate());
        audit.setReviewNote(request.getReason());
        audit.setCreatedAt(LocalDateTime.now());
        audit = auditRepository.save(audit);

        // Snapshot items into audit details
        List<InventoryAuditDetail> details = new ArrayList<>();
        for (Inventory inv : currentInventories) {
            InventoryAuditDetail detail = new InventoryAuditDetail();
            detail.setInventoryAudit(audit);
            detail.setProduct(inv.getProduct());
            detail.setBatch(inv.getBatch());
            detail.setSystemQuantity(inv.getQuantity() != null ? inv.getQuantity() : 0);
            detail.setCountedQuantity(null); // Not counted yet!
            detail.setVariance(null);
            details.add(detail);
        }
        detailRepository.saveAll(details);

        recordAuditLog("REQUEST_AUDIT", audit.getId(), "status=NONE",
                "status=REQUESTED, requestedBy=" + username + ", reason=" + request.getReason(), clientIp);

        return mapAudit(audit, true);
    }

    // ─── 2. Store Manager: Approve or Reject Audit Request ─────────────────────

    @Override
    @Transactional
    public InventoryAuditDto approveAuditRequest(ApproveAuditRequest request, String username, String clientIp) {
        InventoryAudit audit = auditRepository.findById(request.getAuditId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory audit not found: " + request.getAuditId()));

        // Must be in status 0 (REQUESTED)
        if (!InventoryAuditStatus.REQUESTED.getCode().equals(audit.getStatus())) {
            throw new IllegalStateException(
                    "Only pending audit requests can be approved/rejected. Current status: " + audit.getStatus());
        }

        Account reviewer = resolveAccount(username);
        audit.setReviewedBy(reviewer);

        Short decision = request.getDecision();
        if (decision.equals(InventoryAuditStatus.APPROVED_TO_COUNT.getCode())) {
            // Approved -> Status 1: Pharmacist is now permitted to count!
            audit.setStatus(InventoryAuditStatus.APPROVED_TO_COUNT.getCode());
        } else if (decision.equals(InventoryAuditStatus.REJECTED.getCode())) {
            // Rejected request -> Status 4
            audit.setStatus(InventoryAuditStatus.REJECTED.getCode());
        } else {
            throw new IllegalArgumentException("Invalid decision code. Expected 1 (Approve) or 4 (Reject)");
        }

        if (request.getNote() != null && !request.getNote().trim().isEmpty()) {
            audit.setReviewNote(request.getNote());
        }
        audit.setReviewedAt(LocalDateTime.now());
        audit = auditRepository.save(audit);

        recordAuditLog("APPROVE_AUDIT_REQUEST", audit.getId(), "status=REQUESTED",
                "status=" + audit.getStatus() + ", reviewedBy=" + username + ", note=" + request.getNote(), clientIp);

        return mapAudit(audit, true);
    }

    // ─── 3. Pharmacist: Enter Counts & Submit ──────────────────────────────────

    @Override
    @Transactional
    public InventoryAuditDto submitAuditCount(SubmitAuditCountRequest request, String username, String clientIp) {
        InventoryAudit audit = auditRepository.findById(request.getAuditId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory audit not found: " + request.getAuditId()));

        // CRITICAL CHECK: Manager MUST have approved the session first!
        if (!InventoryAuditStatus.APPROVED_TO_COUNT.getCode().equals(audit.getStatus())) {
            throw new IllegalStateException(
                    "Inventory counting cannot proceed until the Store Manager approves the audit request.");
        }

        Account counter = resolveAccount(username);
        audit.setCountedBy(counter);

        // Update counted quantities and calculate variance
        for (SubmitAuditCountRequest.ItemCount item : request.getItems()) {
            InventoryAuditDetail detail = detailRepository.findById(item.getDetailId())
                    .orElseThrow(() -> new IllegalArgumentException("Audit detail not found: " + item.getDetailId()));

            detail.setCountedQuantity(item.getCountedQuantity());
            detail.setVariance(item.getCountedQuantity() - detail.getSystemQuantity());
            if (item.getNote() != null) {
                detail.setNote(item.getNote());
            }
            detailRepository.save(detail);
        }

        // Change status to SUBMITTED_FOR_REVIEW (Status 2)
        audit.setStatus(InventoryAuditStatus.SUBMITTED_FOR_REVIEW.getCode());
        audit = auditRepository.save(audit);

        recordAuditLog("SUBMIT_COUNT", audit.getId(), "status=APPROVED_TO_COUNT",
                "status=SUBMITTED_FOR_REVIEW, countedBy=" + username, clientIp);

        return mapAudit(audit, true);
    }

    // ─── 4. Store Manager: Final Review & Reconcile ───────────────────────────

    @Override
    @Transactional
    public InventoryAuditDto reviewAudit(InventoryAuditReviewRequest request, String username, String clientIp) {
        InventoryAudit audit = auditRepository.findById(request.getAuditId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory audit not found: " + request.getAuditId()));

        // Can only review once counts are submitted (Status 2)
        if (!InventoryAuditStatus.SUBMITTED_FOR_REVIEW.getCode().equals(audit.getStatus())) {
            throw new IllegalStateException(
                    "Cannot perform final review until count results are submitted. Current status: "
                            + audit.getStatus());
        }

        Account reviewer = resolveAccount(username);
        audit.setReviewedBy(reviewer);
        audit.setStatus(request.getDecision()); // 3=Confirmed/Reconciled, 4=Rejected/Recount
        audit.setReviewNote(request.getReviewNote());
        audit.setReviewedAt(LocalDateTime.now());
        audit = auditRepository.save(audit);

        recordAuditLog("FINAL_REVIEW", audit.getId(), "status=SUBMITTED_FOR_REVIEW",
                "status=" + audit.getStatus() + ", reviewedBy=" + username + ", reviewNote=" + request.getReviewNote(),
                clientIp);

        return mapAudit(audit, true);
    }

    // ─── Query methods ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryAuditDto> getAuditList(Long storeId, Short status, String search, Pageable pageable) {
        Page<InventoryAudit> page = auditRepository.findAllWithFilter(status, search, pageable);
        return PageResponse.from(page.map(a -> mapAudit(a, false)));
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryAuditDto getAuditDetail(Long auditId) {
        InventoryAudit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory audit not found: " + auditId));
        return mapAudit(audit, true);
    }
}
