package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.account.AccountCreateRequest;
import com.pharmacy.dto.account.AccountDetailResponse;
import com.pharmacy.dto.account.AccountResponse;
import com.pharmacy.dto.account.AccountUpdateRequest;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Permission;
import com.pharmacy.entity.Role;
import com.pharmacy.entity.RolePermission;
import com.pharmacy.entity.enums.AccountStatus;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountInformationRepository;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.RolePermissionRepository;
import com.pharmacy.repository.RoleRepository;
import com.pharmacy.service.impl.AccountServiceImpl;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountInformationRepository accountInformationRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountServiceImpl accountService;

    private Account sampleAccount;
    private AccountInformation sampleInfo;
    private Role sampleRole;

    @BeforeEach
    void setUp() {
        sampleRole = new Role();
        sampleRole.setId(1);
        sampleRole.setCode("ADMIN");
        sampleRole.setName("System Administrator");
        sampleRole.setDescription("Full system access");

        sampleAccount = new Account();
        sampleAccount.setId(10L);
        sampleAccount.setUsername("admin_user");
        sampleAccount.setEmail("admin@pharmacy.com");
        sampleAccount.setPhone("0912345678");
        sampleAccount.setPassword("hashed_pwd");
        sampleAccount.setStatus(AccountStatus.ACTIVE);
        sampleAccount.setFailedLoginCount(0);
        sampleAccount.setCreatedAt(LocalDateTime.now());
        sampleAccount.setRole(sampleRole);

        sampleInfo = new AccountInformation();
        sampleInfo.setId(10L);
        sampleInfo.setAccount(sampleAccount);
        sampleInfo.setFullName("Nguyen Van Quan Tri");
        sampleInfo.setDateOfBirth(LocalDate.of(1988, 10, 20));
        sampleInfo.setGender((short) 1);
        sampleInfo.setAddress("789 Hai Ba Trung, Ha Noi");
        sampleInfo.setAvatarUrl("https://image.com/avatar.png");

        sampleAccount.setAccountInformation(sampleInfo);
    }

    @Test
    @DisplayName("TC-ACC-01: Thêm người dùng mới thành công với dữ liệu hợp lệ (UC07)")
    void createAccount_Success() {
        // Arrange
        AccountCreateRequest request = new AccountCreateRequest();
        request.setUsername("staff_new");
        request.setEmail("staff@pharmacy.com");
        request.setPhone("0988776655");
        request.setPassword("Secret@123");
        request.setFullName("Tran Thi Nhan Vien");
        request.setRoleId(1);

        when(accountRepository.existsByUsername("staff_new")).thenReturn(false);
        when(accountRepository.existsByEmail("staff@pharmacy.com")).thenReturn(false);
        when(accountRepository.existsByPhone("0988776655")).thenReturn(false);
        when(roleRepository.findById(1)).thenReturn(Optional.of(sampleRole));
        when(passwordEncoder.encode("Secret@123")).thenReturn("encoded_secret");

        Account saved = new Account();
        saved.setId(20L);
        saved.setUsername("staff_new");
        saved.setEmail("staff@pharmacy.com");
        saved.setPhone("0988776655");
        saved.setStatus(AccountStatus.ACTIVE);
        saved.setRole(sampleRole);

        when(accountRepository.save(any(Account.class))).thenReturn(saved);

        // Act
        AccountResponse response = accountService.createAccount(request);

        // Assert
        assertNotNull(response);
        assertEquals("staff_new", response.getUsername());
        assertEquals("staff@pharmacy.com", response.getEmail());
        verify(passwordEncoder).encode("Secret@123");
        verify(accountRepository).save(any(Account.class));
        verify(accountInformationRepository).save(any(AccountInformation.class));
    }

    @Test
    @DisplayName("TC-ACC-02: Thêm người dùng thất bại khi username đã tồn tại (UC07)")
    void createAccount_ThrowsDuplicate_WhenUsernameExists() {
        // Arrange
        AccountCreateRequest request = new AccountCreateRequest();
        request.setUsername("admin_user");
        request.setEmail("other@pharmacy.com");

        when(accountRepository.existsByUsername("admin_user")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.createAccount(request));
        assertTrue(ex.getMessage().contains("Username 'admin_user' already exists"));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("TC-ACC-03: Thêm người dùng thất bại khi email đã tồn tại (UC07)")
    void createAccount_ThrowsDuplicate_WhenEmailExists() {
        // Arrange
        AccountCreateRequest request = new AccountCreateRequest();
        request.setUsername("new_user");
        request.setEmail("admin@pharmacy.com");

        when(accountRepository.existsByUsername("new_user")).thenReturn(false);
        when(accountRepository.existsByEmail("admin@pharmacy.com")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.createAccount(request));
        assertTrue(ex.getMessage().contains("Email 'admin@pharmacy.com' already exists"));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("TC-ACC-04: Thêm người dùng thất bại khi số điện thoại đã tồn tại (UC07)")
    void createAccount_ThrowsDuplicate_WhenPhoneExists() {
        // Arrange
        AccountCreateRequest request = new AccountCreateRequest();
        request.setUsername("unique_user");
        request.setEmail("unique@pharmacy.com");
        request.setPhone("0912345678");

        when(accountRepository.existsByUsername("unique_user")).thenReturn(false);
        when(accountRepository.existsByEmail("unique@pharmacy.com")).thenReturn(false);
        when(accountRepository.existsByPhone("0912345678")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.createAccount(request));
        assertTrue(ex.getMessage().contains("Phone number '0912345678' already exists"));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("TC-ACC-05: Thêm người dùng thất bại khi Role ID không tồn tại (UC07)")
    void createAccount_ThrowsNotFound_WhenRoleNotFound() {
        // Arrange
        AccountCreateRequest request = new AccountCreateRequest();
        request.setUsername("unique_user");
        request.setEmail("unique@pharmacy.com");
        request.setRoleId(999);

        when(accountRepository.existsByUsername("unique_user")).thenReturn(false);
        when(accountRepository.existsByEmail("unique@pharmacy.com")).thenReturn(false);
        when(roleRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> accountService.createAccount(request));
        assertTrue(ex.getMessage().contains("Role not found with ID: 999"));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("TC-ACC-06: Cập nhật thông tin người dùng thành công (UC09)")
    void updateAccount_Success() {
        // Arrange
        AccountUpdateRequest request = new AccountUpdateRequest();
        request.setEmail("admin_updated@pharmacy.com");
        request.setPhone("0987654321");
        request.setFullName("Nguyen Van Quan Tri Cap Nhat");
        request.setAddress("456 Tran Phu, Da Nang");

        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.existsByEmailAndIdNot("admin_updated@pharmacy.com", 10L)).thenReturn(false);
        when(accountRepository.existsByPhoneAndIdNot("0987654321", 10L)).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        // Act
        AccountResponse response = accountService.updateAccount(10L, request);

        // Assert
        assertNotNull(response);
        assertEquals("admin_updated@pharmacy.com", sampleAccount.getEmail());
        assertEquals("0987654321", sampleAccount.getPhone());
        assertEquals("Nguyen Van Quan Tri Cap Nhat", sampleAccount.getAccountInformation().getFullName());
        verify(accountRepository).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-07: Cập nhật người dùng thất bại khi ID không tồn tại (UC09)")
    void updateAccount_ThrowsNotFound_WhenIdNotFound() {
        // Arrange
        AccountUpdateRequest request = new AccountUpdateRequest();
        when(accountRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> accountService.updateAccount(999L, request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("TC-ACC-08: Cập nhật người dùng thất bại khi trùng email người khác (UC09)")
    void updateAccount_ThrowsDuplicate_WhenEmailExistsForOtherUser() {
        // Arrange
        AccountUpdateRequest request = new AccountUpdateRequest();
        request.setEmail("existed@pharmacy.com");

        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.existsByEmailAndIdNot("existed@pharmacy.com", 10L)).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.updateAccount(10L, request));
        assertTrue(ex.getMessage().contains("already exists for another account"));
    }

    @Test
    @DisplayName("TC-ACC-09: Cập nhật người dùng thất bại khi trùng SĐT người khác (UC09)")
    void updateAccount_ThrowsDuplicate_WhenPhoneExistsForOtherUser() {
        // Arrange
        AccountUpdateRequest request = new AccountUpdateRequest();
        request.setEmail("admin@pharmacy.com");
        request.setPhone("0999999999");

        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.existsByEmailAndIdNot("admin@pharmacy.com", 10L)).thenReturn(false);
        when(accountRepository.existsByPhoneAndIdNot("0999999999", 10L)).thenReturn(true);

        // Act & Assert
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.updateAccount(10L, request));
        assertTrue(ex.getMessage().contains("Phone number '0999999999' already exists for another account"));
    }

    @Test
    @DisplayName("TC-ACC-10: Phân quyền gán vai trò cho người dùng (UC08)")
    void assignRole_Success() {
        // Arrange
        Role managerRole = new Role();
        managerRole.setId(2);
        managerRole.setCode("MANAGER");
        managerRole.setName("Pharmacy Manager");

        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(roleRepository.findById(2)).thenReturn(Optional.of(managerRole));
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        // Act
        AccountResponse response = accountService.assignRole(10L, 2);

        // Assert
        assertNotNull(response);
        assertEquals(managerRole, sampleAccount.getRole());
        verify(accountRepository).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-11: Thu hồi bỏ vai trò của người dùng (UC08 - roleId null)")
    void assignRole_ClearRole_WhenRoleIdIsNull() {
        // Arrange
        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        // Act
        AccountResponse response = accountService.assignRole(10L, null);

        // Assert
        assertNotNull(response);
        assertNull(sampleAccount.getRole());
        verify(accountRepository).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-12: Xem chi tiết người dùng kèm danh sách permissions (UC06)")
    void getAccountDetail_Success() {
        // Arrange
        Permission p1 = new Permission();
        p1.setCode("USER_VIEW");
        RolePermission rp1 = new RolePermission();
        rp1.setPermission(p1);

        Permission p2 = new Permission();
        p2.setCode("PRODUCT_VIEW");
        RolePermission rp2 = new RolePermission();
        rp2.setPermission(p2);

        when(accountRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(sampleAccount));
        when(rolePermissionRepository.findAllByRoleIdWithPermission(1)).thenReturn(List.of(rp1, rp2));

        // Act
        AccountDetailResponse detail = accountService.getAccountDetail(10L);

        // Assert
        assertNotNull(detail);
        assertEquals(10L, detail.getId());
        assertEquals("admin_user", detail.getUsername());
        assertEquals("Nguyen Van Quan Tri", detail.getFullName());
        assertEquals(2, detail.getPermissions().size());
        assertTrue(detail.getPermissions().contains("USER_VIEW"));
        assertTrue(detail.getPermissions().contains("PRODUCT_VIEW"));
    }

    @Test
    @DisplayName("TC-ACC-13: Xem chi tiết người dùng thất bại khi ID không tồn tại (UC06)")
    void getAccountDetail_ThrowsNotFound_WhenIdInvalid() {
        // Arrange
        when(accountRepository.findByIdWithDetails(404L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> accountService.getAccountDetail(404L));
    }

    @Test
    @DisplayName("TC-ACC-14: Khóa tài khoản người dùng thành công (UC10)")
    void updateAccountStatus_LockAccount_Success() {
        // Arrange
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        // Act
        accountService.updateAccountStatus(10L, (short) 2, "Vi phạm chính sách bảo mật");

        // Assert
        assertEquals(AccountStatus.LOCKED, sampleAccount.getStatus());
        verify(accountRepository).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-15: Mở khóa tài khoản người dùng thành công (UC10)")
    void updateAccountStatus_UnlockAccount_Success() {
        // Arrange
        sampleAccount.setStatus(AccountStatus.LOCKED);
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        // Act
        accountService.updateAccountStatus(10L, (short) 1);

        // Assert
        assertEquals(AccountStatus.ACTIVE, sampleAccount.getStatus());
        verify(accountRepository).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-16: Cập nhật trạng thái người dùng với mã trạng thái không hợp lệ (UC10)")
    void updateAccountStatus_ThrowsException_WhenStatusCodeInvalid() {
        // Arrange
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> accountService.updateAccountStatus(10L, (short) 99));
        verify(accountRepository, never()).save(sampleAccount);
    }

    @Test
    @DisplayName("TC-ACC-17: Lấy danh sách người dùng có phân trang và bộ lọc (UC06)")
    void getAccounts_Success() {
        // Arrange
        Page<Account> page = new PageImpl<>(List.of(sampleAccount));
        when(accountRepository.findAccountsWithFilters(eq("admin"), eq(AccountStatus.ACTIVE), eq(1), any(Pageable.class)))
                .thenReturn(page);

        // Act
        PageResponse<AccountResponse> result = accountService.getAccounts(
                "admin", (short) 1, 1, 0, 10, "createdAt", "desc"
        );

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("admin_user", result.getContent().get(0).getUsername());
        assertEquals("ADMIN", result.getContent().get(0).getRoleCode());
    }
}
