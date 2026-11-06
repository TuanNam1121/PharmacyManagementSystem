package com.pharmacy.service;

import com.pharmacy.dto.audit.AuditLogDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    Page<AuditLogDto> getAuditLogs(String search, Short action, String entityName, Pageable pageable);
}

