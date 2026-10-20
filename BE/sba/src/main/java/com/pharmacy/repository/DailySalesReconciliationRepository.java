package com.pharmacy.repository;

import com.pharmacy.entity.DailySalesReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailySalesReconciliationRepository extends JpaRepository<DailySalesReconciliation, Long> {
    Optional<DailySalesReconciliation> findByStoreIdAndBusinessDate(Long storeId, LocalDate businessDate);
}