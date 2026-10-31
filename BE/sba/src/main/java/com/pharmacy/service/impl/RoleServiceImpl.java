package com.pharmacy.service.impl;

import com.pharmacy.dto.PermissionDto;
import com.pharmacy.dto.RoleDto;
import com.pharmacy.entity.Permission;
import com.pharmacy.entity.RolePermission;
import com.pharmacy.repository.RolePermissionRepository;
import com.pharmacy.repository.RoleRepository;
import com.pharmacy.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> {
                    List<RolePermission> rps = rolePermissionRepository.findAllByRoleIdWithPermission(r.getId());
                    List<String> permCodes = rps.stream()
                            .map(rp -> rp.getPermission().getCode())
                            .collect(Collectors.toList());
                    List<PermissionDto> permDetails = rps.stream()
                            .map(rp -> {
                                Permission p = rp.getPermission();
                                return PermissionDto.builder()
                                        .id(p.getId())
                                        .code(p.getCode())
                                        .module(p.getModule())
                                        .description(p.getDescription())
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return RoleDto.builder()
                            .id(r.getId())
                            .code(r.getCode())
                            .name(r.getName())
                            .description(r.getDescription())
                            .permissions(permCodes)
                            .permissionDetails(permDetails)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getRolePermissions(Integer roleId) {
        List<RolePermission> rps = rolePermissionRepository.findAllByRoleIdWithPermission(roleId);
        return rps.stream()
                .map(rp -> {
                    Permission p = rp.getPermission();
                    return PermissionDto.builder()
                            .id(p.getId())
                            .code(p.getCode())
                            .module(p.getModule())
                            .description(p.getDescription())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
