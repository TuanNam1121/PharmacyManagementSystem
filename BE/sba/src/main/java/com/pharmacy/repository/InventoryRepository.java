package com.pharmacy.repository;

import com.pharmacy.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query(value = "SELECT i FROM Inventory i " +
            "JOIN FETCH i.product p " +
            "JOIN FETCH i.batch b " +
            "LEFT JOIN FETCH i.location l " +
            "WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "      OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "      OR LOWER(b.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')))", countQuery = "SELECT count(i) FROM Inventory i "
                    +
                    "JOIN i.product p " +
                    "JOIN i.batch b " +
                    "WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "      OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "      OR LOWER(b.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Inventory> searchWarehouseInventory(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT i FROM Inventory i " +
            "JOIN FETCH i.product p " +
            "JOIN FETCH i.batch b " +
            "JOIN FETCH i.store s " +
            "LEFT JOIN FETCH i.location l " +
            "WHERE i.store.id = :storeId " +
            "  AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "      OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "      OR LOWER(p.activeIngredient) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "      OR LOWER(b.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')))", countQuery = "SELECT count(i) FROM Inventory i "
                    +
                    "JOIN i.product p " +
                    "JOIN i.batch b " +
                    "WHERE i.store.id = :storeId " +
                    "  AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "      OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "      OR LOWER(p.activeIngredient) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "      OR LOWER(b.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Inventory> searchBranchInventory(@Param("storeId") Long storeId, @Param("search") String search,
            Pageable pageable);

    List<Inventory> findByStoreId(Long storeId);

    Optional<Inventory> findByStoreIdAndProductIdAndBatchId(Long storeId, Long productId, Long batchId);

    Optional<Inventory> findFirstByProductIdAndBatchId(Long productId, Long batchId);
}
