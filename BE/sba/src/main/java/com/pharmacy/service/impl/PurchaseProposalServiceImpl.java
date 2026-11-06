package com.pharmacy.service.impl;

import com.pharmacy.dto.purchaseproposal.CreatePurchaseProposalRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.PurchaseRequestDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseProposalRequestRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.service.PurchaseProposalService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseProposalServiceImpl implements PurchaseProposalService {

    private final PurchaseProposalRepository purchaseProposalRepository;
    private final PurchaseProposalRequestRepository purchaseProposalRequestRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public PurchaseProposalResponse createPurchaseProposal(CreatePurchaseProposalRequest request) {
        List<Long> requestedIds = request.getPurchaseRequestIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            throw new IllegalArgumentException("At least one purchase request is required");
        }

        // De-duplicate while preserving order
        List<Long> distinctIds = requestedIds.stream().distinct().toList();

        // Load and validate every purchase request
        List<PurchaseRequest> purchaseRequests = new ArrayList<>();
        for (Long prId : distinctIds) {
            PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                    .orElseThrow(() -> new EntityNotFoundException("Purchase request not found with ID: " + prId));

            if (!PurchaseRequestStatus.SUBMITTED.getCode().equals(pr.getStatus())) {
                throw new IllegalStateException("Purchase request " + pr.getCode()
                        + " must be in SUBMITTED status to be aggregated into a proposal. Current status: "
                        + PurchaseRequestStatus.resolveText(pr.getStatus()));
            }

            if (purchaseProposalRequestRepository.existsByPurchaseRequestId(prId)) {
                throw new IllegalStateException("Purchase request " + pr.getCode()
                        + " is already part of a purchase proposal");
            }

            purchaseRequests.add(pr);
        }

        // Generate proposal code: PP-YYYYMMDD-####
        String code = generateProposalCode();

        // Get current account (created by)
        Account createdBy = getCurrentAccount();

        PurchaseProposal proposal = PurchaseProposal.builder()
                .code(code)
                .requests(new ArrayList<>())
                .details(new ArrayList<>())
                .createdBy(createdBy)
                .status(PurchaseProposalStatus.PENDING.getCode())
                .totalAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        // Consolidate items: sum requested quantity per product across all PRs
        Map<Long, PurchaseProposalDetail> consolidated = new LinkedHashMap<>();
        for (PurchaseRequest pr : purchaseRequests) {
            proposal.getRequests().add(PurchaseProposalRequest.builder()
                    .purchaseProposal(proposal)
                    .purchaseRequest(pr)
                    .build());

            for (PurchaseRequestDetail detail : pr.getDetails()) {
                if (detail.getProduct() == null) {
                    continue;
                }
                int qty = detail.getRequestedQuantity() != null ? detail.getRequestedQuantity() : 0;
                PurchaseProposalDetail existing = consolidated.get(detail.getProduct().getId());
                if (existing == null) {
                    existing = PurchaseProposalDetail.builder()
                            .purchaseProposal(proposal)
                            .product(detail.getProduct())
                            .quantity(qty)
                            .build();
                    consolidated.put(detail.getProduct().getId(), existing);
                } else {
                    existing.setQuantity(existing.getQuantity() + qty);
                }
            }
        }
        proposal.getDetails().addAll(consolidated.values());

        PurchaseProposal saved = purchaseProposalRepository.save(proposal);

        // Mark every aggregated purchase request as part of a proposal
        for (PurchaseRequest pr : purchaseRequests) {
            pr.setStatus(PurchaseRequestStatus.PROPOSAL_CREATED.getCode());
            pr.setUpdatedAt(LocalDateTime.now());
            purchaseRequestRepository.save(pr);
        }

        return PurchaseProposalResponse.fromEntity(saved);
    }

    @Override
    public Page<PurchaseProposalResponse> getPurchaseProposals(String search, Short status, Pageable pageable) {
        return purchaseProposalRepository.findAllWithFilters(search, status, pageable)
                .map(PurchaseProposalResponse::fromEntity);
    }

    @Override
    public PurchaseProposalResponse getPurchaseProposalDetail(Long id) {
        PurchaseProposal pp = purchaseProposalRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));
        return PurchaseProposalResponse.fromEntity(pp);
    }

    @Override
    @Transactional
    public PurchaseProposalResponse approvePurchaseProposal(Long id) {
        PurchaseProposal pp = purchaseProposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));

        if (!PurchaseProposalStatus.PENDING.getCode().equals(pp.getStatus())) {
            throw new IllegalStateException("Only pending proposals can be approved. Current status: "
                    + PurchaseProposalStatus.resolveText(pp.getStatus()));
        }

        pp.setStatus(PurchaseProposalStatus.APPROVED.getCode());
        pp.setApprovedBy(getCurrentAccount());
        pp.setApprovedAt(LocalDateTime.now());
        pp.setRejectReason(null);

        return PurchaseProposalResponse.fromEntity(purchaseProposalRepository.save(pp));
    }

    @Override
    @Transactional
    public PurchaseProposalResponse rejectPurchaseProposal(Long id, String reason) {
        PurchaseProposal pp = purchaseProposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));

        if (!PurchaseProposalStatus.PENDING.getCode().equals(pp.getStatus())) {
            throw new IllegalStateException("Only pending proposals can be rejected. Current status: "
                    + PurchaseProposalStatus.resolveText(pp.getStatus()));
        }

        pp.setStatus(PurchaseProposalStatus.REJECTED.getCode());
        pp.setRejectReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);

        return PurchaseProposalResponse.fromEntity(purchaseProposalRepository.save(pp));
    }

    private String generateProposalCode() {
        String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PP-" + datePrefix + "-";

        List<PurchaseProposal> existing = purchaseProposalRepository.findAll();
        int maxSeq = 0;
        for (PurchaseProposal pp : existing) {
            String c = pp.getCode();
            if (c != null && c.startsWith(prefix)) {
                try {
                    int seq = Integer.parseInt(c.substring(prefix.length()));
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                } catch (NumberFormatException ignored) {
                    // ignore malformed codes
                }
            }
        }
        return prefix + String.format("%04d", maxSeq + 1);
    }

    private Account getCurrentAccount() {
        // TODO: Implement authentication context - get currently logged-in user
        // For now, return the first active account or throw exception if none exists
        return accountRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No account found in system. Please create an account first."));
    }
}
