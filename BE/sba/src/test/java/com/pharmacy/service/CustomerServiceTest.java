package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.*;
import com.pharmacy.entity.Customer;
import com.pharmacy.entity.CustomerHealthProfile;
import com.pharmacy.entity.SalesInvoice;
import com.pharmacy.exception.CustomerPhoneAlreadyExistsException;
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
import static org.mockito.Mockito.*;

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
                null, null, 0, 10, "createdAt", "desc"
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
                "xyz999", null, 0, 10, "createdAt", "desc"
        );

        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    @Test
    @DisplayName("TC-DTL-01: Xem chi tiết khách hàng hợp lệ")
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
        assertEquals(1, detail.getTotalOrders());
        assertEquals(BigDecimal.valueOf(1500000), detail.getTotalSpent());
    }

    @Test
    @DisplayName("TC-CST-01: Đăng ký khách hàng mới thành công")
    void testRegisterCustomerSuccess() {
        CustomerCreateRequest request = CustomerCreateRequest.builder()
                .fullName("Le Thi C")
                .phone("0988112233")
                .gender("FEMALE")
                .dateOfBirth(LocalDate.of(1995, 8, 20))
                .email("lethic@gmail.com")
                .address("456 Nguyen Trai, Ha Noi")
                .healthProfile(CustomerHealthProfileDto.builder()
                        .allergies("Aspirin")
                        .chronicDiseases("Hypertension")
                        .build())
                .build();

        when(customerRepository.existsByPhone("0988112233")).thenReturn(false);

        Customer savedCust = new Customer();
        savedCust.setId(105L);
        savedCust.setFullName("Le Thi C");
        savedCust.setPhone("0988112233");
        savedCust.setGender((short) 0);
        savedCust.setStatus((short) 1);

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCust);
        when(customerRepository.findById(105L)).thenReturn(Optional.of(savedCust));

        CustomerDetailResponse created = customerService.registerCustomer(request);

        assertNotNull(created);
        assertEquals(105L, created.getCustomerId());
        assertEquals("KH-000105", created.getCustomerCode());
        verify(customerRepository, times(1)).save(any(Customer.class));
        verify(healthProfileRepository, times(1)).save(any(CustomerHealthProfile.class));
    }

    @Test
    @DisplayName("TC-CST-02: Đăng ký trùng số điện thoại ném CustomerPhoneAlreadyExistsException")
    void testRegisterCustomerDuplicatePhone() {
        CustomerCreateRequest request = CustomerCreateRequest.builder()
                .fullName("Le Thi C")
                .phone("0987654321")
                .gender("FEMALE")
                .build();

        when(customerRepository.existsByPhone("0987654321")).thenReturn(true);

        assertThrows(CustomerPhoneAlreadyExistsException.class, () -> {
            customerService.registerCustomer(request);
        });
    }

    @Test
    @DisplayName("TC-EDT-01: Cập nhật thông tin khách hàng thành công")
    void testUpdateCustomerSuccess() {
        CustomerUpdateRequest request = CustomerUpdateRequest.builder()
                .fullName("Nguyen Van A Updated")
                .phone("0987654321")
                .gender("MALE")
                .address("789 Bach Dang, Da Nang")
                .build();

        when(customerRepository.findById(101L)).thenReturn(Optional.of(sampleCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);

        CustomerDetailResponse updated = customerService.updateCustomer(101L, request);

        assertNotNull(updated);
        assertEquals("Nguyen Van A Updated", sampleCustomer.getFullName());
        assertEquals("789 Bach Dang, Da Nang", sampleCustomer.getAddress());
    }

    @Test
    @DisplayName("TC-DEL-01: Xóa mềm khách hàng thành công (status = 0)")
    void testDeleteCustomerSoftDelete() {
        when(customerRepository.findById(101L)).thenReturn(Optional.of(sampleCustomer));

        customerService.deleteCustomer(101L, "Yêu cầu xóa tài khoản");

        assertEquals((short) 0, sampleCustomer.getStatus());
        verify(customerRepository, times(1)).save(sampleCustomer);
    }

    @Test
    @DisplayName("TC-REA-01: Kích hoạt lại khách hàng (status = 1)")
    void testReactivateCustomer() {
        sampleCustomer.setStatus((short) 0);
        when(customerRepository.findById(101L)).thenReturn(Optional.of(sampleCustomer));

        customerService.reactivateCustomer(101L);

        assertEquals((short) 1, sampleCustomer.getStatus());
        verify(customerRepository, times(1)).save(sampleCustomer);
    }
}
