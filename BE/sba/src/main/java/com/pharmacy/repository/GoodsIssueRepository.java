package com.pharmacy.repository;

import com.pharmacy.entity.GoodsIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, Long> {

    @Query(value = """
            SELECT gi FROM GoodsIssue gi
            JOIN FETCH gi.fromStore fs
            JOIN FETCH gi.toStore ts
            LEFT JOIN FETCH gi.stockRequisition sr
            LEFT JOIN FETCH gi.createdBy cb
            LEFT JOIN FETCH gi.dispatchedBy db
            LEFT JOIN FETCH gi.receivedBy rb
            WHERE (:toStoreId IS NULL OR gi.toStore.id = :toStoreId)
              AND (:status IS NULL OR gi.status = :status)
              AND (:search IS NULL OR LOWER(gi.code) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR (sr IS NOT NULL AND LOWER(sr.code) LIKE LOWER(CONCAT('%', :search, '%')))
                   OR LOWER(gi.carrier) LIKE LOWER(CONCAT('%', :search, '%')))
            """, countQuery = """
            SELECT count(gi) FROM GoodsIssue gi
            LEFT JOIN gi.stockRequisition sr
            WHERE (:toStoreId IS NULL OR gi.toStore.id = :toStoreId)
              AND (:status IS NULL OR gi.status = :status)
              AND (:search IS NULL OR LOWER(gi.code) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR (sr IS NOT NULL AND LOWER(sr.code) LIKE LOWER(CONCAT('%', :search, '%')))
                   OR LOWER(gi.carrier) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<GoodsIssue> findAllReceipts(
            @Param("toStoreId") Long toStoreId,
            @Param("status") Short status,
            @Param("search") String search,
            Pageable pageable);

    @Query("""
            SELECT gi FROM GoodsIssue gi
            JOIN FETCH gi.fromStore fs
            JOIN FETCH gi.toStore ts
            LEFT JOIN FETCH gi.stockRequisition sr
            LEFT JOIN FETCH gi.createdBy cb
            LEFT JOIN FETCH gi.dispatchedBy db
            LEFT JOIN FETCH gi.receivedBy rb
            WHERE gi.id = :id
            """)
    Optional<GoodsIssue> findByIdWithDetails(@Param("id") Long id);
}
