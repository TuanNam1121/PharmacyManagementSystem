package com.pharmacy.repository;

import com.pharmacy.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("SELECT m FROM StockMovement m " +
            "JOIN FETCH m.product p " +
            "JOIN FETCH m.batch b " +
            "JOIN FETCH m.store s " +
            "LEFT JOIN FETCH m.createdBy a " +
            "WHERE (:storeId IS NULL OR m.store.id = :storeId) " +
            "AND m.createdAt >= :startDate " +
            "AND m.createdAt <= :endDate " +
            "ORDER BY m.createdAt DESC")
    List<StockMovement> findMovementsForReport(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
