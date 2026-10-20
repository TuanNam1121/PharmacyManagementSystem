package com.pharmacy.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmacy.entity.Supplier;
public interface SupplierRepository extends JpaRepository<Supplier, Long>{

}
