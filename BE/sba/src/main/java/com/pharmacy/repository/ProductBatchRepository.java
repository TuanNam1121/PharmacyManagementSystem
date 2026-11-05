package com.pharmacy.repository;

import com.pharmacy.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    @Query("SELECT b FROM ProductBatch b WHERE b.product.id = :productId AND b.expiryDate > :today ORDER BY b.expiryDate ASC")
    List<ProductBatch> findAvailableBatchesFEFO(@Param("productId") Long productId, @Param("today") LocalDate today);
}
