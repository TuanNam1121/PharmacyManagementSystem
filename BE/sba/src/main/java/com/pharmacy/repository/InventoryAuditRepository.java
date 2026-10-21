package com.pharmacy.repository;

import com.pharmacy.entity.InventoryAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryAuditRepository extends JpaRepository<InventoryAudit, Long> {

    @Query("""
            SELECT a FROM InventoryAudit a
            WHERE (:status IS NULL OR a.status = :status)
              AND (:search IS NULL OR LOWER(a.code) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<InventoryAudit> findAllWithFilter(
            @Param("status") Short status,
            @Param("search") String search,
            Pageable pageable);
}
