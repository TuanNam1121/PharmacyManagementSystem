package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.sales.CreateSalesInvoiceRequest;
import com.pharmacy.dto.sales.SalesInvoiceResponse;
import com.pharmacy.dto.sales.SalesReturnRequest;
import com.pharmacy.dto.sales.SalesReturnResponse;

import java.util.List;

public interface SalesInvoiceService {
    SalesInvoiceResponse createSalesInvoice(CreateSalesInvoiceRequest request, Long accountId);

    SalesInvoiceResponse getInvoiceByCode(String code);

    SalesInvoiceResponse getInvoiceById(Long id);

    PageResponse<SalesInvoiceResponse> getInvoices(Long storeId, Long shiftId, Long customerId,
                                                  String keyword, Short status, int page, int size);

    SalesReturnResponse returnSalesInvoice(SalesReturnRequest request, Long accountId);

    List<SalesInvoiceResponse> getCustomerPurchaseHistory(Long customerId);
}
