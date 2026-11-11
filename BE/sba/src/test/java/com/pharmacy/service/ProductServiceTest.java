package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.*;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.PriceHistory;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.enums.CategoryStatus;
import com.pharmacy.entity.enums.ProductStatus;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.PriceHistoryRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.repository.ProductUnitRepository;
import com.pharmacy.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private PriceHistoryRepository priceHistoryRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private ProductUnitRepository productUnitRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Account sampleAdmin;
    private Category sampleCategory;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleAdmin = new Account();
        sampleAdmin.setId(1L);
        sampleAdmin.setUsername("admin");
        AccountInformation adminInfo = new AccountInformation();
        adminInfo.setFullName("He Thong Admin");
        sampleAdmin.setAccountInformation(adminInfo);

        sampleCategory = new Category();
        sampleCategory.setId(5L);
        sampleCategory.setName("Giam dau - Ha sot");
        sampleCategory.setStatus(CategoryStatus.ACTIVE);

        sampleProduct = new Product();
        sampleProduct.setId(50L);
        sampleProduct.setBarcode("8934567890123");
        sampleProduct.setName("Paracetamol 500mg");
        sampleProduct.setUnit("Hop");
        sampleProduct.setActiveIngredient("Paracetamol");
        sampleProduct.setManufacturer("Dược Hậu Giang");
        sampleProduct.setIsPrescription(false);
        sampleProduct.setCostPrice(new BigDecimal("30000.00"));
        sampleProduct.setSellingPrice(new BigDecimal("45000.00"));
        sampleProduct.setMinQuantity(20);
        sampleProduct.setStatus(ProductStatus.ACTIVE);
        sampleProduct.setCategory(sampleCategory);
        sampleProduct.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("TC-PROD-01: Thêm mới sản phẩm hợp lệ kèm tự động ghi nhận lịch sử giá (UC13, UC15)")
    void createProduct_Success() {
        // Arrange
        ProductCreateRequest request = new ProductCreateRequest();
        request.setBarcode("8934567890123");
        request.setName("Paracetamol 500mg");
        request.setUnit("Hop");
        request.setCategoryId(5L);
        request.setCostPrice(new BigDecimal("30000.00"));
        request.setSellingPrice(new BigDecimal("45000.00"));
        request.setPriceReason("Khởi tạo sản phẩm mới");

        when(productRepository.existsByBarcode("8934567890123")).thenReturn(false);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(sampleCategory));
        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        // Act
        ProductResponse response = productService.createProduct(request);

        // Assert
        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals("Paracetamol 500mg", response.getName());
        assertEquals("8934567890123", response.getBarcode());
        assertEquals(new BigDecimal("45000.00"), response.getSellingPrice());

        verify(productRepository).save(any(Product.class));
        verify(priceHistoryRepository).save(any(PriceHistory.class));
    }

    @Test
    @DisplayName("TC-PROD-02: Thêm sản phẩm thất bại khi mã vạch barcode đã tồn tại (UC13)")
    void createProduct_ThrowsDuplicate_WhenBarcodeExists() {
        // Arrange
        ProductCreateRequest request = new ProductCreateRequest();
        request.setBarcode("8934567890123");
        request.setName("Thuoc bi trung barcode");

        when(productRepository.existsByBarcode("8934567890123")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("Mã vạch '8934567890123' đã tồn tại"));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("TC-PROD-03: Thêm sản phẩm thất bại khi danh mục không tồn tại (UC13)")
    void createProduct_ThrowsNotFound_WhenCategoryNotFound() {
        // Arrange
        ProductCreateRequest request = new ProductCreateRequest();
        request.setBarcode("999999999");
        request.setName("Thuoc khong danh muc");
        request.setCategoryId(999L);

        when(productRepository.existsByBarcode("999999999")).thenReturn(false);
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("TC-PROD-04: Cập nhật thông tin sản phẩm và tự động ghi nhận thay đổi giá vào PriceHistory (UC14, UC15)")
    void updateProduct_Success_WithPriceHistory() {
        // Arrange
        ProductUpdateRequest request = new ProductUpdateRequest();
        request.setName("Paracetamol 500mg Extra");
        request.setUnit("Hop");
        request.setCategoryId(5L);
        request.setBarcode("8934567890123");
        request.setCostPrice(new BigDecimal("35000.00")); // thay đổi giá
        request.setSellingPrice(new BigDecimal("50000.00")); // thay đổi giá
        request.setPriceReason("Nhập hàng lô mới giá tăng");

        when(productRepository.findByIdWithCategory(50L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.existsByBarcodeAndIdNot("8934567890123", 50L)).thenReturn(false);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(sampleCategory));
        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        // Act
        ProductResponse response = productService.updateProduct(50L, request);

        // Assert
        assertNotNull(response);
        assertEquals("Paracetamol 500mg Extra", sampleProduct.getName());
        assertEquals(new BigDecimal("35000.00"), sampleProduct.getCostPrice());
        assertEquals(new BigDecimal("50000.00"), sampleProduct.getSellingPrice());

        verify(productRepository).save(sampleProduct);
        verify(priceHistoryRepository).save(any(PriceHistory.class));
    }

    @Test
    @DisplayName("TC-PROD-05: Cập nhật sản phẩm thất bại khi trùng barcode với sản phẩm khác (UC14)")
    void updateProduct_ThrowsDuplicate_WhenBarcodeCollides() {
        // Arrange
        ProductUpdateRequest request = new ProductUpdateRequest();
        request.setBarcode("8939999999999");

        when(productRepository.findByIdWithCategory(50L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.existsByBarcodeAndIdNot("8939999999999", 50L)).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> productService.updateProduct(50L, request));
        assertTrue(ex.getMessage().contains("đã tồn tại cho sản phẩm khác"));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("TC-PROD-06: Cập nhật sản phẩm thất bại khi sản phẩm ID không tồn tại (UC14)")
    void updateProduct_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        ProductUpdateRequest request = new ProductUpdateRequest();
        when(productRepository.findByIdWithCategory(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.updateProduct(999L, request));
    }

    @Test
    @DisplayName("TC-PROD-07: Điều chỉnh bảng giá sản phẩm chuyên biệt qua updateProductPrice (UC16)")
    void updateProductPrice_Success() {
        // Arrange
        ProductPriceUpdateRequest request = ProductPriceUpdateRequest.builder()
                .costPrice(new BigDecimal("32000.00"))
                .sellingPrice(new BigDecimal("48000.00"))
                .effectiveFrom(LocalDateTime.now())
                .reason("Điều chỉnh theo chính sách quý IV")
                .build();

        when(productRepository.findByIdWithCategory(50L)).thenReturn(Optional.of(sampleProduct));
        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        // Act
        ProductResponse response = productService.updateProductPrice(50L, request);

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("32000.00"), sampleProduct.getCostPrice());
        assertEquals(new BigDecimal("48000.00"), sampleProduct.getSellingPrice());

        verify(productRepository).save(sampleProduct);
        verify(priceHistoryRepository).save(any(PriceHistory.class));
    }

    @Test
    @DisplayName("TC-PROD-08: Điều chỉnh bảng giá thất bại khi sản phẩm không tồn tại (UC16)")
    void updateProductPrice_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        ProductPriceUpdateRequest request = ProductPriceUpdateRequest.builder()
                .costPrice(new BigDecimal("10000.00"))
                .sellingPrice(new BigDecimal("15000.00"))
                .reason("Test")
                .build();

        when(productRepository.findByIdWithCategory(404L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.updateProductPrice(404L, request));
        verify(priceHistoryRepository, never()).save(any(PriceHistory.class));
    }

    @Test
    @DisplayName("TC-PROD-09: Xem chi tiết thông tin sản phẩm (UC12)")
    void getProductDetail_Success() {
        // Arrange
        when(productRepository.findByIdWithCategory(50L)).thenReturn(Optional.of(sampleProduct));

        // Act
        ProductDetailResponse detail = productService.getProductDetail(50L);

        // Assert
        assertNotNull(detail);
        assertEquals(50L, detail.getId());
        assertEquals("Paracetamol 500mg", detail.getName());
        assertEquals("Giam dau - Ha sot", detail.getCategoryName());
        assertEquals("Active", detail.getStatusLabel());
    }

    @Test
    @DisplayName("TC-PROD-10: Xem chi tiết sản phẩm thất bại khi ID không tồn tại (UC12)")
    void getProductDetail_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        when(productRepository.findByIdWithCategory(404L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.getProductDetail(404L));
    }

    @Test
    @DisplayName("TC-PROD-11: Cập nhật trạng thái sản phẩm sang Inactive (UC12)")
    void updateProductStatus_Success() {
        // Arrange
        when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        // Act
        productService.updateProductStatus(50L, (short) 0);

        // Assert
        assertEquals(ProductStatus.INACTIVE, sampleProduct.getStatus());
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("TC-PROD-12: Xóa mềm sản phẩm khi đã có giao dịch phát sinh (UC12)")
    void deleteProduct_SoftDelete_Success() {
        // Arrange
        when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.countTransactionReferences(50L)).thenReturn(2L);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        // Act
        String result = productService.deleteProduct(50L);

        // Assert
        assertTrue(result.contains("Ngừng kinh doanh (Inactive)"));
        assertEquals(ProductStatus.INACTIVE, sampleProduct.getStatus());
        verify(productRepository).save(sampleProduct);
        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    @DisplayName("TC-PROD-13: Xóa hoàn toàn sản phẩm khi chưa phát sinh giao dịch nào (UC12)")
    void deleteProduct_HardDelete_Success() {
        // Arrange
        when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.countTransactionReferences(50L)).thenReturn(0L);

        // Act
        String result = productService.deleteProduct(50L);

        // Assert
        assertTrue(result.contains("xóa hoàn toàn khỏi cơ sở dữ liệu"));
        verify(priceHistoryRepository).deleteByProductId(50L);
        verify(productRepository).delete(sampleProduct);
        verify(productRepository, never()).save(sampleProduct);
    }

    @Test
    @DisplayName("TC-PROD-14: Xem toàn bộ lịch sử giá sắp xếp theo thời gian mới nhất (UC15)")
    void getPriceHistories_Success() {
        // Arrange
        PriceHistory history = new PriceHistory();
        history.setId(1L);
        history.setProduct(sampleProduct);
        history.setCostPrice(new BigDecimal("28000.00"));
        history.setSellingPrice(new BigDecimal("42000.00"));
        history.setEffectiveFrom(LocalDateTime.now().minusDays(10));
        history.setReason("Gia cu");
        history.setCreatedAt(LocalDateTime.now().minusDays(10));
        history.setAccount(sampleAdmin);

        when(productRepository.existsById(50L)).thenReturn(true);
        when(priceHistoryRepository.findByProductIdWithAccount(50L))
                .thenReturn(List.of(history));

        // Act
        List<PriceHistoryResponse> histories = productService.getPriceHistories(50L);

        // Assert
        assertNotNull(histories);
        assertEquals(1, histories.size());
        assertEquals(new BigDecimal("42000.00"), histories.get(0).getSellingPrice());
        assertEquals("Gia cu", histories.get(0).getReason());
        assertEquals("He Thong Admin", histories.get(0).getAccountFullName());
    }

    @Test
    @DisplayName("TC-PROD-15: Xem lịch sử giá thất bại khi sản phẩm không tồn tại (UC15)")
    void getPriceHistories_ThrowsNotFound_WhenProductInvalid() {
        // Arrange
        when(productRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.getPriceHistories(999L));
        verify(priceHistoryRepository, never()).findByProductIdWithAccount(anyLong());
    }

    @Test
    @DisplayName("TC-PROD-16: Lấy danh sách sản phẩm có phân trang và bộ lọc (UC12)")
    void getProducts_Success() {
        // Arrange
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findProductsWithFilters(eq("Paracetamol"), eq(ProductStatus.ACTIVE), eq(5L), any(Pageable.class)))
                .thenReturn(page);

        // Act
        PageResponse<ProductResponse> result = productService.getProducts(
                "Paracetamol", (short) 1, 5, 0, 10, "createdAt", "desc"
        );

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Paracetamol 500mg", result.getContent().get(0).getName());
        assertEquals("8934567890123", result.getContent().get(0).getBarcode());
    }
}
