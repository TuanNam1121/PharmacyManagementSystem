package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.entity.Customer;
import com.pharmacy.entity.CustomerHealthProfile;
import com.pharmacy.repository.CustomerRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getCustomers(String keyword, String membershipTier, Short status,
                                                        int page, int size, String sortBy, String sortDir) {
        // Validate sort field
        String sortProperty = resolveSortProperty(sortBy);
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortProperty).ascending()
                : Sort.by(sortProperty).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by keyword (phone, fullName, email, or id)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate phonePred = cb.like(root.get("phone"), "%" + keyword.trim() + "%");
                Predicate namePred = cb.like(cb.lower(root.get("fullName")), kw);
                Predicate emailPred = cb.like(cb.lower(root.get("email")), kw);

                Predicate kwPred = cb.or(phonePred, namePred, emailPred);

                // If keyword is formatted like KH-000001 or is a direct numeric ID
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

            // Filter by status
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Customer> customerPage = customerRepository.findAll(spec, pageable);

        List<CustomerResponse> content = customerPage.getContent().stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());

        // In-memory filter for membershipTier if requested
        if (membershipTier != null && !membershipTier.trim().isEmpty() && !"ALL".equalsIgnoreCase(membershipTier)) {
            content = content.stream()
                    .filter(c -> membershipTier.equalsIgnoreCase(c.getMembershipTier()))
                    .collect(Collectors.toList());
        }

        return new PageResponse<>(
                content,
                customerPage.getNumber(),
                customerPage.getSize(),
                customerPage.getTotalElements(),
                customerPage.getTotalPages(),
                customerPage.isLast()
        );
    }

    private CustomerResponse mapToCustomerResponse(Customer customer) {
        CustomerHealthProfile health = customer.getHealthProfile();
        boolean hasAllergies = health != null && health.getAllergies() != null && !health.getAllergies().isBlank();
        String allergies = health != null ? health.getAllergies() : null;

        String genderLabel = "OTHER";
        if (customer.getGender() != null) {
            if (customer.getGender() == 1) genderLabel = "MALE";
            else if (customer.getGender() == 0) genderLabel = "FEMALE";
        }

        String customerCode = String.format("KH-%06d", customer.getId());

        // Default tier & points (can be upgraded when linked with sales invoices)
        Integer loyaltyPoints = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
        String membershipTier = "STANDARD";

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
                .membershipTier(membershipTier)
                .loyaltyPoints(loyaltyPoints)
                .totalSpent(totalSpent)
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
