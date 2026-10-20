package com.pharmacy.repository;

import com.pharmacy.entity.InventoryAuditDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryAuditDetailRepository extends JpaRepository<InventoryAuditDetail, Long> {
    List<InventoryAuditDetail> findByInventoryAuditId(Long auditId);
}
