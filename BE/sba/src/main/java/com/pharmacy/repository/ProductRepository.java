package com.pharmacy.repository;

import com.pharmacy.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
            SELECT p FROM Product p
            WHERE (:search IS NULL OR :search = ''
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR (p.activeIngredient IS NOT NULL AND LOWER(p.activeIngredient) LIKE LOWER(CONCAT('%', :search, '%'))))
            ORDER BY p.name ASC
            """)
    List<Product> searchProducts(@Param("search") String search, Pageable pageable);
}
