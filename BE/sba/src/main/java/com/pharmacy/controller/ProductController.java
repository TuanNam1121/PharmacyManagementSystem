package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.product.PriceHistoryResponse;
import com.pharmacy.dto.product.ProductCreateRequest;
import com.pharmacy.dto.product.ProductDetailResponse;
import com.pharmacy.dto.product.ProductPriceUpdateRequest;
import com.pharmacy.dto.product.ProductResponse;
import com.pharmacy.dto.product.ProductUnitDto;
import com.pharmacy.dto.product.ProductUpdateRequest;
import com.pharmacy.service.ProductService;
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
@RequestMapping("/api/v1/product")
@CrossOrigin(origins = "*")
@Tag(name = "Product Management", description = "APIs for managing products and price histories")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Tạo mới sản phẩm")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm thành công", response));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @Operation(summary = "Cập nhật thông tin sản phẩm")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", response));
    }

    @PutMapping("/{id}/price")
    @Operation(summary = "Cập nhật giá sản phẩm và lưu lịch sử giá (Set/Update Product Price)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductPrice(
            @PathVariable Long id,
            @Valid @RequestBody ProductPriceUpdateRequest request) {
        ProductResponse response = productService.updateProductPrice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giá sản phẩm thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết sản phẩm")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductDetail(
            @PathVariable Long id) {
        ProductDetailResponse response = productService.getProductDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", response));
    }

    @GetMapping
    @Operation(summary = "Xem danh sách sản phẩm (phân trang, tìm kiếm, lọc)")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<ProductResponse> response = productService.getProducts(
                keyword, status, categoryId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Thay đổi trạng thái sản phẩm (Active/Inactive/Discontinued)")
    public ResponseEntity<ApiResponse<Void>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Short status) {
        productService.updateProductStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái sản phẩm thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa hoặc vô hiệu hóa sản phẩm")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        String message = productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @GetMapping("/{id}/price-history")
    @Operation(summary = "Tra cứu lịch sử giá của sản phẩm (UC15)")
    public ResponseEntity<ApiResponse<List<PriceHistoryResponse>>> getPriceHistories(
            @PathVariable Long id) {
        List<PriceHistoryResponse> histories = productService.getPriceHistories(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giá thành công", histories));
    }

    @GetMapping("/{id}/units")
    @Operation(summary = "Lấy danh sách quy cách đơn vị bán lẻ của sản phẩm (viên, vỉ, hộp...)")
    public ResponseEntity<ApiResponse<List<ProductUnitDto>>> getProductUnits(@PathVariable Long id) {
        List<ProductUnitDto> units = productService.getProductUnits(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quy cách thành công", units));
    }

    @PostMapping("/{id}/units")
    @Operation(summary = "Thêm quy cách đơn vị mới cho sản phẩm")
    public ResponseEntity<ApiResponse<ProductUnitDto>> addProductUnit(
            @PathVariable Long id,
            @Valid @RequestBody ProductUnitDto unitDto) {
        ProductUnitDto created = productService.addProductUnit(id, unitDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm quy cách mới thành công", created));
    }

    @PutMapping("/{id}/units/{unitId}")
    @Operation(summary = "Cập nhật thông tin một quy cách đơn vị")
    public ResponseEntity<ApiResponse<ProductUnitDto>> updateProductUnit(
            @PathVariable Long id,
            @PathVariable Long unitId,
            @Valid @RequestBody ProductUnitDto unitDto) {
        ProductUnitDto updated = productService.updateProductUnit(id, unitId, unitDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quy cách thành công", updated));
    }

    @DeleteMapping("/{id}/units/{unitId}")
    @Operation(summary = "Xóa một quy cách đơn vị (không xóa base unit)")
    public ResponseEntity<ApiResponse<Void>> deleteProductUnit(
            @PathVariable Long id,
            @PathVariable Long unitId) {
        productService.deleteProductUnit(id, unitId);
        return ResponseEntity.ok(ApiResponse.success("Xóa quy cách thành công", null));
    }

    @PutMapping("/{id}/units")
    @Operation(summary = "Đồng bộ toàn bộ danh sách quy cách đơn vị của sản phẩm")
    public ResponseEntity<ApiResponse<List<ProductUnitDto>>> syncProductUnits(
            @PathVariable Long id,
            @RequestBody List<ProductUnitDto> units) {
        List<ProductUnitDto> updatedUnits = productService.syncProductUnits(id, units);
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ danh sách quy cách thành công", updatedUnits));
    }
}
