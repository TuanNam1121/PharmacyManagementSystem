package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerDetailResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.entity.Customer;
import com.pharmacy.entity.CustomerHealthProfile;
import com.pharmacy.entity.SalesInvoice;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CustomerHealthProfileRepository;
import com.pharmacy.repository.CustomerRepository;
import com.pharmacy.repository.SalesInvoiceRepository;
import com.pharmacy.service.impl.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerHealthProfileRepository healthProfileRepository;

    @Mock
    private SalesInvoiceRepository salesInvoiceRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        CustomerHealthProfile healthProfile = new CustomerHealthProfile();
        healthProfile.setId(1L);
        healthProfile.setAllergies("Penicillin");
        healthProfile.setMedicalConditions("Gastric Ulcer");
        healthProfile.setCurrentMedications("Nexium 40mg");
        healthProfile.setNote("Avoid NSAIDs");

        sampleCustomer = new Customer();
        sampleCustomer.setId(101L);
        sampleCustomer.setFullName("Nguyen Van A");
        sampleCustomer.setPhone("0987654321");
        sampleCustomer.setEmail("vana@gmail.com");
        sampleCustomer.setGender((short) 1);
        sampleCustomer.setDateOfBirth(LocalDate.of(1990, 5, 15));
        sampleCustomer.setAddress("123 Le Loi, Da Nang");
        sampleCustomer.setStatus((short) 1);
        sampleCustomer.setCreatedAt(LocalDateTime.now());
        sampleCustomer.setHealthProfile(healthProfile);
    }

    @Test
    @DisplayName("TC-LST-01: Lấy danh sách khách hàng trang đầu tiên")
    void testGetCustomersDefaultPage() {
        Page<Customer> page = new PageImpl<>(List.of(sampleCustomer));
        when(customerRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<CustomerResponse> result = customerService.getCustomers(
                null, null, null, 0, 10, "createdAt", "desc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("KH-000101", result.getContent().get(0).getCustomerCode());
        assertEquals("Nguyen Van A", result.getContent().get(0).getFullName());
        assertEquals("0987654321", result.getContent().get(0).getPhone());
        assertEquals("MALE", result.getContent().get(0).getGender());
        assertTrue(result.getContent().get(0).getHasAllergies());
        assertEquals("Penicillin", result.getContent().get(0).getAllergies());
    }

    @Test
    @DisplayName("TC-LST-05: Tìm từ khóa không tồn tại trả về rỗng")
    void testGetCustomersEmpty() {
        Page<Customer> emptyPage = new PageImpl<>(Collections.emptyList());
        when(customerRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        PageResponse<CustomerResponse> result = customerService.getCustomers(
                "xyz999", null, null, 0, 10, "createdAt", "desc"
        );

        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    @Test
    @DisplayName("TC-DTL-01: Xem chi tiết khách hàng hợp lệ có hồ sơ sức khỏe và hóa đơn")
    void testGetCustomerDetailValid() {
        SalesInvoice invoice = new SalesInvoice();
        invoice.setId(1001L);
        invoice.setCode("INV-20261105-0001");
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setFinalAmount(BigDecimal.valueOf(1500000));
        invoice.setStatus((short) 1);

        when(customerRepository.findById(101L)).thenReturn(Optional.of(sampleCustomer));
        when(salesInvoiceRepository.findTop5ByCustomer_IdOrderByCreatedAtDesc(101L)).thenReturn(List.of(invoice));
        when(salesInvoiceRepository.countByCustomerId(101L)).thenReturn(1L);
        when(salesInvoiceRepository.sumFinalAmountByCustomerId(101L)).thenReturn(BigDecimal.valueOf(1500000));

        CustomerDetailResponse detail = customerService.getCustomerDetail(101L);

        assertNotNull(detail);
        assertEquals(101L, detail.getCustomerId());
        assertEquals("KH-000101", detail.getCustomerCode());
        assertEquals("Nguyen Van A", detail.getFullName());
        assertEquals("SILVER", detail.getMembershipTier());
        assertEquals(1, detail.getTotalOrders());
        assertEquals(BigDecimal.valueOf(1500000), detail.getTotalSpent());
        assertNotNull(detail.getHealthProfile());
        assertEquals("Penicillin", detail.getHealthProfile().getAllergies());
        assertEquals("Gastric Ulcer", detail.getHealthProfile().getChronicDiseases());
        assertEquals(1, detail.getRecentInvoices().size());
        assertEquals("INV-20261105-0001", detail.getRecentInvoices().get(0).getInvoiceCode());
    }

    @Test
    @DisplayName("TC-DTL-02: Xem chi tiết khách hàng chưa có hồ sơ bệnh lý")
    void testGetCustomerDetailWithoutHealthProfile() {
        Customer plainCustomer = new Customer();
        plainCustomer.setId(102L);
        plainCustomer.setFullName("Tran Thi B");
        plainCustomer.setPhone("0912345678");
        plainCustomer.setStatus((short) 1);
        plainCustomer.setCreatedAt(LocalDateTime.now());

        when(customerRepository.findById(102L)).thenReturn(Optional.of(plainCustomer));
        when(healthProfileRepository.findByCustomer_Id(102L)).thenReturn(Optional.empty());
        when(salesInvoiceRepository.findTop5ByCustomer_IdOrderByCreatedAtDesc(102L)).thenReturn(Collections.emptyList());
        when(salesInvoiceRepository.countByCustomerId(102L)).thenReturn(0L);
        when(salesInvoiceRepository.sumFinalAmountByCustomerId(102L)).thenReturn(BigDecimal.ZERO);

        CustomerDetailResponse detail = customerService.getCustomerDetail(102L);

        assertNotNull(detail);
        assertEquals(102L, detail.getCustomerId());
        assertNull(detail.getHealthProfile());
        assertEquals("STANDARD", detail.getMembershipTier());
        assertEquals(0, detail.getTotalOrders());
        assertTrue(detail.getRecentInvoices().isEmpty());
    }

    @Test
    @DisplayName("TC-DTL-03: Xem chi tiết khách hàng không tồn tại ném ResourceNotFoundException")
    void testGetCustomerDetailNotFound() {
        when(customerRepository.findById(999999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            customerService.getCustomerDetail(999999L);
        });
    }
}
