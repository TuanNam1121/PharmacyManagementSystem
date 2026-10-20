package com.pharmacy.repository;

import com.pharmacy.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Long> {
    List<WarehouseLocation> findByStatus(Short status);
    Optional<WarehouseLocation> findByCode(String code);
}
