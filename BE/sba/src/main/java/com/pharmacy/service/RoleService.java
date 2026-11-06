package com.pharmacy.service;

import com.pharmacy.dto.PermissionDto;
import com.pharmacy.dto.RoleDto;

import java.util.List;

public interface RoleService {
    List<RoleDto> getAllRoles();
    List<PermissionDto> getRolePermissions(Integer roleId);
}
