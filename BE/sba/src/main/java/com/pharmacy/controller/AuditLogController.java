package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.audit.AuditLogDto;
import com.pharmacy.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/audit-logs")
@CrossOrigin(origins = "*")
@Tag(name = "Audit Log Management", description = "APIs for querying system and security audit logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get paginated audit logs with search and filters")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short action,
            @RequestParam(required = false) String entityName,
            @PageableDefault(page = 0, size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AuditLogDto> page = auditLogService.getAuditLogs(search, action, entityName, pageable);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", PageResponse.from(page)));
    }
}

