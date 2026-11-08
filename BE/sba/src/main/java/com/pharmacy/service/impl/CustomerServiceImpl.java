package com.pharmacy.service.impl;

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
import com.pharmacy.service.CustomerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerHealthProfileRepository healthProfileRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getCustomers(String keyword, Short status,
                                                        int page, int size, String sortBy, String sortDir) {
        String sortProperty = resolveSortProperty(sortBy);
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortProperty).ascending()
                : Sort.by(sortProperty).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate phonePred = cb.like(root.get("phone"), "%" + keyword.trim() + "%");
                Predicate namePred = cb.like(cb.lower(root.get("fullName")), kw);
                Predicate emailPred = cb.like(cb.lower(root.get("email")), kw);

                Predicate kwPred = cb.or(phonePred, namePred, emailPred);

                String trimmed = keyword.trim();
                if (trimmed.toLowerCase().startsWith("kh-")) {
                    try {
                        Long idVal = Long.parseLong(trimmed.substring(3).trim());
                        kwPred = cb.or(kwPred, cb.equal(root.get("id"), idVal));
                    } catch (NumberFormatException ignored) {}
                } else if (trimmed.matches("^\\d+$") && trimmed.length() <= 8) {
                    try {
                        Long idVal = Long.parseLong(trimmed);
                        kwPred = cb.or(kwPred, cb.equal(root.get("id"), idVal));
                    } catch (NumberFormatException ignored) {}
                }

                predicates.add(kwPred);
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Customer> customerPage = customerRepository.findAll(spec, pageable);

        List<Customer> customers = customerPage.getContent();
        Map<Long, BigDecimal> spentMap = new HashMap<>();
        if (!customers.isEmpty()) {
            List<Long> ids = customers.stream().map(Customer::getId).collect(Collectors.toList());
            try {
                List<Object[]> rows = salesInvoiceRepository.sumFinalAmountByCustomerIds(ids);
                if (rows != null) {
                    for (Object[] r : rows) {
                        if (r != null && r.length >= 2 && r[0] != null) {
                            Long cId = ((Number) r[0]).longValue();
                            BigDecimal spent = r[1] != null ? (BigDecimal) r[1] : BigDecimal.ZERO;
                            spentMap.put(cId, spent);
                        }
                    }
                }
            } catch (Exception ignored) {
                // fallback gracefully
            }
        }

        List<CustomerResponse> content = customers.stream()
                .map(c -> mapToCustomerResponse(c, spentMap.getOrDefault(c.getId(), BigDecimal.ZERO)))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                customerPage.getNumber(),
                customerPage.getSize(),
                customerPage.getTotalElements(),
                customerPage.getTotalPages(),
                customerPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerDetail(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        CustomerHealthProfile healthProfile = customer.getHealthProfile();
        if (healthProfile == null) {
            healthProfile = healthProfileRepository.findByCustomer_Id(customerId).orElse(null);
        }

        List<SalesInvoice> recentInvoices = salesInvoiceRepository.findTop5ByCustomer_IdOrderByCreatedAtDesc(customerId);
        long totalOrders = salesInvoiceRepository.countByCustomerId(customerId);
        BigDecimal totalSpent = salesInvoiceRepository.sumFinalAmountByCustomerId(customerId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;

        return buildCustomerDetailResponse(customer, healthProfile, recentInvoices, totalOrders, totalSpent);
    }

    @Override
    @Transactional
    public CustomerDetailResponse registerCustomer(CustomerCreateRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        if (customerRepository.existsByPhone(phone)) {
            throw new CustomerPhoneAlreadyExistsException("Số điện thoại " + phone + " đã tồn tại trong hệ thống");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName().trim());
        customer.setPhone(phone);
        customer.setGender(parseGenderCode(request.getGender()));
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setEmail(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim() : null);
        customer.setAddress(request.getAddress() != null && !request.getAddress().isBlank() ? request.getAddress().trim() : null);
        customer.setStatus((short) 1);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer savedCustomer = customerRepository.save(customer);

        if (request.getHealthProfile() != null) {
            CustomerHealthProfileDto hpDto = request.getHealthProfile();
            CustomerHealthProfile health = new CustomerHealthProfile();
            health.setCustomer(savedCustomer);
            health.setHeightCm(hpDto.getHeightCm());
            health.setWeightKg(hpDto.getWeightKg());
            health.setAllergies(hpDto.getAllergies());
            health.setMedicalConditions(hpDto.getChronicDiseases());
            health.setCurrentMedications(hpDto.getCurrentMedications());
            health.setNote(hpDto.getNotes());
            health.setUpdatedAt(LocalDateTime.now());
            healthProfileRepository.save(health);
            savedCustomer.setHealthProfile(health);
        }

        return getCustomerDetail(savedCustomer.getId());
    }

    @Override
    @Transactional
    public CustomerDetailResponse updateCustomer(Long customerId, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        String newPhone = request.getPhone() != null ? request.getPhone().trim() : "";
        if (!newPhone.equalsIgnoreCase(customer.getPhone()) && customerRepository.existsByPhoneAndIdNot(newPhone, customerId)) {
            throw new CustomerPhoneAlreadyExistsException("Số điện thoại " + newPhone + " đã thuộc về một khách hàng khác trong hệ thống");
        }

        customer.setFullName(request.getFullName().trim());
        customer.setPhone(newPhone);
        customer.setGender(parseGenderCode(request.getGender()));
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setEmail(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim() : null);
        customer.setAddress(request.getAddress() != null && !request.getAddress().isBlank() ? request.getAddress().trim() : null);
        customer.setUpdatedAt(LocalDateTime.now());

        Customer savedCustomer = customerRepository.save(customer);

        if (request.getHealthProfile() != null) {
            CustomerHealthProfileDto hpDto = request.getHealthProfile();
            CustomerHealthProfile health = healthProfileRepository.findByCustomer_Id(customerId).orElse(null);
            if (health == null) {
                health = new CustomerHealthProfile();
                health.setCustomer(savedCustomer);
            }
            health.setHeightCm(hpDto.getHeightCm());
            health.setWeightKg(hpDto.getWeightKg());
            health.setAllergies(hpDto.getAllergies());
            health.setMedicalConditions(hpDto.getChronicDiseases());
            health.setCurrentMedications(hpDto.getCurrentMedications());
            health.setNote(hpDto.getNotes());
            health.setUpdatedAt(LocalDateTime.now());
            healthProfileRepository.save(health);
            savedCustomer.setHealthProfile(health);
        }

        return getCustomerDetail(savedCustomer.getId());
    }

    @Override
    @Transactional
    public void deleteCustomer(Long customerId, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        if (customer.getStatus() != null && customer.getStatus() == 0) {
            throw new IllegalStateException("Khách hàng này đã ở trạng thái ngừng hoạt động");
        }

        customer.setStatus((short) 0);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void reactivateCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

        customer.setStatus((short) 1);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
    }

    private Short parseGenderCode(String gender) {
        if (gender == null) return 2;
        String g = gender.trim().toUpperCase();
        if (g.equals("MALE") || g.equals("1") || g.equals("NAM")) return 1;
        if (g.equals("FEMALE") || g.equals("0") || g.equals("NỮ") || g.equals("NU")) return 0;
        return 2;
    }

    private CustomerDetailResponse buildCustomerDetailResponse(Customer customer,
                                                               CustomerHealthProfile health,
                                                               List<SalesInvoice> recentInvoices,
                                                               long totalOrders,
                                                               BigDecimal totalSpent) {
        String genderLabel = "OTHER";
        if (customer.getGender() != null) {
            if (customer.getGender() == 1) genderLabel = "MALE";
            else if (customer.getGender() == 0) genderLabel = "FEMALE";
        }

        String customerCode = String.format("KH-%06d", customer.getId());

        Integer age = null;
        if (customer.getDateOfBirth() != null) {
            age = Period.between(customer.getDateOfBirth(), LocalDate.now()).getYears();
        }

        CustomerHealthProfileDto healthDto = null;
        if (health != null) {
            healthDto = CustomerHealthProfileDto.builder()
                    .id(health.getId())
                    .heightCm(health.getHeightCm())
                    .weightKg(health.getWeightKg())
                    .allergies(health.getAllergies())
                    .chronicDiseases(health.getMedicalConditions())
                    .currentMedications(health.getCurrentMedications())
                    .isPregnant(Boolean.FALSE)
                    .isBreastfeeding(Boolean.FALSE)
                    .notes(health.getNote())
                    .updatedAt(health.getUpdatedAt())
                    .build();
        }

        List<CustomerRecentInvoiceDto> invoiceDtos = (recentInvoices != null ? recentInvoices : List.<SalesInvoice>of())
                .stream()
                .map(inv -> CustomerRecentInvoiceDto.builder()
                        .invoiceId(inv.getId())
                        .invoiceCode(inv.getCode())
                        .createdAt(inv.getCreatedAt())
                        .netAmount(inv.getFinalAmount())
                        .status(mapInvoiceStatus(inv.getStatus()))
                        .build())
                .collect(Collectors.toList());

        return CustomerDetailResponse.builder()
                .customerId(customer.getId())
                .customerCode(customerCode)
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .gender(genderLabel)
                .genderCode(customer.getGender())
                .dateOfBirth(customer.getDateOfBirth())
                .age(age)
                .email(customer.getEmail())
                .address(customer.getAddress())
                .totalSpent(totalSpent)
                .totalOrders((int) totalOrders)
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .healthProfile(healthDto)
                .recentInvoices(invoiceDtos)
                .build();
    }

    private String mapInvoiceStatus(Short status) {
        if (status == null) return "PENDING";
        return switch (status) {
            case 1 -> "COMPLETED";
            case 2 -> "CANCELLED";
            case 3 -> "PARTIALLY_RETURNED";
            case 4 -> "RETURNED";
            default -> "PENDING";
        };
    }

    private CustomerResponse mapToCustomerResponse(Customer customer) {
        return mapToCustomerResponse(customer, BigDecimal.ZERO);
    }

    private CustomerResponse mapToCustomerResponse(Customer customer, BigDecimal totalSpent) {
        CustomerHealthProfile health = customer.getHealthProfile();
        boolean hasAllergies = health != null && health.getAllergies() != null && !health.getAllergies().isBlank();
        String allergies = health != null ? health.getAllergies() : null;

        String genderLabel = "OTHER";
        if (customer.getGender() != null) {
            if (customer.getGender() == 1) genderLabel = "MALE";
            else if (customer.getGender() == 0) genderLabel = "FEMALE";
        }

        String customerCode = String.format("KH-%06d", customer.getId());

        BigDecimal safeSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;

        return CustomerResponse.builder()
                .customerId(customer.getId())
                .customerCode(customerCode)
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .dateOfBirth(customer.getDateOfBirth())
                .gender(genderLabel)
                .genderCode(customer.getGender())
                .address(customer.getAddress())
                .totalSpent(safeSpent)
                .status(customer.getStatus())
                .hasAllergies(hasAllergies)
                .allergies(allergies)
                .createdAt(customer.getCreatedAt())
                .build();
    }

    private String resolveSortProperty(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }
        return switch (sortBy) {
            case "fullName", "name" -> "fullName";
            case "phone" -> "phone";
            case "status" -> "status";
            case "id", "customerId" -> "id";
            default -> "createdAt";
        };
    }
}
