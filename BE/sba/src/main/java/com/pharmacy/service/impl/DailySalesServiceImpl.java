package com.pharmacy.service.impl;

import com.pharmacy.dto.sales.*;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.DailySalesReconciliationStatus;
import com.pharmacy.entity.enums.SalesInvoiceStatus;
import com.pharmacy.repository.*;
import com.pharmacy.service.DailySalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailySalesServiceImpl implements DailySalesService {

        private final DailySalesReconciliationRepository reconciliationRepository;
        private final SalesInvoiceRepository invoiceRepository;
        private final ShiftRepository shiftRepository;
        private final AuditLogRepository auditLogRepository;
        private final StoreRepository storeRepository;
        // private final AccountRepository accountRepository;

        @Override
        @Transactional(readOnly = true)
        public DailySalesOverviewDto getDailySalesOverview(Long storeId, LocalDate businessDate) {
                Store store = storeRepository.findById(storeId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Store not found with ID: " + storeId));

                LocalDateTime startOfDay = businessDate.atStartOfDay();
                LocalDateTime endOfDay = businessDate.atTime(LocalTime.MAX);

                // Retrieve daily invoices
                List<SalesInvoice> invoices = invoiceRepository.findInvoicesByDateRange(startOfDay, endOfDay);
                List<Shift> shifts = shiftRepository.findShiftsByStoreAndDateRange(storeId, startOfDay, endOfDay);

                // Calculate revenue by payment method (system)
                BigDecimal systemTotal = invoices.stream()
                                .filter(i -> i.getStatus() != null && i.getStatus().equals(SalesInvoiceStatus.PAID.getCode())) // PAID
                                .map(SalesInvoice::getFinalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // System breakdown by payment method (Cash ~40%, Bank ~40%, VNPay ~20%)
                BigDecimal systemCash = systemTotal.multiply(new BigDecimal("0.40"));
                BigDecimal systemBank = systemTotal.multiply(new BigDecimal("0.40"));
                BigDecimal systemVnpay = systemTotal.subtract(systemCash).subtract(systemBank);

                // Check if reconciliation record already exists in database
                Optional<DailySalesReconciliation> existing = reconciliationRepository
                                .findByStoreIdAndBusinessDate(storeId, businessDate);

                BigDecimal actualCash = existing.map(DailySalesReconciliation::getActualCash).orElse(systemCash);
                BigDecimal difference = existing.map(DailySalesReconciliation::getDifference)
                                .orElse(actualCash.subtract(systemCash));
                Short status = existing.map(DailySalesReconciliation::getStatus).orElse(DailySalesReconciliationStatus.OPEN.getCode());
                String note = existing.map(DailySalesReconciliation::getNote).orElse("");
                String reconciledByName = existing.flatMap(r -> Optional.ofNullable(r.getReconciledBy()))
                                .map(Account::getUsername).orElse(null);
                LocalDateTime reconciledAt = existing.map(DailySalesReconciliation::getReconciledAt).orElse(null);

                return DailySalesOverviewDto.builder()
                                .storeId(store.getId())
                                .storeName(store.getName())
                                .storeCode(store.getCode())
                                .businessDate(businessDate)
                                .systemCash(systemCash)
                                .systemBank(systemBank)
                                .systemVnpay(systemVnpay)
                                .systemTotal(systemTotal)
                                .actualCash(actualCash)
                                .difference(difference)
                                .status(status)
                                .note(note)
                                .reconciledByName(reconciledByName)
                                .reconciledAt(reconciledAt)
                                .totalInvoices(invoices.size())
                                .totalShifts(shifts.size())
                                .growthPercentageVsYesterday(12.5) // demo delta
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public Page<SalesInvoiceSummaryDto> getDailyInvoices(Long storeId, LocalDate businessDate, Pageable pageable) {
                LocalDateTime startOfDay = businessDate.atStartOfDay();
                LocalDateTime endOfDay = businessDate.atTime(LocalTime.MAX);

                return invoiceRepository.findInvoicesByDateRangePaged(startOfDay, endOfDay, pageable)
                                .map(inv -> SalesInvoiceSummaryDto.builder()
                                                .id(inv.getId())
                                                .code(inv.getCode())
                                                .prescriptionCode(inv.getPrescriptionCode())
                                                .totalAmount(inv.getTotalAmount())
                                                .discount(inv.getDiscount())
                                                .finalAmount(inv.getFinalAmount())
                                                .status(inv.getStatus())
                                                .createdAt(inv.getCreatedAt())
                                                .paidAt(inv.getPaidAt())
                                                .paymentMethod("Cash") // Default cash or join Payment entity
                                                .build());
        }

        @Override
        @Transactional(readOnly = true)
        public List<ShiftSummaryDto> getDailyShifts(Long storeId, LocalDate businessDate) {
                LocalDateTime startOfDay = businessDate.atStartOfDay();
                LocalDateTime endOfDay = businessDate.atTime(LocalTime.MAX);

                return shiftRepository.findShiftsByStoreAndDateRange(storeId, startOfDay, endOfDay)
                                .stream()
                                .map(s -> ShiftSummaryDto.builder()
                                                .id(s.getId())
                                                .cashierUsername(s.getAccount() != null ? s.getAccount().getUsername()
                                                                : "N/A")
                                                .openedAt(s.getOpenedAt())
                                                .closedAt(s.getClosedAt())
                                                .openingCash(s.getOpeningCash())
                                                .closingCash(s.getClosingCash())
                                                .expectedCash(s.getExpectedCash())
                                                .difference(s.getDifference())
                                                .status(s.getStatus())
                                                .note(s.getNote())
                                                .build())
                                .toList();
        }

        @Override
        @Transactional
        public DailySalesOverviewDto reconcileDailySales(DailySalesReconcileRequest request, String currentUsername,
                        String clientIp) {
                Store store = storeRepository.findById(request.getStoreId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Store not found with ID: " + request.getStoreId()));

                // Account actor = accountRepository.findByUsername(currentUsername)
                // .orElse(null);

                // Fetch or create new DailySalesReconciliation record
                DailySalesReconciliation reconciliation = reconciliationRepository
                                .findByStoreIdAndBusinessDate(request.getStoreId(), request.getBusinessDate())
                                .orElseGet(() -> {
                                        DailySalesReconciliation newRecord = new DailySalesReconciliation();
                                        newRecord.setStore(store);
                                        newRecord.setBusinessDate(request.getBusinessDate());
                                        return newRecord;
                                });

                // Calculate system revenues
                LocalDateTime startOfDay = request.getBusinessDate().atStartOfDay();
                LocalDateTime endOfDay = request.getBusinessDate().atTime(LocalTime.MAX);
                List<SalesInvoice> invoices = invoiceRepository.findInvoicesByDateRange(startOfDay, endOfDay);
                BigDecimal systemTotal = invoices.stream()
                                .filter(i -> i.getStatus() != null && i.getStatus().equals(SalesInvoiceStatus.PAID.getCode()))
                                .map(SalesInvoice::getFinalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal systemCash = systemTotal.multiply(new BigDecimal("0.40"));
                BigDecimal systemBank = systemTotal.multiply(new BigDecimal("0.40"));
                BigDecimal systemVnpay = systemTotal.subtract(systemCash).subtract(systemBank);

                reconciliation.setSystemCash(systemCash);
                reconciliation.setSystemBank(systemBank);
                reconciliation.setSystemVnpay(systemVnpay);
                reconciliation.setSystemTotal(systemTotal);

                String oldValue = String.format("actualCash=%s, difference=%s, status=%s",
                                reconciliation.getActualCash(), reconciliation.getDifference(),
                                reconciliation.getStatus());

                // Update actual values
                reconciliation.setActualCash(request.getActualCash());
                // reconciliation.setDifference(request.getActualCash().subtract(systemCash));
                reconciliation.setNote(request.getNote());
                reconciliation.setStatus(DailySalesReconciliationStatus.RECONCILED.getCode()); // Reconciled
                // reconciliation.setReconciledBy(actor);
                reconciliation.setReconciledAt(LocalDateTime.now());

                reconciliation = reconciliationRepository.save(reconciliation);

                // Record AuditLog
                AuditLog auditLog = new AuditLog();
                // auditLog.setAccount(actor);
                auditLog.setAction((short) 2); // 2: UPDATE / RECONCILE
                auditLog.setEntityName("DailySalesReconciliation");
                auditLog.setEntityId(reconciliation.getId());
                auditLog.setOldValue(oldValue);
                auditLog.setNewValue(String.format("actualCash=%s, difference=%s, status=1, note=%s",
                                request.getActualCash(), reconciliation.getDifference(), request.getNote()));
                auditLog.setIpAddress(clientIp);
                auditLog.setCreatedAt(LocalDateTime.now());
                auditLogRepository.save(auditLog);

                return getDailySalesOverview(request.getStoreId(), request.getBusinessDate());
        }
}