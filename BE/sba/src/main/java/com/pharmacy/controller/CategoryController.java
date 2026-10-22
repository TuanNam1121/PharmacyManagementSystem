package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.category.CategoryCreateRequest;
import com.pharmacy.dto.category.CategoryResponse;
import com.pharmacy.dto.category.CategoryUpdateRequest;
import com.pharmacy.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/category")
@CrossOrigin(origins = "*")
@Tag(name = "Category Management", description = "APIs for managing categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Xem danh sách danh mục sản phẩm")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(
                ApiResponse.success("", categoryService.getCategories())
        );
    }

    @PostMapping
    @Operation(summary = "Tạo danh mục mới")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo danh mục thành công", response));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @Operation(summary = "Cập nhật thông tin danh mục")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái danh mục (Active/Inactive)")
    public ResponseEntity<ApiResponse<Void>> updateCategoryStatus(
            @PathVariable Long id,
            @RequestParam Short status) {
        categoryService.updateCategoryStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái danh mục thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục sản phẩm (UC20)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}
