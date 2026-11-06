package com.pharmacy.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductUpdateRequest {

    @Size(max = 50, message = "Mã vạch tối đa 50 ký tự")
    private String barcode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 250, message = "Tên sản phẩm tối đa 250 ký tự")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 30, message = "Đơn vị tính tối đa 30 ký tự")
    private String unit;

    @Size(max = 250, message = "Hoạt chất tối đa 250 ký tự")
    private String activeIngredient;

    @Size(max = 200, message = "Hãng sản xuất tối đa 200 ký tự")
    private String manufacturer;

    private Boolean isPrescription;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private BigDecimal costPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal sellingPrice;

    private Integer minQuantity;

    private String description;

    @Size(max = 500, message = "Đường dẫn hình ảnh tối đa 500 ký tự")
    private String imageUrl;

    private Short status;

    @NotNull(message = "Danh mục sản phẩm không được để trống")
    private Long categoryId;

    private String priceReason;
}
