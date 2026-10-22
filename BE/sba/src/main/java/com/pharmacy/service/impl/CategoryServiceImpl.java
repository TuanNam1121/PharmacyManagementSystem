package com.pharmacy.service.impl;

import com.pharmacy.dto.category.CategoryCreateRequest;
import com.pharmacy.dto.category.CategoryResponse;
import com.pharmacy.dto.category.CategoryUpdateRequest;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.enums.CategoryStatus;
import com.pharmacy.entity.enums.ProductStatus;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.service.CategoryService;
import lombok.RequiredArgsConstructor;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Account currentUser = getCurrentAccount();

        CategoryStatus initialStatus = request.getStatus() != null
                ? CategoryStatus.fromCode(request.getStatus())
                : CategoryStatus.ACTIVE;
        if (initialStatus == null) {
            initialStatus = CategoryStatus.ACTIVE;
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setStatus(initialStatus);
        category.setCreatedBy(currentUser);
        category.setCreatedAt(LocalDateTime.now());

        Category savedCategory = categoryRepository.save(category);
        return mapToCategoryResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

        if (request.getStatus() != null) {
            CategoryStatus targetStatus = CategoryStatus.fromCode(request.getStatus());
            if (targetStatus == CategoryStatus.INACTIVE && category.getStatus() == CategoryStatus.ACTIVE) {
                // Ràng buộc UC20: Không thể vô hiệu hóa danh mục nếu có sản phẩm đang ACTIVE
                if (productRepository.existsByCategoryIdAndStatus(id, ProductStatus.ACTIVE)) {
                    throw new IllegalStateException("Không thể vô hiệu hóa danh mục vì vẫn còn sản phẩm đang hoạt động thuộc danh mục này.");
                }
            }
            if (targetStatus != null) {
                category.setStatus(targetStatus);
            }
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Category updatedCategory = categoryRepository.save(category);
        return mapToCategoryResponse(updatedCategory);
    }

    @Override
    @Transactional
    public void updateCategoryStatus(Long id, Short status) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

        CategoryStatus targetStatus = CategoryStatus.fromCode(status);
        if (targetStatus == null) {
            throw new IllegalArgumentException("Trạng thái danh mục không hợp lệ: " + status);
        }

        // Ràng buộc UC20: Chỉ cho phép đổi sang CategoryStatus.INACTIVE khi không có sản phẩm nào thuộc danh mục đang ở ProductStatus.ACTIVE
        if (targetStatus == CategoryStatus.INACTIVE) {
            if (productRepository.existsByCategoryIdAndStatus(id, ProductStatus.ACTIVE)) {
                throw new IllegalStateException("Không thể vô hiệu hóa danh mục vì vẫn còn sản phẩm đang hoạt động thuộc danh mục này.");
            }
        }

        category.setStatus(targetStatus);
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

        // Ràng buộc UC20: Chỉ cho phép Xóa danh mục khi không có sản phẩm nào thuộc danh mục đang ở ProductStatus.ACTIVE
        if (productRepository.existsByCategoryIdAndStatus(id, ProductStatus.ACTIVE)) {
            throw new IllegalStateException("Không thể xóa danh mục vì vẫn còn sản phẩm đang hoạt động thuộc danh mục này.");
        }

        try {
            categoryRepository.delete(category);
        } catch (Exception ex) {
            // Nếu có ràng buộc khóa ngoại (sản phẩm đã ngừng kinh doanh/inactive), chuyển sang xóa mềm bằng cách tắt trạng thái
            category.setStatus(CategoryStatus.INACTIVE);
            categoryRepository.save(category);
        }
    }

    /**
     * Hàm phụ trợ chuyển đổi từ Entity sang DTO Response
     */
    private CategoryResponse mapToCategoryResponse(Category category) {
        Account createdBy = category.getCreatedBy();
        AccountInformation info = createdBy != null ? createdBy.getAccountInformation() : null;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus() != null ? category.getStatus().getCode() : null)
                .statusLabel(category.getStatus() != null ? category.getStatus().getLabel() : "Unknown")
                .createdAt(category.getCreatedAt())
                .createdById(createdBy != null ? createdBy.getId() : null)
                .createdByUsername(createdBy != null ? createdBy.getUsername() : null)
                .createdByFullName(info != null ? info.getFullName() : (createdBy != null ? createdBy.getUsername() : "—"))
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
                .orElseGet(() -> accountRepository.findAll().stream().findFirst().orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy tài khoản quản trị hệ thống.")));
    }
}
