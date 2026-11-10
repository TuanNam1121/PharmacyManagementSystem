package com.pharmacy.dto.warehouse;

import com.pharmacy.dto.warehouse.CreatePurchaseRequest.CreatePurchaseRequestItem;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreatePurchaseRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        validatorFactory.close();
    }

    private static CreatePurchaseRequest requestWithItem(Integer requestedQuantity) {
        return CreatePurchaseRequest.builder()
                .items(List.of(new CreatePurchaseRequestItem(1L, requestedQuantity, null)))
                .build();
    }

    private static boolean hasViolationOn(
            Set<ConstraintViolation<CreatePurchaseRequest>> violations, String propertyFragment) {
        return violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().contains(propertyFragment));
    }

    @Test
    @DisplayName("TC-PR-QTY-01: Tạo phiếu thất bại khi SL yêu cầu bằng 0")
    void createPurchaseRequest_zeroQuantity_isRejected() {
        Set<ConstraintViolation<CreatePurchaseRequest>> violations =
                validator.validate(requestWithItem(0));

        assertTrue(hasViolationOn(violations, "requestedQuantity"),
                "Số lượng yêu cầu bằng 0 phải bị từ chối");
    }

    @Test
    @DisplayName("TC-PR-QTY-02: Tạo phiếu thất bại khi SL yêu cầu là số âm")
    void createPurchaseRequest_negativeQuantity_isRejected() {
        Set<ConstraintViolation<CreatePurchaseRequest>> violations =
                validator.validate(requestWithItem(-5));

        assertTrue(hasViolationOn(violations, "requestedQuantity"),
                "Số lượng yêu cầu âm phải bị từ chối");
    }

    @Test
    @DisplayName("TC-PR-QTY-03: Tạo phiếu thất bại khi SL yêu cầu là null")
    void createPurchaseRequest_nullQuantity_isRejected() {
        Set<ConstraintViolation<CreatePurchaseRequest>> violations =
                validator.validate(requestWithItem(null));

        assertTrue(hasViolationOn(violations, "requestedQuantity"),
                "Số lượng yêu cầu null phải bị từ chối");
    }

    @Test
    @DisplayName("TC-PR-QTY-04: Tạo phiếu thành công với SL yêu cầu hợp lệ (> 0)")
    void createPurchaseRequest_validQuantity_isAccepted() {
        Set<ConstraintViolation<CreatePurchaseRequest>> violations =
                validator.validate(requestWithItem(100));

        assertFalse(hasViolationOn(violations, "requestedQuantity"),
                "Số lượng yêu cầu hợp lệ không được báo lỗi");
        assertTrue(violations.isEmpty(),
                "Dữ liệu hợp lệ không được có bất kỳ lỗi ràng buộc nào");
    }

    @Test
    @DisplayName("TC-PR-QTY-05: Tạo phiếu thất bại khi danh sách mặt hàng rỗng")
    void createPurchaseRequest_emptyItems_isRejected() {
        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .items(List.of())
                .build();

        Set<ConstraintViolation<CreatePurchaseRequest>> violations = validator.validate(request);

        assertTrue(violations.stream()
                        .anyMatch(v -> "items".equals(v.getPropertyPath().toString())),
                "Danh sách items rỗng phải bị từ chối");
    }

    @Test
    @DisplayName("TC-PR-QTY-06: Tạo phiếu thất bại khi thiếu productId")
    void createPurchaseRequest_missingProductId_isRejected() {
        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .items(List.of(new CreatePurchaseRequestItem(null, 10, null)))
                .build();

        Set<ConstraintViolation<CreatePurchaseRequest>> violations = validator.validate(request);

        assertTrue(hasViolationOn(violations, "productId"),
                "Thiếu productId phải bị từ chối");
    }
}
