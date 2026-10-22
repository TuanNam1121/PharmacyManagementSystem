package com.pharmacy.service;

import com.pharmacy.dto.category.CategoryCreateRequest;
import com.pharmacy.dto.category.CategoryResponse;
import com.pharmacy.dto.category.CategoryUpdateRequest;
import jakarta.validation.Valid;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getCategories();

    CategoryResponse createCategory(@Valid CategoryCreateRequest request);

    CategoryResponse updateCategory(Long id, @Valid CategoryUpdateRequest request);

    void updateCategoryStatus(Long id, Short status);

    void deleteCategory(Long id);
}
