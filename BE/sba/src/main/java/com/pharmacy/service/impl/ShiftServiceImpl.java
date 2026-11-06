package com.pharmacy.service.impl;

import com.pharmacy.dto.sales.CloseShiftRequest;
import com.pharmacy.dto.sales.OpenShiftRequest;
import com.pharmacy.dto.sales.ShiftDetailResponse;
import com.pharmacy.dto.sales.ShiftSummaryResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.Shift;
import com.pharmacy.entity.Store;
import com.pharmacy.exception.NoOpenShiftException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.exception.ShiftAlreadyOpenException;
import com.pharmacy.repository.*;
import com.pharmacy.service.ShiftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final StoreRepository storeRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesReturnRepository salesReturnRepository;

    @Override
    @Transactional
    public ShiftDetailResponse openShift(OpenShiftRequest request, Long accountId) {
        boolean hasActiveShift = shiftRepository.existsByAccount_IdAndStatus(accountId, (short) 1);
        if (hasActiveShift) {
            throw new ShiftAlreadyOpenException("Bạn đang có một ca làm việc chưa kết thúc!");
        }

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + request.getStoreId()));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));

        Shift shift = new Shift();
        shift.setStore(store);
        shift.setAccount(account);
        shift.setOpenedAt(LocalDateTime.now());
        shift.setOpeningCash(request.getOpeningCash());
        shift.setExpectedCash(request.getOpeningCash());
        shift.setStatus((short) 1); // 1 = OPEN
        shift.setNote(request.getNote());

        Shift saved = shiftRepository.save(shift);
        return mapToShiftDetailResponse(saved);
    }

    @Override
    @Transactional
    public ShiftDetailResponse closeShift(CloseShiftRequest request, Long accountId) {
        Long targetShiftId = request.getShiftId();
        if (targetShiftId == null && accountId != null) {
            Shift activeShift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1).orElse(null);
            if (activeShift != null) {
                targetShiftId = activeShift.getId();
            }
        }
        if (targetShiftId == null) {
            throw new IllegalArgumentException("Không xác định được mã ca làm việc cần chốt!");
        }

        final Long shiftIdToClose = targetShiftId;
        Shift shift = shiftRepository.findById(shiftIdToClose)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc với ID: " + shiftIdToClose));

        if (shift.getStatus() != 1) {
            throw new IllegalStateException("Ca làm việc này đã được chốt trước đó!");
        }

        BigDecimal openingCash = shift.getOpeningCash() != null ? shift.getOpeningCash() : BigDecimal.ZERO;
        BigDecimal cashSales = paymentRepository.sumAmountByShiftAndMethod(shift.getId(), (short) 1);
        if (cashSales == null) cashSales = BigDecimal.ZERO;

        BigDecimal cashRefunds = salesReturnRepository.sumCashRefundsByShift(shift.getId());
        if (cashRefunds == null) cashRefunds = BigDecimal.ZERO;

        BigDecimal expectedCash = openingCash.add(cashSales).subtract(cashRefunds);
        BigDecimal closingCash = request.getClosingCashActual() != null ? request.getClosingCashActual() : expectedCash;
        BigDecimal difference = closingCash.subtract(expectedCash);

        // If discrepancy != 0 and note is blank, require explanation
        if (difference.compareTo(BigDecimal.ZERO) != 0 && (request.getNote() == null || request.getNote().isBlank())) {
            throw new IllegalArgumentException("Vui lòng nhập lý do giải trình khi két tiền bị chênh lệch!");
        }

        shift.setClosedAt(LocalDateTime.now());
        shift.setExpectedCash(expectedCash);
        shift.setClosingCash(closingCash);
        shift.setStatus((short) 2); // 2 = CLOSED
        shift.setNote(request.getNote());

        Shift saved = shiftRepository.save(shift);
        return mapToShiftDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftDetailResponse getCurrentShift(Long accountId) {
        return shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
                .map(this::mapToShiftDetailResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftSummaryResponse getCurrentShiftSummary(Long accountId) {
        Shift shift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
                .orElseThrow(() -> new NoOpenShiftException("Bạn chưa mở ca làm việc nào!"));

        String cashierName = shift.getAccount() != null
                ? (shift.getAccount().getAccountInformation() != null ? shift.getAccount().getAccountInformation().getFullName() : shift.getAccount().getUsername())
                : "Thu ngân";

        String storeName = shift.getStore() != null ? shift.getStore().getName() : "Chi nhánh";

        BigDecimal openingCash = shift.getOpeningCash() != null ? shift.getOpeningCash() : BigDecimal.ZERO;
        BigDecimal cashSales = paymentRepository.sumAmountByShiftAndMethod(shift.getId(), (short) 1);
        if (cashSales == null) cashSales = BigDecimal.ZERO;

        BigDecimal qrSales = paymentRepository.sumAmountByShiftAndMethod(shift.getId(), (short) 3);
        if (qrSales == null) qrSales = BigDecimal.ZERO;

        BigDecimal cardSales = paymentRepository.sumAmountByShiftAndMethod(shift.getId(), (short) 2);
        if (cardSales == null) cardSales = BigDecimal.ZERO;

        BigDecimal totalSales = cashSales.add(qrSales).add(cardSales);

        BigDecimal cashRefunds = salesReturnRepository.sumCashRefundsByShift(shift.getId());
        if (cashRefunds == null) cashRefunds = BigDecimal.ZERO;

        BigDecimal expectedCash = openingCash.add(cashSales).subtract(cashRefunds);
        long totalInvoices = salesInvoiceRepository.countByShift_Id(shift.getId());

        return ShiftSummaryResponse.builder()
                .shiftId(shift.getId())
                .cashierName(cashierName)
                .storeName(storeName)
                .openingTime(shift.getOpenedAt())
                .openingCash(openingCash)
                .totalInvoices((int) totalInvoices)
                .cashSales(cashSales)
                .qrSales(qrSales)
                .cardSales(cardSales)
                .totalSales(totalSales)
                .refundCash(cashRefunds)
                .expectedCash(expectedCash)
                .build();
    }

    private ShiftDetailResponse mapToShiftDetailResponse(Shift shift) {
        String storeName = shift.getStore() != null ? shift.getStore().getName() : null;
        String cashierName = shift.getAccount() != null
                ? (shift.getAccount().getAccountInformation() != null ? shift.getAccount().getAccountInformation().getFullName() : shift.getAccount().getUsername())
                : null;

        String statusLabel = switch (shift.getStatus()) {
            case 1 -> "OPEN";
            case 2 -> "CLOSED";
            case 3 -> "RECONCILED";
            default -> "UNKNOWN";
        };

        BigDecimal diff = null;
        if (shift.getClosingCash() != null && shift.getExpectedCash() != null) {
            diff = shift.getClosingCash().subtract(shift.getExpectedCash());
        }

        return ShiftDetailResponse.builder()
                .shiftId(shift.getId())
                .storeId(shift.getStore() != null ? shift.getStore().getId() : null)
                .storeName(storeName)
                .accountId(shift.getAccount() != null ? shift.getAccount().getId() : null)
                .cashierName(cashierName)
                .openingTime(shift.getOpenedAt())
                .closingTime(shift.getClosedAt())
                .openingCash(shift.getOpeningCash())
                .closingCash(shift.getClosingCash())
                .calculatedCash(shift.getExpectedCash())
                .difference(diff)
                .status(statusLabel)
                .statusCode(shift.getStatus())
                .note(shift.getNote())
                .build();
    }
}
