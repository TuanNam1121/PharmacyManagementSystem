package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.InventoryAuditDto;
import com.pharmacy.dto.inventory.InventoryAuditReviewRequest;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.InventoryAudit;
import com.pharmacy.entity.InventoryAuditDetail;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.InventoryAuditDetailRepository;
import com.pharmacy.repository.InventoryAuditRepository;
import com.pharmacy.service.InventoryAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryAuditServiceImpl implements InventoryAuditService {

    private final InventoryAuditRepository auditRepository;
    private final InventoryAuditDetailRepository detailRepository;
    private final AuditLogRepository auditLogRepository;

    // ─── helpers ────────────────────────────────────────────────────────────────

    private static String resolveStatusLabel(Short status) {
        return switch (status == null ? 0 : status.intValue()) {
            case 0 -> "Chờ xét duyệt";
            case 1 -> "Đã xác nhận";
            case 2 -> "Từ chối – Kiểm lại";
            default -> "Không xác định";
        };
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
                .status(a.getStatus())
                .statusLabel(resolveStatusLabel(a.getStatus()))
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

    // ─── UC34 flows ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryAuditDto> getAuditList(Short status, String search, Pageable pageable) {
        Page<InventoryAudit> page = auditRepository.findAllWithFilter(status, search, pageable);
        Page<InventoryAuditDto> mapped = page.map(a -> mapAudit(a, false));
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryAuditDto getAuditDetail(Long auditId) {
        InventoryAudit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu kiểm kê ID: " + auditId));
        return mapAudit(audit, true);
    }

    @Override
    @Transactional
    public InventoryAuditDto reviewAudit(InventoryAuditReviewRequest request, String username, String clientIp) {
        // BR-01: phải có session hợp lệ (username truyền vào từ controller)
        InventoryAudit audit = auditRepository.findById(request.getAuditId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Không tìm thấy phiếu kiểm kê ID: " + request.getAuditId()));

        // AT01: chỉ cho phép xét duyệt phiếu ở trạng thái Chờ (status=0)
        if (audit.getStatus() != null && audit.getStatus() != 0) {
            throw new IllegalStateException("Phiếu kiểm kê này đã được xét duyệt trước đó.");
        }

        String oldValue = String.format("status=%s, reviewNote=%s", audit.getStatus(), audit.getReviewNote());

        // Cập nhật trạng thái
        audit.setStatus(request.getDecision()); // 1=Approved, 2=Rejected
        audit.setReviewNote(request.getReviewNote());
        audit.setReviewedAt(LocalDateTime.now());
        audit = auditRepository.save(audit);

        // BR-02: ghi AuditLog bất biến
        AuditLog log = new AuditLog();
        log.setAction((short) 2); // UPDATE/REVIEW
        log.setEntityName("InventoryAudit");
        log.setEntityId(audit.getId());
        log.setOldValue(oldValue);
        log.setNewValue(String.format("status=%s, reviewNote=%s, reviewedBy=%s",
                audit.getStatus(), audit.getReviewNote(), username));
        log.setIpAddress(clientIp);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);

        return mapAudit(audit, true);
    }
}
