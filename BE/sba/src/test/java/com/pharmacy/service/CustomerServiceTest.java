package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.entity.Customer;
import com.pharmacy.entity.CustomerHealthProfile;
import com.pharmacy.repository.CustomerRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        CustomerHealthProfile healthProfile = new CustomerHealthProfile();
        healthProfile.setId(1L);
        healthProfile.setAllergies("Penicillin");

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
}
