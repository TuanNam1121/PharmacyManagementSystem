package com.pharmacy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ShiftAlreadyOpenException extends RuntimeException {
    public ShiftAlreadyOpenException(String message) {
        super(message);
    }
}
