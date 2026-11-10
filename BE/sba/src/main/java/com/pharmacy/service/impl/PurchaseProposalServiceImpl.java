package com.pharmacy.service.impl;

import com.pharmacy.dto.purchaseproposal.CreatePurchaseProposalRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.PurchaseRequestDetail;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseProposalRequestRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.RfqRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.repository.SupplierQuotationRepository;
import com.pharmacy.service.PurchaseProposalService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseProposalServiceImpl implements PurchaseProposalService {

    private final PurchaseProposalRepository purchaseProposalRepository;
    private final PurchaseProposalRequestRepository purchaseProposalRequestRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final AccountRepository accountRepository;
    private final SupplierQuotationRepository supplierQuotationRepository;
    private final SupplierQuotationDetailRepository supplierQuotationDetailRepository;
    @org.springframework.context.annotation.Lazy
    private final com.pharmacy.service.WarehouseInventoryService warehouseInventoryService;
    private final RfqRepository rfqRepository;

    @Override
    @Transactional
    public PurchaseProposalResponse createPurchaseProposal(CreatePurchaseProposalRequest request) {
        List<Long> requestedIds = request.getPurchaseRequestIds() != null
                ? request.getPurchaseRequestIds().stream().filter(Objects::nonNull).distinct().toList()
                : Collections.emptyList();
        if (requestedIds.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho.");
        }

        // Load and validate every selected purchase request
        List<PurchaseRequest> purchaseRequests = new ArrayList<>();
        for (Long prId : requestedIds) {
            PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu mua hàng ID: " + prId));

            if (!PurchaseRequestStatus.SUBMITTED.getCode().equals(pr.getStatus())) {
                throw new IllegalStateException("Yêu cầu mua hàng " + pr.getCode()
                        + " không ở trạng thái 'Đã gửi'. Trạng thái hiện tại: "
                        + PurchaseRequestStatus.resolveText(pr.getStatus()));
            }

            if (purchaseProposalRequestRepository.existsByPurchaseRequestId(prId)) {
                throw new IllegalStateException("Yêu cầu mua hàng " + pr.getCode()
                        + " đã được tổng hợp vào một đề xuất khác.");
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

        // Consolidate items:
        Map<Long, PurchaseProposalDetail> consolidated = new LinkedHashMap<>();

        // 1. Items from warehouse purchase requests
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

        if (consolidated.isEmpty()) {
            throw new IllegalArgumentException("Đề xuất mua hàng phải có ít nhất một mặt hàng hợp lệ.");
        }

        proposal.getDetails().addAll(consolidated.values());

        // Calculate estimated total amount
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseProposalDetail d : consolidated.values()) {
            BigDecimal cost = (d.getProduct() != null && d.getProduct().getCostPrice() != null)
                    ? d.getProduct().getCostPrice()
                    : BigDecimal.ZERO;
            total = total.add(cost.multiply(BigDecimal.valueOf(d.getQuantity())));
        }
        proposal.setTotalAmount(total);

        PurchaseProposal saved = purchaseProposalRepository.save(proposal);

        // Mark every aggregated purchase request as proposal created
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

        // Once a supplier has been chosen, expose their quotation pricing (unit price,
        // tax and line subtotal) alongside the consolidated items so the detail screen
        // can show the selected supplier and the agreed totals instead of a bare list.
        List<SupplierQuotationDetail> winnerDetails = (pp.getSupplierQuotation() != null)
                ? supplierQuotationDetailRepository
                        .findBySupplierQuotationIdWithProduct(pp.getSupplierQuotation().getId())
                : Collections.emptyList();

        return PurchaseProposalResponse.fromEntity(pp, winnerDetails);
    }

    @Override
    @Transactional
    public PurchaseProposalResponse approvePurchaseProposal(Long id) {
        PurchaseProposal pp = purchaseProposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));

        if (!PurchaseProposalStatus.DRAFT.getCode().equals(pp.getStatus())
                && !PurchaseProposalStatus.QUOTATION_SELECTED.getCode().equals(pp.getStatus())) {
            throw new IllegalStateException("Only draft or quotation-selected proposals can be approved. Current status: "
                    + PurchaseProposalStatus.resolveText(pp.getStatus()));
        }

        pp.setStatus(PurchaseProposalStatus.APPROVED.getCode());
        pp.setApprovedBy(getCurrentAccount());
        pp.setApprovedAt(LocalDateTime.now());
        pp.setRejectReason(null);

        // Synchronize linked purchase requests to COMPLETED / approved (status 4)
        if (pp.getRequests() != null) {
            for (PurchaseProposalRequest link : pp.getRequests()) {
                PurchaseRequest pr = link.getPurchaseRequest();
                if (pr != null) {
                    pr.setStatus(PurchaseRequestStatus.COMPLETED.getCode());
                    pr.setUpdatedAt(LocalDateTime.now());
                    purchaseRequestRepository.save(pr);
                }
            }
        }

        PurchaseProposal savedPp = purchaseProposalRepository.save(pp);
        return PurchaseProposalResponse.fromEntity(savedPp);
    }

    @Override
    @Transactional
    public PurchaseProposalResponse rejectPurchaseProposal(Long id, String reason) {
        PurchaseProposal pp = purchaseProposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));

        boolean rejectable = PurchaseProposalStatus.DRAFT.getCode().equals(pp.getStatus())
                || PurchaseProposalStatus.RFQ_SENT.getCode().equals(pp.getStatus())
                || PurchaseProposalStatus.QUOTATION_SELECTED.getCode().equals(pp.getStatus());
        if (!rejectable) {
            throw new IllegalStateException("Only draft, RFQ-sent or quotation-selected proposals can be rejected. Current status: "
                    + PurchaseProposalStatus.resolveText(pp.getStatus()));
        }

        pp.setStatus(PurchaseProposalStatus.REJECTED.getCode());
        pp.setRejectReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);

        return PurchaseProposalResponse.fromEntity(purchaseProposalRepository.save(pp));
    }

    @Override
    @Transactional
    public PurchaseProposalResponse selectSupplier(Long id, Long rfqId) {
        PurchaseProposal pp = purchaseProposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));

        // A supplier can only be chosen while the proposal is still in its RFQ phase
        // ("Đã lập đề xuất" or "Đang chào giá RFQ").
        boolean selectable = PurchaseProposalStatus.DRAFT.getCode().equals(pp.getStatus())
                || PurchaseProposalStatus.RFQ_SENT.getCode().equals(pp.getStatus());
        if (!selectable) {
            throw new IllegalStateException(
                    "Only proposals awaiting supplier selection can choose a supplier. Current status: "
                            + PurchaseProposalStatus.resolveText(pp.getStatus()));
        }

        SupplierQuotation quotation = supplierQuotationRepository.findByRfqId(rfqId)
                .orElseThrow(() -> new EntityNotFoundException("Supplier quotation not found for RFQ ID: " + rfqId));

        // The chosen RFQ must belong to this proposal
        if (quotation.getRfq() == null
                || quotation.getRfq().getPurchaseProposal() == null
                || !quotation.getRfq().getPurchaseProposal().getId().equals(pp.getId())) {
            throw new IllegalArgumentException("Quotation does not belong to this purchase proposal");
        }

        pp.setSupplierQuotation(quotation);

        // Đồng bộ tổng tiền theo báo giá thực tế của nhà cung cấp được chọn.
        // total_amount ban đầu chỉ là tạm tính theo giá vốn danh mục lúc tạo đề xuất,
        // nên phải tính lại để tổng đơn đặt hàng khớp các dòng hàng báo giá.
        BigDecimal quotedTotal = supplierQuotationDetailRepository
                .findBySupplierQuotationId(quotation.getId())
                .stream()
                .map(d -> d.getSubtotal() != null ? d.getSubtotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pp.setTotalAmount(quotedTotal);

        pp.setStatus(PurchaseProposalStatus.QUOTATION_SELECTED.getCode());

        // The chosen RFQ becomes "Đã chọn"; every competing RFQ of the same proposal
        // that is still awaiting a decision becomes "Từ chối".
        cascadeRfqSelection(pp.getId(), rfqId);

        // Linked purchase requests advance to "Đã chọn báo giá".
        if (pp.getRequests() != null) {
            for (PurchaseProposalRequest link : pp.getRequests()) {
                PurchaseRequest pr = link.getPurchaseRequest();
                if (pr == null
                        || PurchaseRequestStatus.CANCELLED.getCode().equals(pr.getStatus())
                        || PurchaseRequestStatus.COMPLETED.getCode().equals(pr.getStatus())) {
                    continue;
                }
                pr.setStatus(PurchaseRequestStatus.QUOTATION_SELECTED.getCode());
                pr.setUpdatedAt(LocalDateTime.now());
                purchaseRequestRepository.save(pr);
            }
        }

        return PurchaseProposalResponse.fromEntity(purchaseProposalRepository.save(pp));
    }

    /**
     * Marks the winning RFQ as SELECTED and rejects the competing RFQs of the same
     * proposal that are still awaiting a decision (sent and not yet past deadline,
     * or already responded). Expired, cancelled, or already-resolved RFQs are kept.
     */
    private void cascadeRfqSelection(Long purchaseProposalId, Long selectedRfqId) {
        List<Rfq> rfqs = rfqRepository.findByPurchaseProposalId(purchaseProposalId);
        LocalDateTime now = LocalDateTime.now();
        for (Rfq rfq : rfqs) {
            if (rfq.getId().equals(selectedRfqId)) {
                if (rfq.getStatus() != RfqStatus.SELECTED) {
                    rfq.setStatus(RfqStatus.SELECTED);
                    rfqRepository.save(rfq);
                }
                continue;
            }
            boolean stillActive = rfq.getStatus() == RfqStatus.RESPONDED
                    || (rfq.getStatus() == RfqStatus.SENT
                            && (rfq.getExpiredAt() == null || rfq.getExpiredAt().isAfter(now)));
            if (stillActive) {
                rfq.setStatus(RfqStatus.REJECTED);
                rfqRepository.save(rfq);
            }
        }
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
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                Optional<Account> acc = accountRepository.findByUsername(auth.getName());
                if (acc.isPresent()) {
                    return acc.get();
                }
            }
        } catch (Exception ignored) {
        }
        return accountRepository.findByUsername("purchasing01")
                .or(() -> accountRepository.findByUsername("nhuthuy"))
                .or(() -> accountRepository.findByUsername("admin"))
                .or(() -> accountRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new IllegalStateException("No account found in system. Please create an account first."));
    }
}
