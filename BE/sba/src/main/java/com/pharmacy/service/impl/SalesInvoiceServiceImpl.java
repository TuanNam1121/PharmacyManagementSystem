package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.sales.*;
import com.pharmacy.entity.*;
import com.pharmacy.exception.InsufficientStockException;
import com.pharmacy.exception.NoOpenShiftException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.*;
import com.pharmacy.service.SalesInvoiceService;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesInvoiceServiceImpl implements SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesInvoiceDetailRepository salesInvoiceDetailRepository;
    private final PaymentRepository paymentRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final SalesReturnDetailRepository salesReturnDetailRepository;
    private final ShiftRepository shiftRepository;
    private final StoreRepository storeRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public SalesInvoiceResponse createSalesInvoice(CreateSalesInvoiceRequest request, Long accountId) {
        // 1. Determine and validate active Shift
        Shift shift = null;
        if (request.getShiftId() != null) {
            shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc ID: " + request.getShiftId()));
            if (shift.getStatus() != 1) {
                throw new IllegalStateException("Ca làm việc đã kết thúc hoặc không ở trạng thái mở!");
            }
        } else {
            shift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
                    .orElseThrow(() -> new NoOpenShiftException("Bạn chưa mở ca làm việc. Vui lòng mở ca trước khi tạo hóa đơn!"));
        }

        Store store = shift.getStore();
        Account cashier = accountRepository.findById(accountId).orElse(shift.getAccount());

        // 2. Customer (Optional)
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        // 3. Compute totals
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (InvoiceItemRequest item : request.getItems()) {
            BigDecimal line = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(line);
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.subtract(discount).max(BigDecimal.ZERO);

        // 4. Create and Save SalesInvoice
        String invoiceCode = generateInvoiceCode();
        SalesInvoice invoice = new SalesInvoice();
        invoice.setCode(invoiceCode);
        invoice.setStore(store);
        invoice.setShift(shift);
        invoice.setAccount(cashier);
        invoice.setCustomer(customer);
        invoice.setPrescriptionCode(request.getPrescriptionCode());
        invoice.setTotalAmount(totalAmount);
        invoice.setDiscount(discount);
        invoice.setFinalAmount(finalAmount);
        invoice.setStatus((short) 1); // 1 = PAID
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setPaidAt(LocalDateTime.now());

        SalesInvoice savedInvoice = salesInvoiceRepository.save(invoice);

        // 5. Deduct inventory & create line items
        List<SalesInvoiceDetail> savedDetails = new ArrayList<>();
        for (InvoiceItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + item.getProductId()));

            // Find Batch (FEFO if batchId not specified)
            ProductBatch batch = null;
            if (item.getBatchId() != null) {
                batch = productBatchRepository.findById(item.getBatchId()).orElse(null);
            }
            if (batch == null) {
                List<ProductBatch> availableBatches = productBatchRepository.findAvailableBatchesFEFO(product.getId(), LocalDate.now());
                if (!availableBatches.isEmpty()) {
                    batch = availableBatches.get(0);
                }
            }

            // Deduct store inventory if inventory record exists
            if (batch != null && store != null) {
                Inventory inv = inventoryRepository.findByStoreIdAndProductIdAndBatchId(store.getId(), product.getId(), batch.getId())
                        .orElse(null);
                if (inv != null) {
                    if (inv.getQuantity() < item.getQuantity()) {
                        throw new InsufficientStockException("Sản phẩm [" + product.getName() + "] chỉ còn tồn " + inv.getQuantity() + " đơn vị tại chi nhánh!");
                    }
                    inv.setQuantity(inv.getQuantity() - item.getQuantity());
                    inv.setUpdatedAt(LocalDateTime.now());
                    inventoryRepository.save(inv);
                }
            }

            SalesInvoiceDetail detail = new SalesInvoiceDetail();
            detail.setSalesInvoice(savedInvoice);
            detail.setProduct(product);
            detail.setBatch(batch);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(item.getUnitPrice());
            BigDecimal costPrice = product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO;
            detail.setUnitCost(costPrice);
            detail.setDosageInstruction(item.getDosageInstruction());

            SalesInvoiceDetail saved = salesInvoiceDetailRepository.save(detail);
            savedDetails.add(saved != null ? saved : detail);
        }
        savedInvoice.getDetails().clear();
        savedInvoice.getDetails().addAll(savedDetails);

        // 6. Record Payment
        if (request.getPayment() != null) {
            ProcessPaymentRequest payReq = request.getPayment();
            Payment payment = new Payment();
            payment.setSalesInvoice(savedInvoice);
            payment.setMethod(parsePaymentMethod(payReq.getPaymentMethod()));
            payment.setAmount(finalAmount);
            payment.setStatus((short) 1); // 1 = SUCCESS
            payment.setTransactionRef(payReq.getTransactionRef());
            payment.setPaidAt(LocalDateTime.now());
            payment.setCreatedAt(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);
            savedInvoice.getPayments().clear();
            savedInvoice.getPayments().add(savedPayment != null ? savedPayment : payment);
        }

        BigDecimal tenderedCash = request.getPayment() != null && request.getPayment().getTenderedCash() != null
                ? request.getPayment().getTenderedCash()
                : finalAmount;
        BigDecimal changeAmount = tenderedCash.subtract(finalAmount).max(BigDecimal.ZERO);

        int earnedPoints = finalAmount.divide(BigDecimal.valueOf(10_000), 0, RoundingMode.DOWN).intValue();

        return mapToSalesInvoiceResponse(savedInvoice, tenderedCash, changeAmount, earnedPoints);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesInvoiceResponse getInvoiceByCode(String code) {
        SalesInvoice invoice = salesInvoiceRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với mã: " + code));
        return mapToSalesInvoiceResponse(invoice, invoice.getFinalAmount(), BigDecimal.ZERO, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesInvoiceResponse getInvoiceById(Long id) {
        SalesInvoice invoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + id));
        return mapToSalesInvoiceResponse(invoice, invoice.getFinalAmount(), BigDecimal.ZERO, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SalesInvoiceResponse> getInvoices(Long storeId, Long shiftId, Long customerId,
                                                          String keyword, Short status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<SalesInvoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (storeId != null) {
                predicates.add(cb.equal(root.get("store").get("id"), storeId));
            }
            if (shiftId != null) {
                predicates.add(cb.equal(root.get("shift").get("id"), shiftId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate codePred = cb.like(cb.lower(root.get("code")), kw);
                Predicate custPred = cb.like(cb.lower(root.get("customer").get("fullName")), kw);
                predicates.add(cb.or(codePred, custPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SalesInvoice> invoicePage = salesInvoiceRepository.findAll(spec, pageable);

        List<SalesInvoiceResponse> content = invoicePage.getContent().stream()
                .map(inv -> mapToSalesInvoiceResponse(inv, inv.getFinalAmount(), BigDecimal.ZERO, 0))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                invoicePage.getNumber(),
                invoicePage.getSize(),
                invoicePage.getTotalElements(),
                invoicePage.getTotalPages(),
                invoicePage.isLast()
        );
    }

    @Override
    @Transactional
    public SalesReturnResponse returnSalesInvoice(SalesReturnRequest request, Long accountId) {
        SalesInvoice invoice = salesInvoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn ID: " + request.getInvoiceId()));

        if (invoice.getStatus() != 1 && invoice.getStatus() != 3) {
            throw new IllegalStateException("Hóa đơn này không ở trạng thái hợp lệ để trả hàng!");
        }

        Shift shift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
                .orElse(invoice.getShift());

        Account processor = accountRepository.findById(accountId).orElse(invoice.getAccount());

        BigDecimal totalRefund = BigDecimal.ZERO;
        String returnCode = generateReturnCode();

        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setCode(returnCode);
        salesReturn.setSalesInvoice(invoice);
        salesReturn.setShift(shift);
        salesReturn.setProcessedBy(processor);
        salesReturn.setRefundMethod(request.getRefundMethod() != null ? request.getRefundMethod() : (short) 1);
        salesReturn.setReason(request.getReason());
        salesReturn.setCreatedAt(LocalDateTime.now());
        salesReturn.setRefundAmount(BigDecimal.ZERO); // updated below

        SalesReturn savedReturn = salesReturnRepository.save(salesReturn);

        List<SalesReturnDetail> returnDetails = new ArrayList<>();
        for (SalesReturnRequest.ReturnItemRequest item : request.getItems()) {
            SalesInvoiceDetail invoiceDetail = salesInvoiceDetailRepository.findById(item.getSalesInvoiceDetailId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dòng chi tiết hóa đơn ID: " + item.getSalesInvoiceDetailId()));

            BigDecimal lineRefund = invoiceDetail.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalRefund = totalRefund.add(lineRefund);

            // Return stock to branch inventory
            if (invoiceDetail.getBatch() != null && invoice.getStore() != null) {
                Inventory inv = inventoryRepository.findByStoreIdAndProductIdAndBatchId(
                        invoice.getStore().getId(),
                        invoiceDetail.getProduct().getId(),
                        invoiceDetail.getBatch().getId()
                ).orElse(null);

                if (inv != null) {
                    inv.setQuantity(inv.getQuantity() + item.getQuantity());
                    inv.setUpdatedAt(LocalDateTime.now());
                    inventoryRepository.save(inv);
                }
            }

            SalesReturnDetail returnDetail = new SalesReturnDetail();
            returnDetail.setSalesReturn(savedReturn);
            returnDetail.setSalesInvoiceDetail(invoiceDetail);
            returnDetail.setProduct(invoiceDetail.getProduct());
            returnDetail.setBatch(invoiceDetail.getBatch());
            returnDetail.setQuantity(item.getQuantity());
            returnDetail.setUnitPrice(invoiceDetail.getUnitPrice());

            returnDetails.add(salesReturnDetailRepository.save(returnDetail));
        }

        savedReturn.setRefundAmount(totalRefund);
        savedReturn.getDetails().clear();
        savedReturn.getDetails().addAll(returnDetails);

        // Update SalesInvoice status (3 = PARTIALLY_RETURNED, 4 = FULLY_RETURNED)
        boolean isFullReturn = totalRefund.compareTo(invoice.getFinalAmount()) >= 0;
        savedReturn.setReturnType(isFullReturn ? (short) 1 : (short) 2);
        invoice.setStatus(isFullReturn ? (short) 4 : (short) 3);
        invoice.setCancelReason(request.getReason());
        salesInvoiceRepository.save(invoice);

        String processedByName = processor != null
                ? (processor.getAccountInformation() != null ? processor.getAccountInformation().getFullName() : processor.getUsername())
                : "Nhân viên";

        return SalesReturnResponse.builder()
                .returnId(savedReturn.getId())
                .returnCode(returnCode)
                .invoiceId(invoice.getId())
                .invoiceCode(invoice.getCode())
                .refundAmount(totalRefund)
                .refundMethod(savedReturn.getRefundMethod() == 1 ? "Tiền mặt" : "Chuyển khoản")
                .reason(savedReturn.getReason())
                .createdAt(savedReturn.getCreatedAt())
                .processedByName(processedByName)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesInvoiceResponse> getCustomerPurchaseHistory(Long customerId) {
        List<SalesInvoice> invoices = salesInvoiceRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId);
        return invoices.stream()
                .map(inv -> mapToSalesInvoiceResponse(inv, inv.getFinalAmount(), BigDecimal.ZERO, 0))
                .collect(Collectors.toList());
    }

    private SalesInvoiceResponse mapToSalesInvoiceResponse(SalesInvoice invoice, BigDecimal paidAmount, BigDecimal changeAmount, int earnedPoints) {
        String storeName = invoice.getStore() != null ? invoice.getStore().getName() : "Chi nhánh";
        String cashierName = invoice.getAccount() != null
                ? (invoice.getAccount().getAccountInformation() != null ? invoice.getAccount().getAccountInformation().getFullName() : invoice.getAccount().getUsername())
                : "Thu ngân";

        String customerName = invoice.getCustomer() != null ? invoice.getCustomer().getFullName() : "Khách vãng lai";
        String customerPhone = invoice.getCustomer() != null ? invoice.getCustomer().getPhone() : null;
        String customerCode = invoice.getCustomer() != null ? String.format("KH-%06d", invoice.getCustomer().getId()) : null;

        String invStatus = switch (invoice.getStatus()) {
            case 1 -> "COMPLETED";
            case 2 -> "CANCELLED";
            case 3 -> "PARTIALLY_RETURNED";
            case 4 -> "RETURNED";
            default -> "PENDING";
        };

        String paymentMethod = "CASH";
        if (invoice.getPayments() != null && !invoice.getPayments().isEmpty()) {
            Short m = invoice.getPayments().get(0).getMethod();
            if (m != null) {
                paymentMethod = switch (m) {
                    case 2 -> "BANK_TRANSFER";
                    case 3 -> "VNPAY_QR";
                    default -> "CASH";
                };
            }
        }

        List<SalesInvoiceItemResponse> itemResponses = new ArrayList<>();
        if (invoice.getDetails() != null) {
            for (SalesInvoiceDetail d : invoice.getDetails()) {
                if (d == null) continue;
                String pName = d.getProduct() != null ? d.getProduct().getName() : "Sản phẩm";
                String pCode = d.getProduct() != null ? (d.getProduct().getBarcode() != null ? d.getProduct().getBarcode() : "PRD-" + d.getProduct().getId()) : null;
                String unit = d.getProduct() != null ? d.getProduct().getUnit() : "Hộp";
                String batchNum = d.getBatch() != null ? d.getBatch().getBatchNumber() : null;
                LocalDate expDate = d.getBatch() != null ? d.getBatch().getExpiryDate() : null;
                BigDecimal lineTot = d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity()));

                itemResponses.add(SalesInvoiceItemResponse.builder()
                        .id(d.getId())
                        .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                        .productName(pName)
                        .productCode(pCode)
                        .batchId(d.getBatch() != null ? d.getBatch().getId() : null)
                        .batchNumber(batchNum)
                        .expiryDate(expDate)
                        .unit(unit)
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .lineTotal(lineTot)
                        .dosageInstruction(d.getDosageInstruction())
                        .build());
            }
        }

        return SalesInvoiceResponse.builder()
                .invoiceId(invoice.getId())
                .invoiceCode(invoice.getCode())
                .storeId(invoice.getStore() != null ? invoice.getStore().getId() : null)
                .storeName(storeName)
                .cashierId(invoice.getAccount() != null ? invoice.getAccount().getId() : null)
                .cashierName(cashierName)
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerCode(customerCode)
                .totalAmount(invoice.getTotalAmount())
                .discountAmount(invoice.getDiscount())
                .finalAmount(invoice.getFinalAmount())
                .paidAmount(paidAmount)
                .changeAmount(changeAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus("PAID")
                .invoiceStatus(invStatus)
                .statusCode(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .paidAt(invoice.getPaidAt())
                .earnedPoints(earnedPoints)
                .prescriptionCode(invoice.getPrescriptionCode())
                .items(itemResponses)
                .build();
    }

    private String generateInvoiceCode() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "INV-" + dateStr + "-" + rand;
    }

    private String generateReturnCode() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "RET-" + dateStr + "-" + rand;
    }

    private Short parsePaymentMethod(String method) {
        if (method == null) return 1;
        String m = method.trim().toUpperCase();
        if (m.contains("BANK") || m.contains("TRANSFER")) return 2;
        if (m.contains("QR") || m.contains("VNPAY")) return 3;
        return 1;
    }
}
