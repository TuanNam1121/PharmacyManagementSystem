package com.pharmacy.security;

import com.pharmacy.entity.Account;
import com.pharmacy.entity.enums.AccountStatus;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Account account;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Account account) {
        this.account = account;
        String roleCode = "USER";
        if (account.getRole() != null && account.getRole().getCode() != null) {
            roleCode = account.getRole().getCode();
        }
        if (!roleCode.startsWith("ROLE_")) {
            roleCode = "ROLE_" + roleCode;
        }
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleCode));
    }

    public Long getId() {
        return account.getId();
    }

    public String getEmail() {
        return account.getEmail();
    }

    public String getFullName() {
        if (account.getAccountInformation() != null && account.getAccountInformation().getFullName() != null) {
            return account.getAccountInformation().getFullName();
        }
        return account.getUsername();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return account.getPassword();
    }

    @Override
    public String getUsername() {
        return account.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return account.getStatus() != null && account.getStatus() != AccountStatus.LOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return account.getStatus() == AccountStatus.ACTIVE;
    }
}

