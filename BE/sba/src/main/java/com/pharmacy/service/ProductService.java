package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.ProductCreateRequest;
import com.pharmacy.dto.product.ProductDetailResponse;
import com.pharmacy.dto.product.ProductResponse;
import com.pharmacy.dto.product.ProductUpdateRequest;
import jakarta.validation.Valid;

public interface ProductService {
    ProductResponse createProduct(@Valid ProductCreateRequest request);

    ProductResponse updateProduct(Long id, @Valid ProductUpdateRequest request);

    ProductDetailResponse getProductDetail(Long id);

    void updateProductStatus(Long id, Short status);

    PageResponse<ProductResponse> getProducts(String keyword, Short status, Integer categoryId, int page, int size, String sortBy, String sortDir);
}
