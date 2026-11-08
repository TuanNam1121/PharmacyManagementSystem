package com.pharmacy.service;

import com.pharmacy.dto.sales.CreateSalesInvoiceRequest;
import com.pharmacy.dto.sales.InvoiceItemRequest;
import com.pharmacy.dto.sales.ProcessPaymentRequest;
import com.pharmacy.dto.sales.SalesInvoiceResponse;
import com.pharmacy.entity.*;
import com.pharmacy.exception.NoOpenShiftException;
import com.pharmacy.repository.*;
import com.pharmacy.service.impl.SalesInvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesInvoiceServiceTest {

    @Mock
    private SalesInvoiceRepository salesInvoiceRepository;

    @Mock
    private SalesInvoiceDetailRepository salesInvoiceDetailRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private SalesReturnRepository salesReturnRepository;

    @Mock
    private SalesReturnDetailRepository salesReturnDetailRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductBatchRepository productBatchRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private SalesInvoiceServiceImpl salesInvoiceService;

    private Shift openShift;
    private Store store;
    private Account account;
    private Product product;
    private ProductBatch batch;
    private Customer customer;

    @BeforeEach
    void setUp() {
        store = new Store();
        store.setId(1L);
        store.setName("Chi nhánh Cầu Giấy");

        account = new Account();
        account.setId(10L);
        account.setUsername("pharmacist");

        customer = new Customer();
        customer.setId(101L);
        customer.setFullName("Trần Thị Lan");
        customer.setPhone("0987123456");

        openShift = new Shift();
        openShift.setId(50L);
        openShift.setStore(store);
        openShift.setAccount(account);
        openShift.setStatus((short) 1);

        product = new Product();
        product.setId(201L);
        product.setName("Panadol Extra");
        product.setBarcode("MED-00201");
        product.setUnit("Hộp");

        batch = new ProductBatch();
        batch.setId(301L);
        batch.setProduct(product);
        batch.setBatchNumber("BATCH-202612-01");
        batch.setExpiryDate(LocalDate.of(2027, 12, 31));
    }

    @Test
    @DisplayName("TC-INV-01: Tạo hóa đơn bán lẻ POS và thanh toán thành công")
    void testCreateSalesInvoiceSuccess() {
        CreateSalesInvoiceRequest request = CreateSalesInvoiceRequest.builder()
                .shiftId(50L)
                .customerId(101L)
                .discount(BigDecimal.valueOf(10000))
                .items(List.of(
                        InvoiceItemRequest.builder()
                                .productId(201L)
                                .batchId(301L)
                                .quantity(2)
                                .unitPrice(BigDecimal.valueOf(50000))
                                .dosageInstruction("Uống sau ăn")
                                .build()
                ))
                .payment(ProcessPaymentRequest.builder()
                        .paymentMethod("CASH")
                        .amountPaid(BigDecimal.valueOf(90000))
                        .tenderedCash(BigDecimal.valueOf(100000))
                        .build())
                .build();

        when(shiftRepository.findById(50L)).thenReturn(Optional.of(openShift));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(customerRepository.findById(101L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(201L)).thenReturn(Optional.of(product));
        when(productBatchRepository.findById(301L)).thenReturn(Optional.of(batch));

        Inventory inventory = new Inventory();
        inventory.setId(401L);
        inventory.setStore(store);
        inventory.setProduct(product);
        inventory.setBatch(batch);
        inventory.setQuantity(20);

        when(inventoryRepository.findByStoreIdAndProductIdAndBatchId(1L, 201L, 301L))
                .thenReturn(Optional.of(inventory));

        SalesInvoice savedInvoice = new SalesInvoice();
        savedInvoice.setId(1001L);
        savedInvoice.setCode("INV-20261105-0001");
        savedInvoice.setStore(store);
        savedInvoice.setAccount(account);
        savedInvoice.setTotalAmount(BigDecimal.valueOf(100000));
        savedInvoice.setDiscount(BigDecimal.valueOf(10000));
        savedInvoice.setFinalAmount(BigDecimal.valueOf(90000));
        savedInvoice.setStatus((short) 1);
        savedInvoice.setCreatedAt(LocalDateTime.now());

        when(salesInvoiceRepository.save(any(SalesInvoice.class))).thenReturn(savedInvoice);
        when(salesInvoiceDetailRepository.save(any(SalesInvoiceDetail.class))).thenAnswer(i -> i.getArgument(0));

        SalesInvoiceResponse response = salesInvoiceService.createSalesInvoice(request, 10L);

        assertNotNull(response);
        assertEquals("INV-20261105-0001", response.getInvoiceCode());
        assertEquals(BigDecimal.valueOf(100000), response.getTotalAmount());
        assertEquals(BigDecimal.valueOf(90000), response.getFinalAmount());
        assertEquals(BigDecimal.valueOf(10000), response.getChangeAmount());
        assertEquals("PAID", response.getPaymentStatus());
        assertEquals(18, inventory.getQuantity()); // 20 - 2 = 18
        verify(inventoryRepository, times(1)).save(inventory);
        verify(salesInvoiceDetailRepository, times(1)).save(any(SalesInvoiceDetail.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("TC-INV-02: Báo lỗi NoOpenShiftException nếu nhân viên chưa mở ca làm việc")
    void testCreateSalesInvoiceNoOpenShift() {
        CreateSalesInvoiceRequest request = CreateSalesInvoiceRequest.builder()
                .items(List.of(
                        InvoiceItemRequest.builder()
                                .productId(201L)
                                .quantity(1)
                                .unitPrice(BigDecimal.valueOf(50000))
                                .build()
                ))
                .build();

        when(shiftRepository.findFirstByAccount_IdAndStatus(10L, (short) 1)).thenReturn(Optional.empty());

        assertThrows(NoOpenShiftException.class, () -> {
            salesInvoiceService.createSalesInvoice(request, 10L);
        });
    }

    @Test
    @DisplayName("TC-INV-03: Báo lỗi IllegalArgumentException nếu thiếu thông tin khách hàng định danh")
    void testCreateSalesInvoiceMissingCustomerThrowsException() {
        CreateSalesInvoiceRequest request = CreateSalesInvoiceRequest.builder()
                .shiftId(50L)
                .customerId(null) // Thiếu khách hàng
                .items(List.of(
                        InvoiceItemRequest.builder()
                                .productId(201L)
                                .quantity(1)
                                .unitPrice(BigDecimal.valueOf(50000))
                                .build()
                ))
                .build();

        when(shiftRepository.findById(50L)).thenReturn(Optional.of(openShift));

        assertThrows(IllegalArgumentException.class, () -> {
            salesInvoiceService.createSalesInvoice(request, 10L);
        });
    }

    @Test
    @DisplayName("TC-INV-04: Trả hàng thành công, đảm bảo returnType không bao giờ null")
    void testReturnSalesInvoiceSuccessWithReturnType() {
        SalesInvoice invoice = new SalesInvoice();
        invoice.setId(99L);
        invoice.setCode("INV-20261108-9999");
        invoice.setStatus((short) 1);
        invoice.setFinalAmount(BigDecimal.valueOf(100000));
        invoice.setStore(store);
        invoice.setShift(openShift);
        invoice.setAccount(account);

        SalesInvoiceDetail detail = new SalesInvoiceDetail();
        detail.setId(501L);
        detail.setSalesInvoice(invoice);
        detail.setProduct(product);
        detail.setBatch(batch);
        detail.setUnitPrice(BigDecimal.valueOf(50000));
        detail.setQuantity(2);

        when(salesInvoiceRepository.findById(99L)).thenReturn(Optional.of(invoice));
        when(salesInvoiceDetailRepository.findById(501L)).thenReturn(Optional.of(detail));
        when(shiftRepository.findFirstByAccount_IdAndStatus(10L, (short) 1)).thenReturn(Optional.of(openShift));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(salesReturnRepository.save(any(SalesReturn.class))).thenAnswer(invocation -> {
            SalesReturn sr = invocation.getArgument(0);
            assertNotNull(sr.getReturnType(), "returnType must not be null before saving");
            assertEquals((short) 1, sr.getReturnType(), "2 x 50k = 100k, equals finalAmount => full return (1)");
            sr.setId(1L);
            return sr;
        });
        when(salesReturnDetailRepository.save(any(SalesReturnDetail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.pharmacy.dto.sales.SalesReturnRequest returnRequest = com.pharmacy.dto.sales.SalesReturnRequest.builder()
                .invoiceId(99L)
                .refundMethod((short) 1)
                .reason("Khách đổi đơn thuốc bác sĩ")
                .items(List.of(
                        com.pharmacy.dto.sales.SalesReturnRequest.ReturnItemRequest.builder()
                                .salesInvoiceDetailId(501L)
                                .quantity(2)
                                .build()
                ))
                .build();

        com.pharmacy.dto.sales.SalesReturnResponse response = salesInvoiceService.returnSalesInvoice(returnRequest, 10L);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(100000), response.getRefundAmount());
        assertEquals((short) 4, invoice.getStatus(), "Hóa đơn phải đổi trạng thái thành 4 (FULLY_RETURNED)");
        verify(salesReturnRepository, atLeastOnce()).save(any(SalesReturn.class));
    }
}
