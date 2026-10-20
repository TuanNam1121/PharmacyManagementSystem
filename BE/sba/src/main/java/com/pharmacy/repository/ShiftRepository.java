package com.pharmacy.repository;

import com.pharmacy.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    @Query("SELECT s FROM Shift s WHERE s.store.id = :storeId AND s.openedAt >= :startDate AND s.openedAt <= :endDate ORDER BY s.openedAt ASC")
    List<Shift> findShiftsByStoreAndDateRange(@Param("storeId") Long storeId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
}