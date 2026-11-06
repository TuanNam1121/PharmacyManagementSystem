package com.pharmacy.service.impl;

import com.pharmacy.dto.audit.AuditLogDto;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.service.AuditLogService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(String search, Short action, String entityName, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }

            if (entityName != null && !entityName.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("entityName")), entityName.trim().toUpperCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchEntity = cb.like(cb.lower(root.get("entityName")), pattern);
                Predicate searchIp = cb.like(cb.lower(root.get("ipAddress")), pattern);
                Predicate searchOld = cb.like(cb.lower(root.get("oldValue")), pattern);
                Predicate searchNew = cb.like(cb.lower(root.get("newValue")), pattern);
                predicates.add(cb.or(searchEntity, searchIp, searchOld, searchNew));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        return page.map(this::toDto);
    }

    private AuditLogDto toDto(AuditLog log) {
        String username = null;
        String fullName = null;
        String role = null;
        Long accountId = null;

        if (log.getAccount() != null) {
            accountId = log.getAccount().getId();
            username = log.getAccount().getUsername();
            if (log.getAccount().getRole() != null) {
                role = log.getAccount().getRole().getCode();
            }
            if (log.getAccount().getAccountInformation() != null) {
                fullName = log.getAccount().getAccountInformation().getFullName();
            }
        }

        String actionName;
        if (log.getAction() == null) {
            actionName = "UNKNOWN";
        } else {
            actionName = switch (log.getAction()) {
                case 1 -> "LOGIN";
                case 2 -> "UPDATE / APPROVE";
                case 3 -> "AUDIT CHECK";
                case 4 -> "LOGOUT";
                case 5 -> "DELETE";
                default -> "ACTION_" + log.getAction();
            };
        }

        return AuditLogDto.builder()
                .id(log.getId())
                .accountId(accountId)
                .username(username)
                .fullName(fullName)
                .role(role)
                .action(log.getAction())
                .actionName(actionName)
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

