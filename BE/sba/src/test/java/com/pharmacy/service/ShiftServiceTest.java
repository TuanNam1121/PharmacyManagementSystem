package com.pharmacy.service;

import com.pharmacy.dto.sales.CloseShiftRequest;
import com.pharmacy.dto.sales.OpenShiftRequest;
import com.pharmacy.dto.sales.ShiftDetailResponse;
import com.pharmacy.dto.sales.ShiftSummaryResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.Shift;
import com.pharmacy.entity.Store;
import com.pharmacy.exception.ShiftAlreadyOpenException;
import com.pharmacy.repository.*;
import com.pharmacy.service.impl.ShiftServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private SalesInvoiceRepository salesInvoiceRepository;

    @Mock
    private SalesReturnRepository salesReturnRepository;

    @InjectMocks
    private ShiftServiceImpl shiftService;

    private Store sampleStore;
    private Account sampleAccount;
    private Shift sampleShift;

    @BeforeEach
    void setUp() {
        sampleStore = new Store();
        sampleStore.setId(1L);
        sampleStore.setName("Pharmacy Branch 1");

        sampleAccount = new Account();
        sampleAccount.setId(10L);
        sampleAccount.setUsername("cashier01");

        sampleShift = new Shift();
        sampleShift.setId(100L);
        sampleShift.setStore(sampleStore);
        sampleShift.setAccount(sampleAccount);
        sampleShift.setOpenedAt(LocalDateTime.now());
        sampleShift.setOpeningCash(BigDecimal.valueOf(1500000));
        sampleShift.setExpectedCash(BigDecimal.valueOf(1500000));
        sampleShift.setStatus((short) 1);
    }

    @Test
    @DisplayName("TC-SFT-01: Mở ca làm việc thành công khi chưa có ca mở")
    void testOpenShiftSuccess() {
        OpenShiftRequest request = OpenShiftRequest.builder()
                .storeId(1L)
                .openingCash(BigDecimal.valueOf(1500000))
                .note("Đầu ca")
                .build();

        when(shiftRepository.existsByAccount_IdAndStatus(10L, (short) 1)).thenReturn(false);
        when(storeRepository.findById(1L)).thenReturn(Optional.of(sampleStore));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(shiftRepository.save(any(Shift.class))).thenReturn(sampleShift);

        ShiftDetailResponse response = shiftService.openShift(request, 10L);

        assertNotNull(response);
        assertEquals(100L, response.getShiftId());
        assertEquals("OPEN", response.getStatus());
        assertEquals(BigDecimal.valueOf(1500000), response.getOpeningCash());
        verify(shiftRepository, times(1)).save(any(Shift.class));
    }

    @Test
    @DisplayName("TC-SFT-02: Mở ca thất bại khi nhân viên đang có ca OPEN")
    void testOpenShiftAlreadyOpen() {
        OpenShiftRequest request = OpenShiftRequest.builder()
                .storeId(1L)
                .openingCash(BigDecimal.valueOf(1500000))
                .build();

        when(shiftRepository.existsByAccount_IdAndStatus(10L, (short) 1)).thenReturn(true);

        assertThrows(ShiftAlreadyOpenException.class, () -> {
            shiftService.openShift(request, 10L);
        });
    }

    @Test
    @DisplayName("TC-SFT-03: Chốt ca làm việc thành công")
    void testCloseShiftSuccess() {
        CloseShiftRequest request = CloseShiftRequest.builder()
                .shiftId(100L)
                .closingCashActual(BigDecimal.valueOf(2500000))
                .note("Két cân khớp")
                .build();

        when(shiftRepository.findById(100L)).thenReturn(Optional.of(sampleShift));
        when(paymentRepository.sumAmountByShiftAndMethod(100L, (short) 1)).thenReturn(BigDecimal.valueOf(1000000));
        when(salesReturnRepository.sumCashRefundsByShift(100L)).thenReturn(BigDecimal.ZERO);
        when(shiftRepository.save(any(Shift.class))).thenReturn(sampleShift);

        ShiftDetailResponse response = shiftService.closeShift(request, 10L);

        assertNotNull(response);
        assertEquals((short) 2, sampleShift.getStatus());
        assertEquals(BigDecimal.valueOf(2500000), sampleShift.getClosingCash());
        assertEquals(BigDecimal.valueOf(2500000), sampleShift.getExpectedCash());
        verify(shiftRepository, times(1)).save(sampleShift);
    }
}

