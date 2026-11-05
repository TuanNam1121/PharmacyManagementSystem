package com.pharmacy.repository;

import com.pharmacy.entity.SalesReturnDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesReturnDetailRepository extends JpaRepository<SalesReturnDetail, Long> {

    List<SalesReturnDetail> findBySalesReturn_Id(Long returnId);
}

