package com.pharmacy.repository;

import com.pharmacy.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    @Query("SELECT ph FROM PriceHistory ph " +
           "LEFT JOIN FETCH ph.account a " +
           "LEFT JOIN FETCH a.accountInformation " +
           "WHERE ph.product.id = :productId " +
           "ORDER BY ph.effectiveFrom DESC, ph.createdAt DESC")
    List<PriceHistory> findByProductIdWithAccount(@Param("productId") Long productId);

    List<PriceHistory> findByProductIdOrderByEffectiveFromDesc(Long productId);
}
