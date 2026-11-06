package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PermissionDto;
import com.pharmacy.dto.RoleDto;
import com.pharmacy.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management", description = "APIs for querying roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "Get list of user roles with associated permissions")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
    }

    @GetMapping("/{id}/permissions")
    @Operation(summary = "Get permissions for a specific role")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getRolePermissions(@PathVariable Integer id) {
        List<PermissionDto> permissions = roleService.getRolePermissions(id);
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", permissions));
    }
}
