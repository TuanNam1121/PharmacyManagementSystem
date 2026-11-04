package com.pharmacy;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptGenTest {
    @Test
    void generateHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH_Password@123=" + encoder.encode("Password@123"));
        System.out.println("HASH_123456=" + encoder.encode("123456"));
    }
}

