package com.pharmacy.repository;

import com.pharmacy.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByBarcode(String barcode);

    boolean existsByBarcodeAndIdNot(String barcode, Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    @Query(value = "SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.category c " +
            "WHERE (:keyword IS NULL OR :keyword = '' " +
            "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(p.activeIngredient) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(p.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:categoryId IS NULL OR c.id = :categoryId)",
            countQuery = "SELECT count(p) FROM Product p " +
                    "LEFT JOIN p.category c " +
                    "WHERE (:keyword IS NULL OR :keyword = '' " +
                    "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "   OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "   OR LOWER(p.activeIngredient) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "   OR LOWER(p.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:status IS NULL OR p.status = :status) " +
                    "AND (:categoryId IS NULL OR c.id = :categoryId)")
    Page<Product> findProductsWithFilters(@Param("keyword") String keyword,
                                          @Param("status") Short status,
                                          @Param("categoryId") Long categoryId,
                                          Pageable pageable);
}
