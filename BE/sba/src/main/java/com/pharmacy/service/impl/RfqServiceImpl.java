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
import com.pharmacy.entity.enums.SupplierStatus;
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
import com.pharmacy.repository.SupplierQuotationRepository;
import com.pharmacy.dto.rfq.RfqQuotationResponse;
import com.pharmacy.dto.rfq.CompareResponse;
import com.pharmacy.entity.SupplierQuotation;
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

    @Value("${app.rfq.frontend-url:http://localhost:5173}")
    private String rfqFrontendUrl;

    @Override
    public List<PurchaseProposalResponse> getEligiblePurchaseProposals() {
        // Proposals that have not yet chosen a supplier are eligible to send RFQ emails.
        // "Đang chào giá RFQ" (RFQ_SENT) still qualifies so more suppliers can be invited.
        return purchaseProposalRepository.findByStatusIn(
                List.of(PurchaseProposalStatus.DRAFT.getCode(),
                        PurchaseProposalStatus.RFQ_SENT.getCode()))
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

        // Inactive suppliers must not receive quotation requests
        if (SupplierStatus.INACTIVE.equals(supplier.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot send RFQ to supplier '" + supplier.getCode() + "': supplier is inactive");
        }

        // Validate the aggregated purchase proposal (source of the RFQ)
        PurchaseProposal proposal = purchaseProposalRepository.findById(request.purchaseProposalId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Purchase proposal not found with ID: " + request.purchaseProposalId()));

        // Only proposals that have not yet chosen a supplier can send an RFQ.
        Short proposalStatus = proposal.getStatus();
        if (proposalStatus == null
                || (!proposalStatus.equals(PurchaseProposalStatus.DRAFT.getCode())
                        && !proposalStatus.equals(PurchaseProposalStatus.RFQ_SENT.getCode()))) {
            throw new IllegalArgumentException(
                    "Chỉ đề xuất chưa chọn nhà cung cấp mới được gửi RFQ");
        }

        // Block sending only if an RFQ for this supplier + proposal is still active.
        List<Rfq> existingRfqs = rfqRepository
                .findBySupplierIdAndPurchaseProposalId(supplier.getId(), proposal.getId());
        LocalDateTime now = LocalDateTime.now();
        boolean hasActiveRfq = existingRfqs.stream().anyMatch(r ->
                r.getStatus() == RfqStatus.RESPONDED
                        || (r.getStatus() == RfqStatus.SENT
                                && (r.getExpiredAt() == null || r.getExpiredAt().isAfter(now))));
        if (hasActiveRfq) {
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
                .sentAt(now)
                .createdAt(now)
                .build();

        Rfq savedRfq = rfqRepository.save(rfq);

        // First RFQ sent => proposal moves to the "Đang chào giá RFQ" (RFQ_SENT) state.
        if (proposal.getStatus() == null
                || proposal.getStatus().equals(PurchaseProposalStatus.DRAFT.getCode())) {
            proposal.setStatus(PurchaseProposalStatus.RFQ_SENT.getCode());
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

        // Validate the recipient first so the client is warned immediately (e.g. wrong email),
        // then attempt to send. The RFQ is always saved so the flow still works for testing.
        String emailWarning = emailService.validateRecipient(supplier.getEmail());
        boolean emailSent = emailService.sendRfqEmail(savedRfq, supplier, rawToken, rfqFrontendUrl);
        if (!emailSent) {
            log.error("Failed to send email for RFQ {}, but RFQ is saved", savedRfq.getId());
            if (emailWarning == null) {
                emailWarning = "Không gửi được email tới " + supplier.getEmail()
                        + " (vui lòng kiểm tra cấu hình SMTP).";
            }
        }

        return RfqResponse.fromEntity(savedRfq, emailSent, emailWarning);
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