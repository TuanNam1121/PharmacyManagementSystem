package com.pharmacy.service.impl;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.ProductCreateRequest;
import com.pharmacy.dto.product.ProductDetailResponse;
import com.pharmacy.dto.product.ProductResponse;
import com.pharmacy.dto.product.ProductUpdateRequest;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.Product;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

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

        Product product = new Product();
        product.setBarcode(request.getBarcode() != null ? request.getBarcode().trim() : null);
        product.setName(request.getName().trim());
        product.setUnit(request.getUnit().trim());
        product.setActiveIngredient(request.getActiveIngredient() != null ? request.getActiveIngredient().trim() : null);
        product.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        product.setIsPrescription(request.getIsPrescription() != null ? request.getIsPrescription() : false);
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 20);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
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

        product.setName(request.getName().trim());
        product.setUnit(request.getUnit().trim());
        product.setActiveIngredient(request.getActiveIngredient() != null ? request.getActiveIngredient().trim() : null);
        product.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        if (request.getIsPrescription() != null) {
            product.setIsPrescription(request.getIsPrescription());
        }
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getMinQuantity() != null) {
            product.setMinQuantity(request.getMinQuantity());
        }
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        product.setCategory(category);
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
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
                .status(product.getStatus())
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
        product.setStatus(status);
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

        // Chuyển đổi Integer categoryId sang Long để query với entity Category (id kiểu Long)
        Long catId = categoryId != null ? categoryId.longValue() : null;

        Page<Product> productPage = productRepository.findProductsWithFilters(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                status,
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

    private ProductResponse mapToProductResponse(Product product) {
        Category category = product.getCategory();

        return ProductResponse.builder()
                .id(product.getId())
                .barcode(product.getBarcode())
                .name(product.getName())
                .unit(product.getUnit())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .status(product.getStatus())
                .imageUrl(product.getImageUrl())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .build();
    }
}