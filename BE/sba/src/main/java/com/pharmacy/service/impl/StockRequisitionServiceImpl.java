package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.CreateStockRequisitionRequest;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import com.pharmacy.dto.warehouse.ProductOptionDto;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.StockRequisition;
import com.pharmacy.entity.StockRequisitionDetail;
import com.pharmacy.entity.Store;
import com.pharmacy.entity.enums.StockRequisitionStatus;
import com.pharmacy.repository.*;
import com.pharmacy.service.StockRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockRequisitionServiceImpl implements StockRequisitionService {

    private final StockRequisitionRepository requisitionRepository;
    private final StockRequisitionDetailRepository detailRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;

    // ─── helpers ────────────────────────────────────────────────────────────────

    private static String resolveStatusLabel(Short status) {
        return StockRequisitionStatus.resolveBranchLabel(status);
    }

    private StockRequisitionDto.DetailDto mapDetail(StockRequisitionDetail d) {
        return StockRequisitionDto.DetailDto.builder()
                .id(d.getId())
                .productId(d.getProduct() != null ? d.getProduct().getId() : null)
                .productName(d.getProduct() != null ? d.getProduct().getName() : null)
                .productUnit(d.getProduct() != null ? d.getProduct().getUnit() : null)
                .barcode(d.getProduct() != null ? d.getProduct().getBarcode() : null)
                .requestedQty(d.getRequestedQty())
                .approvedQty(d.getApprovedQty())
                .receivedQty(d.getReceivedQty())
                .build();
    }

    private StockRequisitionDto mapRequisition(StockRequisition r, boolean withDetails) {
        StockRequisitionDto.StockRequisitionDtoBuilder builder = StockRequisitionDto.builder()
                .id(r.getId())
                .code(r.getCode())
                .storeId(r.getStore() != null ? r.getStore().getId() : null)
                .storeName(r.getStore() != null ? r.getStore().getName() : null)
                .createdByUsername(r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null)
                .approvedByUsername(r.getApprovedBy() != null ? r.getApprovedBy().getUsername() : null)
                .status(r.getStatus())
                .statusLabel(resolveStatusLabel(r.getStatus()))
                .rejectReason(r.getRejectReason())
                .createdAt(r.getCreatedAt())
                .approvedAt(r.getApprovedAt())
                .dispatchedAt(r.getDispatchedAt())
                .receivedAt(r.getReceivedAt());

        if (withDetails) {
            List<StockRequisitionDetail> details = detailRepository.findByStockRequisitionId(r.getId());
            builder.details(details.stream().map(this::mapDetail).toList());
        }
        return builder.build();
    }

    // ─── Stock Requisition flows
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockRequisitionDto> getRequisitionList(Long storeId, Short status, String search,
            Pageable pageable) {
        Page<StockRequisition> page = requisitionRepository.findAllWithFilter(storeId, status, search, pageable);
        Page<StockRequisitionDto> mapped = page.map(r -> mapRequisition(r, false));
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public StockRequisitionDto getRequisitionDetail(Long requisitionId) {
        StockRequisition r = requisitionRepository.findById(requisitionId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Stock requisition not found with ID: " + requisitionId));
        return mapRequisition(r, true);
    }

    @Override
    @Transactional
    public StockRequisitionDto createRequisition(CreateStockRequisitionRequest request) {
        // 1. Kiểm tra Store tồn tại
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Store not found with ID: " + request.getStoreId()));

        // 2. Xác định tài khoản tạo phiếu
        Account creator = null;
        if (request.getCreatedByUsername() != null && !request.getCreatedByUsername().isBlank()) {
            creator = accountRepository.findByUsername(request.getCreatedByUsername()).orElse(null);
        }
        if (creator == null) {
            creator = accountRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No active account found to assign as creator"));
        }

        // 3. Tự sinh mã phiếu (VD: REQ-261021-4821)
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = String.format("%04d", (int) (Math.random() * 10000));
        String code = "REQ-" + datePart + "-" + randomPart;

        // 4. Khởi tạo đối tượng StockRequisition
        StockRequisition requisition = StockRequisition.builder()
                .code(code)
                .store(store)
                .createdBy(creator)
                .status((short) 0) // 0: Pending Review (Chờ duyệt)
                .createdAt(LocalDateTime.now())
                .details(new ArrayList<>())
                .build();

        // 5. Thêm chi tiết từng mặt hàng thuốc
        for (CreateStockRequisitionRequest.ItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Product not found with ID: " + item.getProductId()));

            StockRequisitionDetail detail = StockRequisitionDetail.builder()
                    .stockRequisition(requisition)
                    .product(product)
                    .requestedQty(item.getRequestedQty())
                    .build();

            requisition.getDetails().add(detail);
        }

        StockRequisition saved = requisitionRepository.save(requisition);
        return mapRequisition(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductOptionDto> searchProducts(String search) {
        Pageable limit = PageRequest.of(0, 25);
        return productRepository.searchProducts(search, limit).stream()
                .map(p -> new ProductOptionDto(
                        p.getId(),
                        p.getName(),
                        p.getBarcode(),
                        p.getUnit(),
                        p.getCostPrice()))
                .toList();
    }
}
