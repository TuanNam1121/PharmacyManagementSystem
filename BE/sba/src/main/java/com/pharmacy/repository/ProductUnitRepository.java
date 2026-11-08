package com.pharmacy.repository;

import com.pharmacy.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductUnitRepository extends JpaRepository<ProductUnit, Long> {

    List<ProductUnit> findByProduct_IdOrderByConversionFactorAsc(Long productId);

    Optional<ProductUnit> findByBarcode(String barcode);

    Optional<ProductUnit> findByProduct_IdAndIsBaseUnitTrue(Long productId);
}
