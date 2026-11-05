package com.pharmacy.repository;

import com.pharmacy.entity.SalesInvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesInvoiceDetailRepository extends JpaRepository<SalesInvoiceDetail, Long> {

    List<SalesInvoiceDetail> findBySalesInvoice_Id(Long invoiceId);
}
