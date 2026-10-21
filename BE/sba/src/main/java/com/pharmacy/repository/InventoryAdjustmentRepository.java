package com.pharmacy.repository;

import com.pharmacy.entity.InventoryAdjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Long> {

    @Query(value = "SELECT ia FROM InventoryAdjustment ia " +
           "JOIN FETCH ia.product p " +
           "JOIN FETCH ia.batch b " +
           "JOIN FETCH ia.store s " +
           "JOIN FETCH ia.createdBy c",
           countQuery = "SELECT count(ia) FROM InventoryAdjustment ia")
    Page<InventoryAdjustment> findAllWithDetails(Pageable pageable);
}
