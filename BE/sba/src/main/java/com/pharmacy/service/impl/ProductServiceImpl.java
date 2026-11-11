package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.PriceHistoryResponse;
import com.pharmacy.dto.product.ProductCreateRequest;
import com.pharmacy.dto.product.ProductDetailResponse;
import com.pharmacy.dto.product.ProductPriceUpdateRequest;
import com.pharmacy.dto.product.ProductResponse;
import com.pharmacy.dto.product.ProductUnitDto;
import com.pharmacy.dto.product.ProductUpdateRequest;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.PriceHistory;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.ProductUnit;
import com.pharmacy.entity.enums.ProductStatus;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.PriceHistoryRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.repository.ProductUnitRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final ProductUnitRepository productUnitRepository;

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

        // Khởi tạo quy cách đơn vị (product_units)
        if (request.getUnits() != null && !request.getUnits().isEmpty()) {
            syncUnitsInternal(savedProduct, request.getUnits());
        } else {
            // Tương thích ngược: tự động tạo đơn vị cơ bản
            ProductUnit baseUnit = ProductUnit.builder()
                    .product(savedProduct)
                    .unitName(savedProduct.getUnit())
                    .conversionFactor(1)
                    .sellingPrice(savedProduct.getSellingPrice())
                    .isBaseUnit(true)
                    .barcode(savedProduct.getBarcode())
                    .createdAt(LocalDateTime.now())
                    .build();
            productUnitRepository.save(baseUnit);
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

        // Đồng bộ units nếu có gửi kèm trường units
        if (request.getUnits() != null) {
            syncUnitsInternal(updatedProduct, request.getUnits());
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
        List<ProductUnitDto> units = getUnitsForProduct(id);

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
                .units(units)
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
    @Transactional
    public String deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        long refCount = productRepository.countTransactionReferences(id);
        if (refCount > 0) {
            // Đã phát sinh giao dịch/chứng từ/tồn kho -> Inactive để bảo toàn chứng từ kiểm toán
            product.setStatus(ProductStatus.INACTIVE);
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
            return "Sản phẩm đã phát sinh giao dịch / chứng từ trong hệ thống nên đã được chuyển sang trạng thái Ngừng kinh doanh (Inactive).";
        } else {
            // Chưa từng phát sinh giao dịch nào -> Xóa lịch sử giá ban đầu và xóa vật lý sản phẩm khỏi DB
            priceHistoryRepository.deleteByProductId(id);
            productRepository.delete(product);
            return "Sản phẩm chưa phát sinh bất kỳ giao dịch nào đã được xóa hoàn toàn khỏi cơ sở dữ liệu.";
        }
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
        List<ProductUnitDto> units = getUnitsForProduct(product.getId());

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
                .units(units)
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

    // ==================== PRODUCT UNITS APIS & HELPERS ====================

    @Override
    @Transactional(readOnly = true)
    public List<ProductUnitDto> getProductUnits(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        List<ProductUnit> units = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(productId);
        if (units == null || units.isEmpty()) {
            Product p = productRepository.findById(productId).orElse(null);
            if (p != null) {
                return List.of(ProductUnitDto.builder()
                        .unitName(p.getUnit())
                        .conversionFactor(1)
                        .sellingPrice(p.getSellingPrice())
                        .isBaseUnit(true)
                        .barcode(p.getBarcode())
                        .build());
            }
            return new ArrayList<>();
        }
        return units.stream().map(this::mapToProductUnitDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductUnitDto addProductUnit(Long productId, ProductUnitDto unitDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        if (unitDto.getBarcode() != null && !unitDto.getBarcode().trim().isEmpty()) {
            Optional<ProductUnit> existingByBarcode = productUnitRepository.findByBarcode(unitDto.getBarcode().trim());
            if (existingByBarcode.isPresent()) {
                throw new DuplicateResourceException("Mã vạch '" + unitDto.getBarcode() + "' đã tồn tại cho quy cách khác");
            }
        }

        boolean isBase = Boolean.TRUE.equals(unitDto.getIsBaseUnit());
        if (isBase) {
            List<ProductUnit> existing = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(productId);
            for (ProductUnit u : existing) {
                if (Boolean.TRUE.equals(u.getIsBaseUnit())) {
                    u.setIsBaseUnit(false);
                    productUnitRepository.save(u);
                }
            }
        }

        ProductUnit unit = ProductUnit.builder()
                .product(product)
                .unitName(unitDto.getUnitName() != null ? unitDto.getUnitName().trim() : product.getUnit())
                .conversionFactor(unitDto.getConversionFactor() != null && unitDto.getConversionFactor() > 0 ? unitDto.getConversionFactor() : 1)
                .sellingPrice(unitDto.getSellingPrice() != null ? unitDto.getSellingPrice() : product.getSellingPrice())
                .isBaseUnit(isBase)
                .barcode(unitDto.getBarcode() != null && !unitDto.getBarcode().trim().isEmpty() ? unitDto.getBarcode().trim() : null)
                .createdAt(LocalDateTime.now())
                .build();

        ProductUnit saved = productUnitRepository.save(unit);
        return mapToProductUnitDto(saved);
    }

    @Override
    @Transactional
    public ProductUnitDto updateProductUnit(Long productId, Long unitId, ProductUnitDto unitDto) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        ProductUnit unit = productUnitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quy cách với ID: " + unitId));

        if (!unit.getProduct().getId().equals(productId)) {
            throw new IllegalArgumentException("Quy cách không thuộc về sản phẩm ID: " + productId);
        }

        if (unitDto.getBarcode() != null && !unitDto.getBarcode().trim().isEmpty()) {
            String b = unitDto.getBarcode().trim();
            Optional<ProductUnit> existingByBarcode = productUnitRepository.findByBarcode(b);
            if (existingByBarcode.isPresent() && !existingByBarcode.get().getId().equals(unitId)) {
                throw new DuplicateResourceException("Mã vạch '" + b + "' đã tồn tại cho quy cách khác");
            }
            unit.setBarcode(b);
        } else {
            unit.setBarcode(null);
        }

        if (Boolean.TRUE.equals(unitDto.getIsBaseUnit()) && !Boolean.TRUE.equals(unit.getIsBaseUnit())) {
            List<ProductUnit> existing = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(productId);
            for (ProductUnit u : existing) {
                if (!u.getId().equals(unitId) && Boolean.TRUE.equals(u.getIsBaseUnit())) {
                    u.setIsBaseUnit(false);
                    productUnitRepository.save(u);
                }
            }
            unit.setIsBaseUnit(true);
        } else if (unitDto.getIsBaseUnit() != null) {
            unit.setIsBaseUnit(unitDto.getIsBaseUnit());
        }

        if (unitDto.getUnitName() != null && !unitDto.getUnitName().trim().isEmpty()) {
            unit.setUnitName(unitDto.getUnitName().trim());
        }
        if (unitDto.getConversionFactor() != null && unitDto.getConversionFactor() > 0) {
            unit.setConversionFactor(unitDto.getConversionFactor());
        }
        if (unitDto.getSellingPrice() != null) {
            unit.setSellingPrice(unitDto.getSellingPrice());
        }

        ProductUnit saved = productUnitRepository.save(unit);
        return mapToProductUnitDto(saved);
    }

    @Override
    @Transactional
    public void deleteProductUnit(Long productId, Long unitId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        ProductUnit unit = productUnitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quy cách với ID: " + unitId));

        if (!unit.getProduct().getId().equals(productId)) {
            throw new IllegalArgumentException("Quy cách không thuộc về sản phẩm này");
        }

        if (Boolean.TRUE.equals(unit.getIsBaseUnit())) {
            throw new IllegalStateException("Không thể xóa quy cách đơn vị cơ bản!");
        }

        productUnitRepository.delete(unit);
    }

    @Override
    @Transactional
    public List<ProductUnitDto> syncProductUnits(Long productId, List<ProductUnitDto> units) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        return syncUnitsInternal(product, units);
    }

    private List<ProductUnitDto> syncUnitsInternal(Product product, List<ProductUnitDto> newUnits) {
        List<ProductUnit> currentUnits = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(product.getId());

        if (newUnits == null || newUnits.isEmpty()) {
            if (currentUnits.isEmpty()) {
                ProductUnit baseUnit = ProductUnit.builder()
                        .product(product)
                        .unitName(product.getUnit())
                        .conversionFactor(1)
                        .sellingPrice(product.getSellingPrice())
                        .isBaseUnit(true)
                        .barcode(product.getBarcode())
                        .createdAt(LocalDateTime.now())
                        .build();
                currentUnits.add(productUnitRepository.save(baseUnit));
            }
            return currentUnits.stream().map(this::mapToProductUnitDto).collect(Collectors.toList());
        }

        boolean hasBase = newUnits.stream().anyMatch(u -> Boolean.TRUE.equals(u.getIsBaseUnit()));
        List<Long> keptIds = new ArrayList<>();
        List<ProductUnit> savedUnits = new ArrayList<>();

        for (int i = 0; i < newUnits.size(); i++) {
            ProductUnitDto dto = newUnits.get(i);
            boolean isBase = Boolean.TRUE.equals(dto.getIsBaseUnit()) || (!hasBase && i == 0);

            ProductUnit unit = null;
            if (dto.getId() != null) {
                unit = productUnitRepository.findById(dto.getId()).orElse(null);
                if (unit != null && unit.getProduct().getId().equals(product.getId())) {
                    unit.setUnitName(dto.getUnitName() != null ? dto.getUnitName().trim() : unit.getUnitName());
                    unit.setConversionFactor(dto.getConversionFactor() != null && dto.getConversionFactor() > 0 ? dto.getConversionFactor() : 1);
                    unit.setSellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : BigDecimal.ZERO);
                    unit.setIsBaseUnit(isBase);
                    unit.setBarcode(dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() ? dto.getBarcode().trim() : null);
                    unit = productUnitRepository.save(unit);
                    keptIds.add(unit.getId());
                    savedUnits.add(unit);
                    continue;
                }
            }

            unit = ProductUnit.builder()
                    .product(product)
                    .unitName(dto.getUnitName() != null ? dto.getUnitName().trim() : product.getUnit())
                    .conversionFactor(dto.getConversionFactor() != null && dto.getConversionFactor() > 0 ? dto.getConversionFactor() : 1)
                    .sellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : BigDecimal.ZERO)
                    .isBaseUnit(isBase)
                    .barcode(dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() ? dto.getBarcode().trim() : null)
                    .createdAt(LocalDateTime.now())
                    .build();
            unit = productUnitRepository.save(unit);
            keptIds.add(unit.getId());
            savedUnits.add(unit);
        }

        for (ProductUnit old : currentUnits) {
            if (!keptIds.contains(old.getId())) {
                try {
                    productUnitRepository.delete(old);
                } catch (Exception ignored) {}
            }
        }

        return savedUnits.stream().map(this::mapToProductUnitDto).collect(Collectors.toList());
    }

    private List<ProductUnitDto> getUnitsForProduct(Long productId) {
        if (productUnitRepository == null || productId == null) {
            return new ArrayList<>();
        }
        try {
            List<ProductUnit> units = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(productId);
            if (units == null || units.isEmpty()) {
                return new ArrayList<>();
            }
            return units.stream().map(this::mapToProductUnitDto).collect(Collectors.toList());
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private ProductUnitDto mapToProductUnitDto(ProductUnit u) {
        return ProductUnitDto.builder()
                .id(u.getId())
                .unitName(u.getUnitName())
                .conversionFactor(u.getConversionFactor())
                .sellingPrice(u.getSellingPrice())
                .isBaseUnit(u.getIsBaseUnit())
                .barcode(u.getBarcode())
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
