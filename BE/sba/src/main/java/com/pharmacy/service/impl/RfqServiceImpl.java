package com.pharmacy.service.impl;

import com.pharmacy.dto.rfq.RfqResponse;
import com.pharmacy.dto.rfq.SendRfqRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.repository.RfqRepository;
import com.pharmacy.repository.SupplierRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.service.EmailService;
import com.pharmacy.service.RfqService;
import com.pharmacy.util.SecurityUtils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.repository.SupplierQuotationRepository;
import com.pharmacy.dto.rfq.RecordQuotationRequest;
import com.pharmacy.dto.rfq.RfqQuotationResponse;
import com.pharmacy.dto.rfq.CompareResponse;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RfqServiceImpl implements RfqService {

    private final RfqRepository rfqRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseProposalRepository purchaseProposalRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final SupplierQuotationRepository supplierQuotationRepository;
    private final SupplierQuotationDetailRepository supplierQuotationDetailRepository;
    private final ProductRepository productRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public List<PurchaseProposalResponse> getEligiblePurchaseProposals() {
        // Proposals created by purchasing staff or approved are eligible for RFQ
        return purchaseProposalRepository.findByStatusIn(
                List.of(PurchaseProposalStatus.DRAFT.getCode(), PurchaseProposalStatus.PENDING_APPROVAL.getCode(), PurchaseProposalStatus.APPROVED.getCode()))
                .stream()
                .map(PurchaseProposalResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public RfqResponse sendRfq(SendRfqRequest request) {
        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with ID: " + request.supplierId()));

        // Validate the aggregated purchase proposal (source of the RFQ)
        PurchaseProposal proposal = purchaseProposalRepository.findById(request.purchaseProposalId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Purchase proposal not found with ID: " + request.purchaseProposalId()));

        // Proposal must be active (draft, pending approval, or approved) to send an RFQ
        Short proposalStatus = proposal.getStatus();
        if (proposalStatus == null
                || (!proposalStatus.equals(PurchaseProposalStatus.DRAFT.getCode())
                        && !proposalStatus.equals(PurchaseProposalStatus.PENDING_APPROVAL.getCode())
                        && !proposalStatus.equals(PurchaseProposalStatus.APPROVED.getCode()))) {
            throw new IllegalArgumentException("Purchase proposal must be active to send RFQ");
        }

        // Check if RFQ already sent for this supplier and purchase proposal
        if (rfqRepository.existsBySupplierIdAndPurchaseProposalId(supplier.getId(), proposal.getId())) {
            throw new IllegalArgumentException(
                    "RFQ already sent to this supplier for the same purchase proposal");
        }

        // Generate RFQ code
        String rfqCode = "RFQ" + System.currentTimeMillis();

        // Generate random token
        String rawToken = UUID.randomUUID().toString().replace("-", "");

        // Hash token with SHA-256
        String tokenHash = SecurityUtils.sha256Hex(rawToken);

        // Calculate expiration (3 days from now)
        LocalDateTime expiredAt = LocalDateTime.now().plusDays(3);

        Account currentAccount = getCurrentAccount();
        PurchaseRequest legacyPr = (proposal.getRequests() != null && !proposal.getRequests().isEmpty())
                ? proposal.getRequests().get(0).getPurchaseRequest()
                : null;

        // Create RFQ entity - built from the aggregated purchase proposal
        Rfq rfq = Rfq.builder()
                .code(rfqCode)
                .supplier(supplier)
                .purchaseProposal(proposal)
                .purchaseRequest(legacyPr)
                .createdBy(currentAccount)
                .sentBy(currentAccount)
                .tokenHash(tokenHash)
                .expiredAt(expiredAt)
                .subject(request.subject())
                .content(request.content())
                .status(RfqStatus.SENT)
                .sentAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        // Save RFQ
        Rfq savedRfq = rfqRepository.save(rfq);

        // Update proposal status to PENDING_APPROVAL (1: Chờ phê duyệt / Đang chào giá RFQ)
        if (PurchaseProposalStatus.DRAFT.getCode().equals(proposal.getStatus())) {
            proposal.setStatus(PurchaseProposalStatus.PENDING_APPROVAL.getCode());
            purchaseProposalRepository.save(proposal);
        }

        // Move every aggregated purchase request to RFQ_SENT
        if (proposal.getRequests() != null) {
            for (PurchaseProposalRequest link : proposal.getRequests()) {
                PurchaseRequest pr = link.getPurchaseRequest();
                if (pr != null && !PurchaseRequestStatus.RFQ_SENT.getCode().equals(pr.getStatus())) {
                    pr.setStatus(PurchaseRequestStatus.RFQ_SENT.getCode());
                    pr.setUpdatedAt(LocalDateTime.now());
                    purchaseRequestRepository.save(pr);
                }
            }
        }

        // Send email to supplier
        boolean emailSent = emailService.sendRfqEmail(savedRfq, supplier, rawToken, frontendUrl);
        if (!emailSent) {
            log.error("Failed to send email for RFQ {}, but RFQ is saved", savedRfq.getId());
        }

        return RfqResponse.fromEntity(savedRfq);
    }

    @Override
    public Page<RfqResponse> getRfqsBySupplier(Long supplierId, Pageable pageable) {
        // Get RFQs by supplier and map to response
        return rfqRepository.findBySupplierId(supplierId, pageable)
                .map(RfqResponse::fromEntity);
    }

    @Override
    public RfqResponse getRfqById(Long rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new EntityNotFoundException("RFQ not found with ID: " + rfqId));
        return RfqResponse.fromEntity(rfq);
    }

    @Override
    public Page<RfqResponse> getRfqsWithFilters(String search, RfqStatus status, Long supplierId,
            Long purchaseRequestId, Pageable pageable) {
        Page<Rfq> rfqs = rfqRepository.findAllWithFilters(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                status,
                supplierId,
                purchaseRequestId,
                pageable);
        return rfqs.map(RfqResponse::fromEntity);
    }

    @Override
    public RfqQuotationResponse getRfqWithQuotationDetails(Long rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new EntityNotFoundException("RFQ not found with ID: " + rfqId));

        SupplierQuotation quotation = supplierQuotationRepository.findByRfqIdWithDetails(rfqId).orElse(null);

        return RfqQuotationResponse.from(rfq, quotation);
    }

    @Override
    public CompareResponse compareRfqs(List<Long> rfqIds) {
        if (rfqIds == null || rfqIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 RFQs are required for comparison");
        }

        List<Rfq> rfqs = rfqRepository.findAllByIdWithRelations(rfqIds);
        if (rfqs.size() != rfqIds.size()) {
            throw new EntityNotFoundException("One or more RFQs not found");
        }

        PurchaseProposal proposal = rfqs.get(0).getPurchaseProposal();
        if (proposal == null) {
            throw new IllegalArgumentException("RFQs are not linked to a purchase proposal");
        }
        boolean diffProposal = rfqs.stream()
                .anyMatch(r -> r.getPurchaseProposal() == null
                        || !r.getPurchaseProposal().getId().equals(proposal.getId()));
        if (diffProposal) {
            throw new IllegalArgumentException("All RFQs must belong to the same purchase proposal");
        }

        List<Long> respondedIds = rfqs.stream()
                .filter(r -> r.getStatus() == RfqStatus.RESPONDED)
                .map(Rfq::getId)
                .toList();

        List<SupplierQuotation> quotations = respondedIds.isEmpty()
                ? Collections.emptyList()
                : supplierQuotationRepository.findByRfqIdInWithDetails(respondedIds);

        // Build the comparison straight from the aggregated purchase proposal
        return CompareResponse.from(proposal, rfqs, quotations);
    }

    @Override
    @Transactional
    public RfqQuotationResponse recordQuotation(Long rfqId, RecordQuotationRequest request) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new EntityNotFoundException("RFQ not found with ID: " + rfqId));

        PurchaseProposal proposal = rfq.getPurchaseProposal();
        if (proposal == null) {
            throw new IllegalStateException("RFQ is not linked to a purchase proposal");
        }

        SupplierQuotation existing = supplierQuotationRepository.findByRfqId(rfqId).orElse(null);
        if (existing != null) {
            supplierQuotationDetailRepository.deleteAll(existing.getDetails());
            supplierQuotationRepository.delete(existing);
            supplierQuotationRepository.flush();
        }

        String quoCode = (request.getQuotationCode() != null && !request.getQuotationCode().trim().isEmpty())
                ? request.getQuotationCode().trim()
                : "QUO-" + (rfq.getSupplier() != null ? rfq.getSupplier().getCode() : "SUP") + "-" + (System.currentTimeMillis() % 100000);

        LocalDate validUntil = request.getValidUntil() != null
                ? request.getValidUntil()
                : LocalDate.now().plusDays(30);

        SupplierQuotation quotation = SupplierQuotation.builder()
                .code(quoCode)
                .rfq(rfq)
                .supplier(rfq.getSupplier())
                .account(getCurrentAccount())
                .quotationDate(LocalDate.now())
                .validUntil(validUntil)
                .status((short) 1) // 1 = Received / Valid
                .totalAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .details(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<SupplierQuotationDetail> details = new ArrayList<>();

        if (request.getItems() != null) {
            for (RecordQuotationRequest.ItemQuoteDto item : request.getItems()) {
                Product p = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new EntityNotFoundException("Product not found: " + item.getProductId()));
                int qty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
                BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty));

                SupplierQuotationDetail d = SupplierQuotationDetail.builder()
                        .supplierQuotation(quotation)
                        .product(p)
                        .quantity(qty)
                        .unitPrice(price)
                        .taxRate(item.getTaxRate() != null ? item.getTaxRate() : BigDecimal.ZERO)
                        .subtotal(subtotal)
                        .build();
                details.add(d);
                total = total.add(subtotal);
            }
        }

        quotation.setTotalAmount(total);
        quotation.getDetails().addAll(details);
        SupplierQuotation savedQuotation = supplierQuotationRepository.save(quotation);
        supplierQuotationDetailRepository.saveAll(details);

        // Update RFQ status to RESPONDED
        rfq.setStatus(RfqStatus.RESPONDED);
        rfq.setResponseAt(LocalDateTime.now());
        if (request.getNote() != null) {
            rfq.setResponseNote(request.getNote().trim());
        }
        rfqRepository.save(rfq);

        // Link proposal to this quotation and update proposal total
        proposal.setSupplierQuotation(savedQuotation);
        proposal.setTotalAmount(total);
        proposal.setStatus(PurchaseProposalStatus.PENDING_APPROVAL.getCode()); // 1 = Chờ phê duyệt PO
        purchaseProposalRepository.save(proposal);

        return getRfqWithQuotationDetails(rfqId);
    }

    private Account getCurrentAccount() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            var acc = accountRepository.findByUsername(auth.getName());
            if (acc.isPresent()) return acc.get();
        }
        return accountRepository.findByUsername("purchasing01")
                .or(() -> accountRepository.findByUsername("admin"))
                .or(() -> accountRepository.findAll().stream().findFirst())
                .orElse(null);
    }
}