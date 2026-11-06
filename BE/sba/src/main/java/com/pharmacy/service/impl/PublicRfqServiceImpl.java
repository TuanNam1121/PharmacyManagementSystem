package com.pharmacy.service.impl;

import com.pharmacy.dto.rfq.PublicRfqResponse;
import com.pharmacy.dto.rfq.SubmitQuotationRequest;
import com.pharmacy.dto.rfq.PublicRfqResponse.PublicRfqItemDto;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.repository.*;
import com.pharmacy.service.PublicRfqService;
import com.pharmacy.util.SecurityUtils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicRfqServiceImpl implements PublicRfqService {

    private final RfqRepository rfqRepository;
    private final SupplierQuotationRepository supplierQuotationRepository;
    private final SupplierQuotationDetailRepository supplierQuotationDetailRepository;

    @Override
    public PublicRfqResponse getRfqDetails(String rawToken) {
        String tokenHash = SecurityUtils.sha256Hex(rawToken);
        Rfq rfq = rfqRepository.findValidRfqByTokenHash(tokenHash, LocalDateTime.now())
                .orElseThrow(() -> new EntityNotFoundException("RFQ token is invalid or expired"));

        PurchaseProposal proposal = rfq.getPurchaseProposal();
        List<PublicRfqItemDto> items = proposal == null || proposal.getDetails() == null
                ? List.of()
                : proposal.getDetails().stream()
                        .map(PublicRfqItemDto::fromEntity)
                        .toList();

        return PublicRfqResponse.fromEntity(rfq, items);
    }

    @Override
    @Transactional
    public boolean submitQuotation(String rawToken, SubmitQuotationRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Quotation must contain at least one item");
        }

        String tokenHash = SecurityUtils.sha256Hex(rawToken);
        Rfq rfq = rfqRepository.findValidRfqByTokenHash(tokenHash, LocalDateTime.now())
                .orElseThrow(() -> new EntityNotFoundException("RFQ token is invalid or expired"));

        if (rfq.getStatus() != RfqStatus.SENT) {
            throw new IllegalArgumentException("RFQ already responded or expired");
        }

        if (supplierQuotationRepository.findByRfqId(rfq.getId()).isPresent()) {
            throw new IllegalArgumentException("Quotation already submitted for this RFQ");
        }

        PurchaseProposal proposal = rfq.getPurchaseProposal();
        if (proposal == null || proposal.getDetails() == null) {
            throw new IllegalStateException("RFQ is not linked to a purchase proposal");
        }

        Map<Long, PurchaseProposalDetail> proposalDetailMap = proposal.getDetails().stream()
                .collect(Collectors.toMap(PurchaseProposalDetail::getId, d -> d, (existing, replacement) -> existing));

        // 1. Tính toán giá trị và chuẩn bị danh sách details trước
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SupplierQuotationDetail> quotationDetails = new ArrayList<>();

        // Khởi tạo quotation với tổng tiền ban đầu để gán reference
        SupplierQuotation quotation = SupplierQuotation.builder()
                .code("QT" + System.currentTimeMillis())
                .rfq(rfq)
                .supplier(rfq.getSupplier())
                .account(rfq.getSentBy())
                .quotationDate(LocalDate.now())
                .validUntil(LocalDate.now().plusDays(30))
                .status((short) 0)
                .createdAt(LocalDateTime.now())
                .build();

        for (SubmitQuotationRequest.QuotationItemDto itemDto : request.items()) {
            PurchaseProposalDetail proposalDetail = proposalDetailMap.get(itemDto.itemId());
            if (proposalDetail == null) {
                throw new IllegalArgumentException("Item ID " + itemDto.itemId() + " not found in purchase proposal");
            }

            int quantity = proposalDetail.getQuantity() != null ? proposalDetail.getQuantity() : 0;
            BigDecimal unitPrice = itemDto.unitPrice() != null ? itemDto.unitPrice() : BigDecimal.ZERO;
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            SupplierQuotationDetail detail = SupplierQuotationDetail.builder()
                    .supplierQuotation(quotation)
                    .product(proposalDetail.getProduct())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .taxRate(BigDecimal.ZERO)
                    .subtotal(subtotal)
                    .build();

            quotationDetails.add(detail);
            totalAmount = totalAmount.add(subtotal);
        }

        // 2. Gán tổng tiền và lưu Quotation 1 lần duy nhất
        quotation.setTotalAmount(totalAmount);
        SupplierQuotation savedQuotation = supplierQuotationRepository.save(quotation);

        // Lưu details
        supplierQuotationDetailRepository.saveAll(quotationDetails);

        // 3. Cập nhật RFQ
        rfq.setStatus(RfqStatus.RESPONDED);
        rfq.setResponseAt(LocalDateTime.now());
        rfq.setTokenHash(null);
        rfqRepository.save(rfq);

        log.info("Quotation submitted for RFQ {}, quotation ID: {}, total amount: {}",
                rfq.getId(), savedQuotation.getId(), totalAmount);
        return true;
    }
}