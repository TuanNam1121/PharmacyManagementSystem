package com.pharmacy.service;

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
import com.pharmacy.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Account sampleAdmin;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleAdmin = new Account();
        sampleAdmin.setId(1L);
        sampleAdmin.setUsername("admin");
        AccountInformation adminInfo = new AccountInformation();
        adminInfo.setFullName("He Thong Admin");
        sampleAdmin.setAccountInformation(adminInfo);

        sampleCategory = new Category();
        sampleCategory.setId(100L);
        sampleCategory.setName("Khang sinh");
        sampleCategory.setDescription("Nhom thuoc khang sinh dieu tri vi khuan");
        sampleCategory.setStatus(CategoryStatus.ACTIVE);
        sampleCategory.setCreatedAt(LocalDateTime.now());
        sampleCategory.setCreatedBy(sampleAdmin);
    }

    @Test
    @DisplayName("TC-CAT-01: Lấy toàn bộ danh sách nhóm danh mục (UC17)")
    void getCategories_Success() {
        // Arrange
        when(categoryRepository.findAll()).thenReturn(List.of(sampleCategory));

        // Act
        List<CategoryResponse> list = categoryService.getCategories();

        // Assert
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Khang sinh", list.get(0).getName());
        assertEquals("Active", list.get(0).getStatusLabel());
        assertEquals("He Thong Admin", list.get(0).getCreatedByFullName());
        verify(categoryRepository).findAll();
    }

    @Test
    @DisplayName("TC-CAT-02: Thêm mới nhóm danh mục thành công (UC18)")
    void createCategory_Success() {
        // Arrange
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("Thuoc giam dau");
        request.setDescription("Cac loai giam dau ha sot");
        request.setStatus((short) 1);

        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));

        Category saved = new Category();
        saved.setId(101L);
        saved.setName("Thuoc giam dau");
        saved.setDescription("Cac loai giam dau ha sot");
        saved.setStatus(CategoryStatus.ACTIVE);
        saved.setCreatedBy(sampleAdmin);
        saved.setCreatedAt(LocalDateTime.now());

        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        // Act
        CategoryResponse response = categoryService.createCategory(request);

        // Assert
        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Thuoc giam dau", response.getName());
        assertEquals((short) 1, response.getStatus());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("TC-CAT-03: Cập nhật thông tin danh mục thành công (UC19)")
    void updateCategory_Success() {
        // Arrange
        CategoryUpdateRequest request = new CategoryUpdateRequest();
        request.setName("Khang sinh pho rong");
        request.setDescription("Mo ta cap nhat");
        request.setStatus((short) 1);

        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(sampleCategory);

        // Act
        CategoryResponse response = categoryService.updateCategory(100L, request);

        // Assert
        assertNotNull(response);
        assertEquals("Khang sinh pho rong", sampleCategory.getName());
        assertEquals("Mo ta cap nhat", sampleCategory.getDescription());
        verify(categoryRepository).save(sampleCategory);
    }

    @Test
    @DisplayName("TC-CAT-04: Cập nhật danh mục thất bại khi ID không tồn tại (UC19)")
    void updateCategory_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        CategoryUpdateRequest request = new CategoryUpdateRequest();
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> categoryService.updateCategory(999L, request));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("TC-CAT-05: Không cho phép đổi trạng thái sang Inactive khi vẫn còn sản phẩm Active (UC20)")
    void updateCategory_ThrowsIllegalState_WhenActiveProductsExist() {
        // Arrange
        CategoryUpdateRequest request = new CategoryUpdateRequest();
        request.setName("Khang sinh");
        request.setStatus((short) 0); // 0 là Inactive

        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsByCategoryIdAndStatus(100L, ProductStatus.ACTIVE)).thenReturn(true);

        // Act & Assert
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> categoryService.updateCategory(100L, request));
        assertTrue(ex.getMessage().contains("vẫn còn sản phẩm đang hoạt động"));
        verify(categoryRepository, never()).save(sampleCategory);
    }

    @Test
    @DisplayName("TC-CAT-06: Đổi trạng thái danh mục sang Inactive thành công khi không còn sản phẩm Active (UC20)")
    void updateCategoryStatus_ToInactive_Success_WhenNoActiveProducts() {
        // Arrange
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsByCategoryIdAndStatus(100L, ProductStatus.ACTIVE)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(sampleCategory);

        // Act
        categoryService.updateCategoryStatus(100L, (short) 0); // 0 là Inactive

        // Assert
        assertEquals(CategoryStatus.INACTIVE, sampleCategory.getStatus());
        verify(categoryRepository).save(sampleCategory);
    }

    @Test
    @DisplayName("TC-CAT-07: Cập nhật trạng thái danh mục với mã trạng thái không hợp lệ (UC20)")
    void updateCategoryStatus_ThrowsException_WhenInvalidCode() {
        // Arrange
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> categoryService.updateCategoryStatus(100L, (short) 99));
        verify(categoryRepository, never()).save(sampleCategory);
    }

    @Test
    @DisplayName("TC-CAT-08: Xóa danh mục khi có sản phẩm liên kết -> Chuyển Inactive bảo toàn dữ liệu (UC20)")
    void deleteCategory_SoftDelete_WhenCategoryHasProducts() {
        // Arrange
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsByCategoryId(100L)).thenReturn(true);
        when(categoryRepository.save(any(Category.class))).thenReturn(sampleCategory);

        // Act
        String result = categoryService.deleteCategory(100L);

        // Assert
        assertTrue(result.contains("Ngừng hoạt động (Inactive)"));
        assertEquals(CategoryStatus.INACTIVE, sampleCategory.getStatus());
        verify(categoryRepository).save(sampleCategory);
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    @DisplayName("TC-CAT-09: Xóa danh mục khi chưa có sản phẩm liên kết -> Xóa vật lý (UC20)")
    void deleteCategory_HardDelete_WhenCategoryHasNoProducts() {
        // Arrange
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsByCategoryId(100L)).thenReturn(false);

        // Act
        String result = categoryService.deleteCategory(100L);

        // Assert
        assertTrue(result.contains("xóa hoàn toàn khỏi cơ sở dữ liệu"));
        verify(categoryRepository).delete(sampleCategory);
        verify(categoryRepository, never()).save(sampleCategory);
    }

    @Test
    @DisplayName("TC-CAT-10: Xóa danh mục thất bại khi ID không tồn tại (UC20)")
    void deleteCategory_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> categoryService.deleteCategory(999L));
        verify(categoryRepository, never()).delete(any(Category.class));
    }
}
