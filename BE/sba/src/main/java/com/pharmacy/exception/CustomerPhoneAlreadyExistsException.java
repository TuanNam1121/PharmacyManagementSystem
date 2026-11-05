package com.pharmacy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CustomerPhoneAlreadyExistsException extends RuntimeException {
    public CustomerPhoneAlreadyExistsException(String message) {
        super(message);
    }
}
