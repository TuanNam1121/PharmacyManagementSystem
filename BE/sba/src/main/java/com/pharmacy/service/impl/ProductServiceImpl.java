package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.PriceHistoryResponse;
import com.pharmacy.dto.product.ProductCreateRequest;
import com.pharmacy.dto.product.ProductDetailResponse;
import com.pharmacy.dto.product.ProductPriceUpdateRequest;
import com.pharmacy.dto.product.ProductResponse;
import com.pharmacy.dto.product.ProductUpdateRequest;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.PriceHistory;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.enums.ProductStatus;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.PriceHistoryRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            String barcode = request.getBarcode().trim();
            if (productRepository.existsByBarcode(barcode)) {
                throw new DuplicateResourceException("Mã vạch '" + barcode + "' đã tồn tại trên hệ thống");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        ProductStatus initialStatus = request.getStatus() != null
                ? ProductStatus.fromCode(request.getStatus())
                : ProductStatus.ACTIVE;
        if (initialStatus == null) {
            initialStatus = ProductStatus.ACTIVE;
        }

        Product product = new Product();
        product.setBarcode(request.getBarcode() != null ? request.getBarcode().trim() : null);
        product.setName(request.getName().trim());
        product.setUnit(request.getUnit().trim());
        product.setActiveIngredient(request.getActiveIngredient() != null ? request.getActiveIngredient().trim() : null);
        product.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        product.setIsPrescription(request.getIsPrescription() != null ? request.getIsPrescription() : false);
        product.setCostPrice(request.getCostPrice() != null ? request.getCostPrice() : java.math.BigDecimal.ZERO);
        product.setSellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : java.math.BigDecimal.ZERO);
        product.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 20);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setStatus(initialStatus);
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());

        Product savedProduct = productRepository.save(savedProductInstance(product));

        // Tự động ghi nhận lịch sử giá ban đầu (UC15/UC16)
        Account currentUser = getCurrentAccount();
        if (currentUser != null) {
            PriceHistory initialPriceHistory = new PriceHistory();
            initialPriceHistory.setProduct(savedProduct);
            initialPriceHistory.setAccount(currentUser);
            initialPriceHistory.setCostPrice(savedProduct.getCostPrice());
            initialPriceHistory.setSellingPrice(savedProduct.getSellingPrice());
            initialPriceHistory.setEffectiveFrom(LocalDateTime.now());
            initialPriceHistory.setReason(request.getPriceReason() != null && !request.getPriceReason().trim().isEmpty()
                    ? request.getPriceReason().trim()
                    : "Khởi tạo giá khi tạo mới sản phẩm");
            initialPriceHistory.setCreatedAt(LocalDateTime.now());
            priceHistoryRepository.save(initialPriceHistory);
        }

        return mapToProductResponse(savedProduct);
    }

    private Product savedProductInstance(Product p) {
        return p;
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            String barcode = request.getBarcode().trim();
            if (productRepository.existsByBarcodeAndIdNot(barcode, id)) {
                throw new DuplicateResourceException("Mã vạch '" + barcode + "' đã tồn tại cho sản phẩm khác");
            }
            product.setBarcode(barcode);
        } else {
            product.setBarcode(null);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        boolean costPriceChanged = (request.getCostPrice() != null && product.getCostPrice().compareTo(request.getCostPrice()) != 0);
        boolean sellingPriceChanged = (request.getSellingPrice() != null && product.getSellingPrice().compareTo(request.getSellingPrice()) != 0);

        product.setName(request.getName().trim());
        product.setUnit(request.getUnit().trim());
        product.setActiveIngredient(request.getActiveIngredient() != null ? request.getActiveIngredient().trim() : null);
        product.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        if (request.getIsPrescription() != null) {
            product.setIsPrescription(request.getIsPrescription());
        }
        if (request.getCostPrice() != null) {
            product.setCostPrice(request.getCostPrice());
        }
        if (request.getSellingPrice() != null) {
            product.setSellingPrice(request.getSellingPrice());
        }
        if (request.getMinQuantity() != null) {
            product.setMinQuantity(request.getMinQuantity());
        }
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) {
            ProductStatus st = ProductStatus.fromCode(request.getStatus());
            if (st != null) {
                product.setStatus(st);
            }
        }
        product.setCategory(category);
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        // Tự động ghi nhận lịch sử giá khi có thay đổi giá vốn hoặc giá bán (UC15/UC16)
        if (costPriceChanged || sellingPriceChanged) {
            Account currentUser = getCurrentAccount();
            if (currentUser != null) {
                PriceHistory priceHistory = new PriceHistory();
                priceHistory.setProduct(updatedProduct);
                priceHistory.setAccount(currentUser);
                priceHistory.setCostPrice(updatedProduct.getCostPrice());
                priceHistory.setSellingPrice(updatedProduct.getSellingPrice());
                priceHistory.setEffectiveFrom(LocalDateTime.now());
                priceHistory.setReason(request.getPriceReason() != null && !request.getPriceReason().trim().isEmpty()
                        ? request.getPriceReason().trim()
                        : "Cập nhật từ form quản lý sản phẩm");
                priceHistory.setCreatedAt(LocalDateTime.now());
                priceHistoryRepository.save(priceHistory);
            }
        }

        return mapToProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProductPrice(Long id, ProductPriceUpdateRequest request) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        // Tự động ghi nhận lịch sử giá (UC15/UC16)
        Account currentUser = getCurrentAccount();
        if (currentUser != null) {
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setProduct(updatedProduct);
            priceHistory.setAccount(currentUser);
            priceHistory.setCostPrice(request.getCostPrice());
            priceHistory.setSellingPrice(request.getSellingPrice());
            priceHistory.setEffectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDateTime.now());
            priceHistory.setReason(request.getReason() != null && !request.getReason().trim().isEmpty()
                    ? request.getReason().trim()
                    : "Cập nhật giá qua chức năng Set/Update Price");
            priceHistory.setCreatedAt(LocalDateTime.now());
            priceHistoryRepository.save(priceHistory);
        }

        return mapToProductResponse(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        Category category = product.getCategory();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .barcode(product.getBarcode())
                .name(product.getName())
                .unit(product.getUnit())
                .activeIngredient(product.getActiveIngredient())
                .manufacturer(product.getManufacturer())
                .isPrescription(product.getIsPrescription())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .minQuantity(product.getMinQuantity())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus() != null ? product.getStatus().getCode() : null)
                .statusLabel(product.getStatus() != null ? product.getStatus().getLabel() : "Unknown")
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .build();
    }

    @Override
    @Transactional
    public void updateProductStatus(Long id, Short status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        ProductStatus st = ProductStatus.fromCode(status);
        if (st == null) {
            throw new IllegalArgumentException("Invalid product status: " + status);
        }
        product.setStatus(st);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(String keyword, Short status, Integer categoryId,
                                                     int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = ("name".equalsIgnoreCase(sortBy) || "barcode".equalsIgnoreCase(sortBy) || "createdAt".equalsIgnoreCase(sortBy) || "sellingPrice".equalsIgnoreCase(sortBy))
                ? sortBy : "createdAt";

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, property));
        Long catId = categoryId != null ? categoryId.longValue() : null;
        ProductStatus statusEnum = status != null ? ProductStatus.fromCode(status) : null;

        Page<Product> productPage = productRepository.findProductsWithFilters(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                statusEnum,
                catId,
                pageable
        );

        List<ProductResponse> items = productPage.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(items)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PriceHistoryResponse> getPriceHistories(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }

        List<PriceHistory> histories = priceHistoryRepository.findByProductIdWithAccount(productId);
        return histories.stream()
                .map(this::mapToPriceHistoryResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product) {
        Category category = product.getCategory();

        return ProductResponse.builder()
                .id(product.getId())
                .barcode(product.getBarcode())
                .name(product.getName())
                .unit(product.getUnit())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .status(product.getStatus() != null ? product.getStatus().getCode() : null)
                .statusLabel(product.getStatus() != null ? product.getStatus().getLabel() : "Unknown")
                .imageUrl(product.getImageUrl())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .build();
    }

    private PriceHistoryResponse mapToPriceHistoryResponse(PriceHistory history) {
        Account acc = history.getAccount();
        AccountInformation info = acc != null ? acc.getAccountInformation() : null;

        return PriceHistoryResponse.builder()
                .id(history.getId())
                .productId(history.getProduct() != null ? history.getProduct().getId() : null)
                .productName(history.getProduct() != null ? history.getProduct().getName() : null)
                .accountId(acc != null ? acc.getId() : null)
                .accountUsername(acc != null ? acc.getUsername() : null)
                .accountFullName(info != null ? info.getFullName() : (acc != null ? acc.getUsername() : "Hệ thống"))
                .costPrice(history.getCostPrice())
                .sellingPrice(history.getSellingPrice())
                .effectiveFrom(history.getEffectiveFrom())
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
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
        return accountRepository.findByUsername("admin")
                .orElseGet(() -> accountRepository.findAll().stream().findFirst().orElse(null));
    }
}
