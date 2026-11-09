package com.pharmacy.dto.supplier;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SupplierPhoneValidationTest {

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

    private static <T> boolean hasPhoneViolation(Set<ConstraintViolation<T>> violations) {
        return violations.stream()
                .anyMatch(v -> "phone".equals(v.getPropertyPath().toString()));
    }

    @Test
    @DisplayName("TC-SUP-PHONE-01: Tạo nhà cung cấp thất bại khi số điện thoại chứa ký tự chữ (sd31r1fwf)")
    void createSupplier_invalidPhoneWithLetters_isRejected() {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP001")
                .name("Công ty Dược phẩm ABC")
                .phone("sd31r1fwf")
                .build();

        Set<ConstraintViolation<CreateSupplierRequest>> violations = validator.validate(request);

        assertTrue(hasPhoneViolation(violations),
                "Số điện thoại chứa chữ cái phải bị từ chối");
    }

    @Test
    @DisplayName("TC-SUP-PHONE-02: Tạo nhà cung cấp thành công với số di động hợp lệ (0901234567)")
    void createSupplier_validMobile_isAccepted() {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP001")
                .name("Công ty Dược phẩm ABC")
                .phone("0901234567")
                .build();

        Set<ConstraintViolation<CreateSupplierRequest>> violations = validator.validate(request);

        assertFalse(hasPhoneViolation(violations),
                "Số di động Việt Nam hợp lệ không được báo lỗi");
    }

    @Test
    @DisplayName("TC-SUP-PHONE-03: Chuẩn hóa và chấp nhận số điện thoại bàn có khoảng trắng (024 3822 1234)")
    void createSupplier_landlineWithSpaces_isNormalizedAndAccepted() {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP001")
                .name("Công ty Dược phẩm ABC")
                .phone("024 3822 1234")
                .build();

        Set<ConstraintViolation<CreateSupplierRequest>> violations = validator.validate(request);

        assertEquals("02438221234", request.phone(),
                "Số điện thoại phải được chuẩn hóa (bỏ khoảng trắng) trước khi lưu");
        assertFalse(hasPhoneViolation(violations),
                "Số điện thoại bàn có khoảng trắng phải được chấp nhận");
    }

    @Test
    @DisplayName("TC-SUP-PHONE-04: Cập nhật nhà cung cấp thất bại khi số điện thoại không hợp lệ")
    void updateSupplier_invalidPhone_isRejected() {
        UpdateSupplierRequest request = UpdateSupplierRequest.builder()
                .name("Công ty Dược phẩm ABC")
                .phone("sd31r1fwf")
                .build();

        Set<ConstraintViolation<UpdateSupplierRequest>> violations = validator.validate(request);

        assertTrue(hasPhoneViolation(violations),
                "Số điện thoại chứa chữ cái phải bị từ chối khi cập nhật");
    }

    @Test
    @DisplayName("TC-SUP-PHONE-05: Cập nhật nhà cung cấp bị từ chối khi số điện thoại sai độ dài")
    void updateSupplier_tooShortPhone_isRejected() {
        UpdateSupplierRequest request = UpdateSupplierRequest.builder()
                .name("Công ty Dược phẩm ABC")
                .phone("0901234")
                .build();

        Set<ConstraintViolation<UpdateSupplierRequest>> violations = validator.validate(request);

        assertTrue(hasPhoneViolation(violations),
                "Số điện thoại không đủ 10-11 chữ số phải bị từ chối");
    }
}
