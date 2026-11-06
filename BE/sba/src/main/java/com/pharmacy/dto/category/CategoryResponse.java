package com.pharmacy.dto.category;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Short status;
    private String statusLabel;
    private LocalDateTime createdAt;

    // Thông tin người tạo (mapping từ entity Account)
    private Long createdById;
    private String createdByUsername;
    private String createdByFullName;
}
