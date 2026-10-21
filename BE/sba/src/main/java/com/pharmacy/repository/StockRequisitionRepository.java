package com.pharmacy.repository;

import com.pharmacy.entity.StockRequisition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockRequisitionRepository extends JpaRepository<StockRequisition, Long> {

        @Query(value = """
                        SELECT r FROM StockRequisition r
                        LEFT JOIN FETCH r.store s
                        LEFT JOIN FETCH r.createdBy cb
                        WHERE (:storeId IS NULL OR s.id = :storeId)
                          AND (:status IS NULL OR r.status = :status)
                          AND (:search IS NULL OR LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%')))
                        """, countQuery = """
                        SELECT count(r) FROM StockRequisition r
                        LEFT JOIN r.store s
                        WHERE (:storeId IS NULL OR s.id = :storeId)
                          AND (:status IS NULL OR r.status = :status)
                          AND (:search IS NULL OR LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%')))
                        """)
        Page<StockRequisition> findAllWithFilter(
                        @Param("storeId") Long storeId,
                        @Param("status") Short status,
                        @Param("search") String search,
                        Pageable pageable);
}
