package com.pharmacy.entity.converter;

import com.pharmacy.entity.enums.AccountStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AccountStatusConverter extends BaseEnumConverter<AccountStatus, Short> {
    public AccountStatusConverter() {
        super(AccountStatus.class);
    }
}
