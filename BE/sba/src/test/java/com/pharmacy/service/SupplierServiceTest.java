package com.pharmacy.service;

import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.dto.supplier.SupplierStatsResponse;
import com.pharmacy.dto.supplier.UpdateSupplierRequest;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.enums.SupplierStatus;
import com.pharmacy.repository.SupplierRepository;
import com.pharmacy.service.impl.SupplierServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private Supplier sampleSupplier;
    private UpdateSupplierRequest updateRequest;

    @BeforeEach
    void setUp() {
        sampleSupplier = Supplier.builder()
                .id(1L)
                .code("SUP001")
                .name("Công ty Dược phẩm ABC")
                .contactPerson("Nguyễn Văn A")
                .phone("0901234567")
                .email("contact@abc.vn")
                .address("123 Lê Lợi, Quận 1, TP.HCM")
                .taxCode("0101234567")
                .status(SupplierStatus.ACTIVE)
                .build();

        updateRequest = UpdateSupplierRequest.builder()
                .name("Công ty Dược phẩm ABC - Chi nhánh 1")
                .contactPerson("Trần Thị B")
                .phone("0907654321")
                .email("sales@abc.vn")
                .address("456 Nguyễn Huệ, Quận 1, TP.HCM")
                .taxCode("0101234567")
                .note("Cập nhật thông tin liên hệ")
                .build();
    }

    @Test
    @DisplayName("Không cho phép cập nhật nhà cung cấp đã ngừng hoạt động")
    void updateSupplierInformation_inactiveSupplier_throwsException() {
        sampleSupplier.setStatus(SupplierStatus.INACTIVE);
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> supplierService.updateSupplierInformation(1L, updateRequest));

        assertEquals("Supplier is inactive and cannot be updated", exception.getMessage());
        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Cập nhật thành công nhà cung cấp đang hoạt động")
    void updateSupplierInformation_activeSupplier_updatesFields() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupplierResponse response = supplierService.updateSupplierInformation(1L, updateRequest);

        assertNotNull(response);
        assertEquals("Công ty Dược phẩm ABC - Chi nhánh 1", response.name());
        assertEquals("Trần Thị B", response.contactPerson());
        assertEquals("0907654321", response.phone());
        assertEquals("sales@abc.vn", response.email());
        assertEquals(SupplierStatus.ACTIVE, response.status());
        verify(supplierRepository, times(1)).save(sampleSupplier);
    }

    @Test
    @DisplayName("Không cho phép ngừng hoạt động nhà cung cấp đã ngừng hoạt động")
    void deleteSupplier_inactiveSupplier_throwsException() {
        sampleSupplier.setStatus(SupplierStatus.INACTIVE);
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> supplierService.deleteSupplier(1L, "Ngừng hợp tác"));

        assertEquals("Supplier is already inactive", exception.getMessage());
        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Ngừng hoạt động nhà cung cấp đang hoạt động kèm lý do")
    void deleteSupplier_activeSupplier_setsInactiveWithReason() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupplierResponse response = supplierService.deleteSupplier(1L, "  Ngừng hợp tác  ");

        assertNotNull(response);
        assertEquals(SupplierStatus.INACTIVE, response.status());
        assertEquals("Ngừng hợp tác", response.deleteReason());
        assertEquals(SupplierStatus.INACTIVE, sampleSupplier.getStatus());
        verify(supplierRepository, times(1)).save(sampleSupplier);
    }

    @Test
    @DisplayName("Cập nhật nhà cung cấp không tồn tại ném EntityNotFoundException")
    void updateSupplierInformation_notFound_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> supplierService.updateSupplierInformation(99L, updateRequest));
        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Thống kê KPI nhà cung cấp trả về số lượng theo từng trạng thái")
    void viewSupplierStatistics_returnsCountsByStatus() {
        when(supplierRepository.count()).thenReturn(21L);
        when(supplierRepository.countByStatus(SupplierStatus.ACTIVE)).thenReturn(18L);
        when(supplierRepository.countByStatus(SupplierStatus.INACTIVE)).thenReturn(2L);
        when(supplierRepository.countByStatus(SupplierStatus.PENDING)).thenReturn(1L);
        when(supplierRepository.countWithTaxCode()).thenReturn(15L);

        SupplierStatsResponse stats = supplierService.viewSupplierStatistics();

        assertNotNull(stats);
        assertEquals(21L, stats.total());
        assertEquals(18L, stats.active());
        assertEquals(2L, stats.inactive());
        assertEquals(1L, stats.pending());
        assertEquals(15L, stats.withTaxCode());
    }
}
